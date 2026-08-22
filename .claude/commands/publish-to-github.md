---
description: Security-scan, commit/push Cura to GitHub, and keep the README, repo About, and GitHub Pages site in sync
---

Repo: https://github.com/baemyungsoo/medapp.git (owner/repo: `baemyungsoo/medapp`, default branch `main`).
Pages URL (when enabled): https://baemyungsoo.github.io/medapp/

**Current state: the repo is intentionally private, and steps 4-6's Pages-related parts are dormant.** GitHub Pages on this plan only works on public repos, and — important gotcha discovered the hard way — a Pages *site* stays publicly served at its github.io URL even after the source repo goes private, so switching back to private does not take it down by itself; it has to be explicitly deleted (`gh api -X DELETE repos/baemyungsoo/medapp/pages`). Do not re-enable Pages, add the demo link back to the README, or set `--homepage`/re-add the `push` trigger in `.github/workflows/deploy-pages.yml` unless the user explicitly asks to make the repo public again.

Perform the following, in order, stopping to report to the user instead of pushing if step 2 finds anything concerning:

## 1. Stage changes
Run `git status` in the project root. If there are uncommitted changes, stage them (`git add -A`) and review `git status` again to confirm only intended files are staged (no build output, no IDE files — `.gitignore` should already exclude these).

## 2. Security scan (must run before every push)
Scan the staged/changed files for anything that shouldn't be public:
- Cloud/API keys and tokens: AWS (`AKIA...`), Google (`AIza...`), Slack (`xox...`), GitHub (`ghp_`, `gho_`, `github_pat_`), and any `-----BEGIN ... PRIVATE KEY-----` blocks.
- Generic hardcoded secrets: variables/fields named `password`, `secret`, `api_key`, `access_token`, `private_key` etc. assigned a literal value.
- Sensitive file types that shouldn't be tracked: `.env*`, `*.keystore`, `*.jks`, `*.p12`, `*.pem`, `key.properties`, `google-services.json`, `GoogleService-Info.plist`, `*.db`/`*.sqlite*` (local app data).
- Anything else that looks like a real credential, personal data dump, or internal-only config.

If anything suspicious is found, **do not push** — remove/untrack it (and add it to `.gitignore` if it's a file type that should never be committed), then re-scan. Report what was found and how it was handled.

## 3. Commit and push
Commit with a message describing what changed, then push to `origin main`. If `origin` isn't configured yet, add it: `git remote add origin https://github.com/baemyungsoo/medapp.git`.

## 4. Keep README.md current
Ensure `README.md` still has, and update if the project has changed enough to make any of these stale:
- Tech badges (Flutter/Dart/SQLite/platform/license) at the top.
- An **About** section describing what the app does and its key features.
- An **Installation**/Getting Started section with clone + `flutter pub get` + run/build commands.
- A **Credits** section (packages used, data sources, fonts, author).
- A **License** section linking to `LICENSE` (MIT).
- Only while the repo is public and Pages is enabled: a Pages demo badge/link near the top pointing at the Pages URL above.

## 5. Keep the GitHub "About" panel current
Using `gh repo edit baemyungsoo/medapp`, ensure the repo has:
- `--description` — a one-line summary matching the README's tagline.
- `--add-topic` — relevant topics (e.g. `flutter`, `dart`, `medication-management`, `healthcare`, `mobile-app`, `offline-first`, `sqlite`, `family-health`).
- `--homepage` — only set this to the Pages URL while the repo is public and Pages is enabled (see note above); otherwise leave it blank.

## 6. GitHub Pages (only if the user asks to make the repo public / re-enable the demo)
Confirm `.github/workflows/deploy-pages.yml` exists (builds `flutter build web` and deploys via `actions/deploy-pages`) and re-add its `push` trigger. Confirm Pages is set to build from GitHub Actions:
```
gh api repos/baemyungsoo/medapp/pages
```
If it 404s, create it: `gh api -X POST repos/baemyungsoo/medapp/pages -f build_type=workflow` (requires the repo to already be public). After pushing, check the workflow ran successfully (`gh run list --workflow=deploy-pages.yml --limit 1`), and report the live Pages URL to the user once deployed.
