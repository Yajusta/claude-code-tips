# -*- coding: utf-8 -*-
"""
Claude Status Line Generator

Generates a status line displaying:
- Model and API URL
- Current directory and Git branch
- Context usage (tokens used/limit)
- Response duration
"""

import contextlib
import io
import json
import os
import re
import sys
import time
from datetime import datetime
from typing import Optional, Tuple, Dict, Any
from urllib.parse import urlparse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Configuration constants
CONTEXT_LIMIT = 200_000 # 200k tokens
MAX_STDIN_SIZE = 10_485_760  # 10MB
CONTEXT_HIGH_THRESHOLD = 90.0
CONTEXT_MEDIUM_THRESHOLD = 65.0
COLOR_HIGH = 31  # Red
COLOR_MEDIUM = 33  # Orange
COLOR_NONE = 0  # No color


def validate_stdin_input(input_data: str) -> None:
    """
    Validate stdin input for security reasons.

    Args:
        input_data: Raw input string from stdin

    Raises:
        SystemExit: If input validation fails
    """
    if len(input_data) > MAX_STDIN_SIZE:
        print(f"Error: Input too large (max {MAX_STDIN_SIZE:,} bytes)")
        sys.exit(1)


def parse_json_input(input_data: str) -> Dict[str, Any]:
    """
    Parse and validate JSON input from stdin.

    Args:
        input_data: Raw JSON string from stdin

    Returns:
        Parsed JSON data dictionary

    Raises:
        SystemExit: If JSON parsing fails
    """
    try:
        data = json.loads(input_data)
        required_keys = ["model", "workspace", "transcript_path"]
        for key in required_keys:
            if key not in data:
                print(f"Error: Missing required key '{key}' in JSON input")
                sys.exit(1)
        return data
    except json.JSONDecodeError as e:
        print(f"Error JSON parsing: {e}")
        sys.exit(1)


def extract_base_host(value: Optional[str]) -> Optional[str]:
    """
    Extract base host from URL or return None if invalid.

    Args:
        value: URL string or None

    Returns:
        Base host string or None
    """
    if not isinstance(value, str):
        return None

    if not value:
        return None

    candidate = value.strip()
    if not candidate:
        return None

    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", candidate):
        candidate = f"https://{candidate}"

    parsed = urlparse(candidate)
    if parsed.netloc:
        return parsed.netloc

    if parsed.path and (stripped_path := parsed.path.lstrip("/")):
        return stripped_path.split("/", 1)[0]

    return None


def get_git_branch() -> str:
    """
    Extract current Git branch name from .git/HEAD.

    Returns:
        Git branch name formatted with emoji, or empty string if not in a git repo
    """
    if not os.path.exists(".git"):
        return ""

    try:
        with open(".git/HEAD", "r") as f:
            ref = f.read().strip()
            if ref.startswith("ref: refs/heads/"):
                return f" (🌿 {ref.replace('ref: refs/heads/', '')})"
    except (OSError, IOError):
        pass

    return ""


def parse_transcript_usage(transcript_path: str, initial_model: str) -> Tuple[int, float, float, bool, str]:
    """
    Parse transcript file to extract usage information.

    Args:
        transcript_path: Path to the transcript file
        initial_model: Initial model name from input data

    Returns:
        Tuple of (context_used_tokens, answer_timestamp, question_timestamp, is_running, final_model)
    """
    context_used_tokens = 0
    answer_timestamp = time.time()
    question_timestamp = time.time()
    is_running = True
    final_model = initial_model

    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            is_running = len(lines) > 0

            # Read file in reverse order to find latest relevant messages
            for idx in range(len(lines) - 1, -1, -1):
                line = lines[idx].strip()
                if not line:
                    continue

                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue

                # Skip summary messages and check if conversation ended
                if obj.get("type") in ["summary", "file-history-snapshot"]:
                    is_running = False
                    continue

                # Find latest assistant message with usage info
                if (obj.get("type") == "assistant" and
                    "message" in obj and
                    "usage" in obj["message"]):

                    usage = obj["message"]["usage"]
                    input_tokens = usage.get("input_tokens", 0)
                    cache_creation_input_tokens = usage.get("cache_creation_input_tokens", 0)
                    cache_read_input_tokens = usage.get("cache_read_input_tokens", 0)
                    output_tokens = usage.get("output_tokens", 0)

                    context_used_tokens = (
                        input_tokens + cache_creation_input_tokens +
                        cache_read_input_tokens + output_tokens
                    )

                    answer_timestamp = obj.get("timestamp", answer_timestamp)

                    # Update model if available in message
                    if obj["message"].get("model"):
                        final_model = obj["message"]["model"]

                    # Check if conversation ended
                    if obj["message"].get("stop_reason") == "end_turn":
                        is_running = False

                    # Find the latest user message before this assistant message
                    for j in range(idx - 1, -1, -1):
                        prev_line = lines[j].strip()
                        if not prev_line:
                            continue

                        try:
                            prev_obj = json.loads(prev_line)
                        except json.JSONDecodeError:
                            continue

                        if (prev_obj.get("type") == "user" and
                            "message" in prev_obj and
                            "toolUseResult" not in prev_obj):
                            question_timestamp = prev_obj.get("timestamp", question_timestamp)
                            break

                    break  # We have all information needed

    except (OSError, IOError, json.JSONDecodeError):
        # If we can't read the transcript, return default values
        pass

    return context_used_tokens, answer_timestamp, question_timestamp, is_running, final_model


