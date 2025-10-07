# Getting Started with Humane Tech Linter

This guide will help you run the Humane Tech Linter on any public or private GitHub repository—even if you're not a developer!

---

## 1. Open a Terminal

### On Mac
- Click the **Spotlight** icon (🔍) in the top right of your screen.
- Type `Terminal` and press Enter.
- A window with a command prompt will open.

### On Windows
- Press the **Windows key** on your keyboard.
- Type `cmd` or `Command Prompt` and press Enter.
- A window with a command prompt will open.

---

## 2. Install Node.js and Git

- Go to [nodejs.org](https://nodejs.org/) and download the LTS version. Install it by following the prompts.
- Go to [git-scm.com](https://git-scm.com/) and download Git. Install it by following the prompts.
- To check if they're installed, type `node -v` and `git --version` in your terminal. You should see version numbers.

---

## 3. Generate a GitHub Personal Access Token (for private repos)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** (classic)
3. Give it a name (e.g., "Humane Linter")
4. Select the **repo** scope
5. Click **Generate token** and copy it (you won't see it again!)

---

## 4. Set Your Token as an Environment Variable (for private repos)

### On Mac/Linux
Open your terminal and run:
```sh
export GITHUB_TOKEN=your_token_here
```

### On Windows (Command Prompt)
```cmd
set GITHUB_TOKEN=your_token_here
```

Replace `your_token_here` with the token you copied from GitHub.

---

## 5. Run the Linter on a GitHub Repo

In your terminal, run:
```sh
node index.js --github https://github.com/yourusername/your-repo
```
- Replace the URL with the link to the repo you want to scan.
- For private repos, make sure you set your token as described above.

The linter will:
- Download the code
- Scan for deceptive patterns
- Print results to the terminal
- Save a report as `humane-linter-report.json`
- Clean up after itself

---

## 6. View Results in the Web Viewer

- Open the file `web-viewer/index.html` in your browser (double-click it or right-click and choose "Open with" your browser).
- Click the file input and select your `humane-linter-report.json` file.
- See your results in a friendly format!

---

If you get stuck, ask for help or open an issue on GitHub! 
