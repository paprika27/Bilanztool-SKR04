# Cleanup of local bundling artifacts

I updated `.gitignore` to ignore Tauri/Rust build outputs and common release artifacts. Some build artifacts (under `src-tauri/target/`) appear to be checked into the repository. I could not safely delete large tracked build artifacts via the automated patch tool, so please run the following commands locally to remove them from the repository and prevent them from being re-added.

Run these commands in your local clone (bash):

```bash
# Remove the tracked target dir from git and stop tracking it, but keep files locally
git rm -r --cached src-tauri/target
# Commit the removal
git commit -m "chore: remove checked-in Tauri/Rust build artifacts from repo and ignore them"
# Push the commit
git push origin main
```

If you also want to delete the files locally (free up disk space), run:

```bash
# Remove target directory locally (optional)
rm -rf src-tauri/target
```

If you accidentally committed large build files in earlier commits and want to purge them from history, consider using `git filter-repo` or the BFG repo-cleaner. Those operations rewrite history and require coordination with other collaborators.

Notes:
- Releases (installers and disk images) are now produced by CI (see `.github/workflows/rust.yml` and `.github/workflows/publish-ghcr.yml`).
- I updated `.gitignore` to prevent these artifacts being re-added.

If you want, I can:
- run the removal locally if you give me access to run git in your environment, or
- prepare a PR that removes specific tracked files (if you prefer I target only certain files instead of the entire `target` dir).