def calculate_response_duration(answer_timestamp: Any, question_timestamp: Any) -> float:
    """
    Calculate response duration between question and answer timestamps.

    Args:
        answer_timestamp: Answer timestamp (string ISO format or numeric)
        question_timestamp: Question timestamp (string ISO format or numeric)

    Returns:
        Duration in seconds
    """
    try:
        if isinstance(answer_timestamp, str) and isinstance(question_timestamp, str):
            answer_dt = datetime.fromisoformat(answer_timestamp.replace("Z", "+00:00"))
            question_dt = datetime.fromisoformat(question_timestamp.replace("Z", "+00:00"))
            return (answer_dt - question_dt).total_seconds()
        elif isinstance(answer_timestamp, (int, float)) and isinstance(question_timestamp, (int, float)):
            return answer_timestamp - question_timestamp
    except (ValueError, TypeError):
        pass

    return 0.0


def get_context_color(percentage: float) -> int:
    """
    Get color code based on context usage percentage.

    Args:
        percentage: Context usage percentage (0-100)

    Returns:
        ANSI color code
    """
    if percentage > CONTEXT_HIGH_THRESHOLD:
        return COLOR_HIGH
    elif percentage > CONTEXT_MEDIUM_THRESHOLD:
        return COLOR_MEDIUM
    return COLOR_NONE


def get_base_url() -> Optional[str]:
    """
    Get base URL from environment variable or settings file.

    Returns:
        Base URL string or None
    """
    # Prioritize environment variable
    env_url = os.getenv("ANTHROPIC_BASE_URL")
    base_url = extract_base_host(env_url)

    if base_url is None:
        # Fallback to settings file
        settings_path = os.path.expanduser("~/.claude/settings.json")
        if os.path.exists(settings_path):
            try:
                with open(settings_path, "r", encoding="utf-8") as f:
                    settings = json.load(f)
                base_url = extract_base_host(settings.get("anthropic_base_url"))
            except (OSError, IOError, json.JSONDecodeError):
                pass

    return base_url


# Main execution starts here
def main() -> None:
    """
    Main function to generate and print the status line.
    """
    # Read and validate input
    input_data = sys.stdin.read().strip()
    if not input_data:
        print("Error: stdin is empty")
        sys.exit(1)

    # Validate input size for security
    validate_stdin_input(input_data)

    # Parse JSON input
    data = parse_json_input(input_data)

    # Extract basic information
    model = data["model"]["display_name"]
    current_dir = os.path.basename(data["workspace"]["current_dir"])
    transcript_path = data["transcript_path"]

    # Get Git branch
    git_branch = get_git_branch()

    # Parse transcript usage information
    (context_used_tokens, answer_timestamp, question_timestamp,
     is_running, final_model) = parse_transcript_usage(transcript_path, model)

    # Use final model from transcript if available
    if final_model != model:
        model = final_model

    # Calculate response duration
    response_duration = calculate_response_duration(answer_timestamp, question_timestamp)
    readable_duration = time.strftime("%M:%S", time.gmtime(response_duration))

    # Get base URL
    base_url = get_base_url() or "unknown"

    # Calculate context percentage and color
    context_percentage = (context_used_tokens / CONTEXT_LIMIT) * 100
    color_code = get_context_color(context_percentage)

    # Format running status
    running_txt = " (running)" if is_running else ""

    # Generate and print status line
    print(
        f"[{model}@{base_url}] 📂 {current_dir}{git_branch} | "
        f"📊 Context: "
        f"\033[{color_code}m{context_percentage:.1f}% ({context_used_tokens:,}/{CONTEXT_LIMIT:,} tokens)\033[0m"
        f" | ⏱️ Answer duration: {readable_duration}{running_txt}"
    )


if __name__ == "__main__":
    main()