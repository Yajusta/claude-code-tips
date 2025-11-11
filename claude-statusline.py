# -*- coding: utf-8 -*-
import contextlib
import io
import json
import os
import re
import sys
import time
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Context limit to be adjusted.
CONTEXT_LIMIT = 200_000
# Lire et nettoyer l'entrée JSON depuis stdin
input_data = sys.stdin.read().strip()
if not input_data:
    print("Error : stdin is empty")
    sys.exit(1)

try:
    data = json.loads(input_data)
except json.JSONDecodeError as e:
    print(f"Error JSON parsing: {e}")
    sys.exit(1)

# Extract values
model = data["model"]["display_name"]
current_dir = os.path.basename(data["workspace"]["current_dir"])

# Git branch
git_branch = ""
if os.path.exists(".git"):
    with contextlib.suppress(Exception):
        with open(".git/HEAD", "r") as f:
            ref = f.read().strip()
            if ref.startswith("ref: refs/heads/"):
                git_branch = f" (🌿 {ref.replace('ref: refs/heads/', '')})"
transcript_path = data["transcript_path"]

# Parse transcript to calculate usage
context_used_tokens = 0
answer_timestamp = time.time()
question_timestamp = time.time()
is_running = True
with contextlib.suppress(Exception):
    with open(transcript_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        is_running = len(lines) > 0
        # Read file in reverse order
        for idx in range(len(lines) - 1, -1, -1):
            line = lines[idx].strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            if obj.get("type") in ["summary", "file-history-snapshot"]:
                is_running = False
                continue
            # Step 1: find latest "assistant" message
            if obj.get("type") == "assistant" and "message" in obj and "usage" in obj["message"]:
                usage = obj["message"]["usage"]
                input_tokens = usage.get("input_tokens", 0)
                cache_creation_input_tokens = usage.get("cache_creation_input_tokens", 0)
                cache_read_input_tokens = usage.get("cache_read_input_tokens", 0)
                output_tokens = usage.get("output_tokens", 0)
                context_used_tokens = (
                    input_tokens + cache_creation_input_tokens + cache_read_input_tokens + output_tokens
                )
                answer_timestamp = obj.get("timestamp", answer_timestamp)
                if obj["message"].get("model"):
                    model = obj["message"]["model"]
                if obj["message"].get("stop_reason") == "end_turn":
                    is_running = False
                last_assistant_with_usage = {"index": idx, "obj": obj}

                # Step 2: find latest "user" message from here
                for j in range(idx - 1, -1, -1):
                    prev_line = lines[j].strip()
                    if not prev_line:
                        continue
                    try:
                        prev_obj = json.loads(prev_line)
                    except json.JSONDecodeError:
                        continue

                    if prev_obj.get("type") == "user" and "message" in prev_obj and "toolUseResult" not in prev_obj:
                        question_timestamp = prev_obj.get("timestamp", question_timestamp)
                        break

                break  # We have all information needed


def extract_base_host(value: Optional[str]) -> Optional[str]:
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


# Extract ANTHROPIC_BASE_URL (prioritize environment variable)
env_url = os.getenv("ANTHROPIC_BASE_URL")
base_url = extract_base_host(env_url)

if base_url is None:
    # Fallback to settings file
    settings_path = os.path.expanduser("~/.claude/settings.json")
    if os.path.exists(settings_path):
        with contextlib.suppress(Exception):
            with open(settings_path, "r", encoding="utf-8") as f:
                settings = json.load(f)

            base_url = extract_base_host(settings.get("anthropic_base_url"))

# Response duration
response_duration = 0
if isinstance(answer_timestamp, str) and isinstance(question_timestamp, str):
    try:
        answer_dt = datetime.fromisoformat(answer_timestamp.replace("Z", "+00:00"))
        question_dt = datetime.fromisoformat(question_timestamp.replace("Z", "+00:00"))
        response_duration = (answer_dt - question_dt).total_seconds()
    except Exception:
        response_duration = 0
elif isinstance(answer_timestamp, (int, float)) and isinstance(question_timestamp, (int, float)):
    response_duration = answer_timestamp - question_timestamp
# "MM:SS" format
readable_duration = time.strftime("%M:%S", time.gmtime(response_duration))

running_txt = " (running)" if is_running else ""

context_percentage = (context_used_tokens / CONTEXT_LIMIT) * 100
if context_percentage > 90:
    color_code = 31  # Red
elif context_percentage > 65:
    color_code = 33  # Orange
else:
    color_code = 0  # No particular color

# Print status line
print(
    f"[{model}@{base_url}] 📂 {current_dir}{git_branch} | "
    f"📊 Context: "
    f"\033[{color_code}m{context_percentage:.1f}% ({context_used_tokens:,}/{CONTEXT_LIMIT:,} tokens)\033[0m"
    f" | ⏱️ Answer duration: {readable_duration}{running_txt}"
)
