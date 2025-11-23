# Claude Code tips

Trucs et astuces concerant l'utilisation de Claude Code.

- [Ligne de statut](#ligne-de-statut)
- [Notifications sonores](#notification-sonore)
- [Retour à la ligne dans l'IDE](#retour-à-la-ligne-dans-lide)
- [Retour à la ligne dans le Terminal Windows](#retour-à-la-ligne-dans-le-terminal-windows)

---

## Ligne de statut

Ce script permet d'afficher en bas de son interface `Claude Code` une barre d'état qui indique des informations utiles :

- Modèle et base URL actuellement utilisé
- Répertoire et branche GIT de travail
- Utilisation du contexte
- Durée de traitement de la dernière réponse

### Capture d'écran

![capture](medias/statusline.png)

### Installation

#### Prérequis

- Avoir `Python` installé et disponible via la commande `python`.

#### Copie du fichier

- Mettre le fichier `claude-statusline.py` dans le répertoire `~/.claude` (exemple : `C:\Users\Yajusta\.claude`).

#### Paramétrage du contexte

- Editer le fichier `claude-statusline.py` et modifier la variable `CONTEXT_LIMIT` pour mettre la taille du contexte du modèle utilisé.

#### Configuration de Claude Code

- Ouvrir le fichier `~/.claude/settings.json` (exemple : `C:\Users\Yajusta\.claude\settings.json`) et cherchez la partie `statusLine`. Si elle n'existe pas, l'ajouter.
- Remplir avec :

```json
  "statusLine": {
    "type": "command",
    "command": "python \"C:\\Users\\Yajusta\\.claude\\claude-statusline.py\""
  }
```

## Notification sonore

Dans le fichier `~/.claude/settings.json` il est possible de paramétrer des "hooks" : des actions effectuées à chaque fois qu'un évènement particulier se produit.
Grâce aux hooks `Notification` et `Stop`, on peut provoquer le fait de jouer un son.

Voici comment faire sous Windows :

- Trouver un fichier `.wav` ou `.mp3` que vous êtes prêt à entendre des milliers de fois.
- Le placer dans un répertoire comme par exemple `C:\Users\Yajusta\Music\`.
- Editer le fichier `~/.claude/settings.json` et ajouter / modifier les hooks `Notification` et `Stop` de la façon suivante :

```json
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"(New-Object Media.SoundPlayer 'C:\\Users\\Yajusta\\Music\\hook-notification.wav').PlaySync()\""
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": []
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -c \"(New-Object Media.SoundPlayer 'C:\\Users\\Yajusta\\Music\\hook-stop.wav').PlaySync()\""
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": []
      }
    ]
  }
  ```

## Retour à la ligne dans l'IDE

Par défaut dans Claude Code, puor faire un retour à la ligne dans un prompt il faut taper `\` puis `Enter`.
Pour que `Shift + Enter` fasse un retour à la ligne dans l'IDE, il faut taper dans Claude la commande `/terminal-setup`. Cela va installer un keybindig pour l'IDE.
Par exemple, cela va ajouter un fichier `%USERPROFILE%\AppData\Roaming\Code\User\keybindings.json` qui contient : 

```json
[
    {
        "key": "shift+enter",
        "command": "workbench.action.terminal.sendSequence",
        "args": {
            "text": "\u001b\r"
        },
        "when": "terminalFocus"
    }
]
```

Si par hasard votre IDE n'est pas reconnu par Claude, mais que c'est un fork de VSCode, il suffit de copier ce keybinding dans le répertoire de l'éditeur.
Par exemple pour `Antigravity`, on ajoute ce keybinding dans `%USERPROFILE%\AppData\Roaming\Antigravity\User\keybindings.json`.

## Retour à la ligne dans le Terminal Windows

Pour configurer le retour à la ligne dans le Terminal Windows, il faut créer un keybinding spécifique : 
- Ouvrir les paramètres du terminal (`Ctrl + ,`).
- Cliquer sur "Ouvrir le fichier JSON". Cela va ouvrir le fichier de configuration dans un éditeur de texte.
- Trouver le tableau `actions` et ajouter l'élément suivant :

```json
{
    "command": 
    {
        "action": "sendInput",
        "input": "\u001b\r"
    }
}
```

- Enregistrer. Le fichier va probablement être modifié par l'application `Terminal` pour ajouter une ligne avec un identifiant unique.
