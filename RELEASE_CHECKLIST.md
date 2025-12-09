# 🎉 Release Checklist & Testing Guide

After the Tauri build completes, follow these steps to test and release your application.

## Pre-Release: Local Testing

### Test Checkpoint #1: Windows Executable Installation
After `npm run tauri-build` completes:

1. **Locate the installer:**
   - MSI Installer: `src-tauri/target/release/bundle/msi/`
   - NSIS Setup: `src-tauri/target/release/bundle/nsis/`

2. **Test installation:**
   ```bash
   # Run the NSIS installer
   ./src-tauri/target/release/bundle/nsis/"BilanzTool SKR04_0.1.0_x64-setup.exe"
   ```

3. **Test the installed app:**
   - ✅ App launches from Start Menu
   - ✅ Can upload Excel file
   - ✅ All tabs work (Bilanz, GuV, Salden, etc.)
   - ✅ Search/filter functions work
   - ✅ Custom account mapping saves correctly
   - ✅ Print/export functionality works
   - ✅ App closes cleanly

4. **Test uninstall:**
   - Control Panel → Programs → Uninstall BilanzTool
   - ✅ App completely removed

---

### Test Checkpoint #2: Docker Verification

The Docker image has been built and tested. To use in production:

```bash
# Tag for release
docker tag bilanztool-skr04:latest bilanztool-skr04:0.1.0

# Test one more time
docker run -p 3000:3000 bilanztool-skr04:0.1.0

# Open http://localhost:3000 and verify
```

---

## Release Checklist

Before releasing, verify:

### Code Quality
- [ ] All tests pass (if any exist)
- [ ] No console errors in browser DevTools
- [ ] No errors in Windows Event Viewer

### Functionality
- [ ] Excel upload works with sample file
- [ ] Bilanz calculations correct
- [ ] GuV calculations correct  
- [ ] Summe/Salden displays all accounts
- [ ] Account mapping persists
- [ ] Search filters work on all tables
- [ ] Print layout looks good

### Windows Installer
- [ ] Installer runs without errors
- [ ] App launches after installation
- [ ] File associations work (optional)
- [ ] Uninstall removes all files
- [ ] No leftover registry entries

### Docker Image
- [ ] Container builds without errors
- [ ] Port 3000 is accessible
- [ ] App loads with sample file
- [ ] Health check passes

---

## Version Bump

Before release, update version numbers:

1. **package.json:**
   ```json
   "version": "0.1.0"
   ```

2. **src-tauri/tauri.conf.json:**
   ```json
   "version": "0.1.0"
   ```

3. **Commit & Tag:**
   ```bash
   git add .
   git commit -m "Release v0.1.0"
   git tag v0.1.0
   git push origin main --tags
   ```

---

## Distribution

### Option 1: GitHub Releases
```bash
# Create release on GitHub
# Upload these files:
# - BilanzTool SKR04_0.1.0_x64-setup.exe
# - BilanzTool_SKR04_0.1.0_x64_en-US.msi
# - Release notes
```

### Option 2: Docker Hub
```bash
# Login
docker login

# Tag and push
docker tag bilanztool-skr04:0.1.0 yourusername/bilanztool-skr04:0.1.0
docker tag bilanztool-skr04:0.1.0 yourusername/bilanztool-skr04:latest

docker push yourusername/bilanztool-skr04:0.1.0
docker push yourusername/bilanztool-skr04:latest
```

### Option 3: Self-hosted
- Host MSI/EXE on your server
- Users download and run installer
- Or deploy Docker container on your infrastructure

---

## Post-Release

### Gather Feedback
- Ask users about:
  - Installation experience
  - Performance
  - Any missing features
  - Bugs or issues

### Monitor
- Check Windows Event Viewer for crashes
- Monitor Docker container logs: `docker logs <container-id>`
- Track error rates if you have analytics

### Plan Updates
- Document known issues
- Plan v0.2.0 improvements
- Consider auto-update mechanism for Windows

---

## Files Generated

After `npm run tauri-build` completes:

```
src-tauri/target/release/
├── bundle/
│   ├── msi/
│   │   └── BilanzTool_SKR04_0.1.0_x64_en-US.msi        ← MSI Installer
│   ├── nsis/
│   │   ├── BilanzTool SKR04_0.1.0_x64-setup.exe        ← EXE Setup
│   │   ├── nsis_installer.nsi
│   │   └── path.nsi
│   └── nsis/
│       └── ...
└── BilanzTool-SKR04.exe                                 ← Standalone Binary
```

---

## Troubleshooting Release Issues

**"Installer fails to install"**
- Check admin privileges
- Verify disk space
- Check Windows Event Viewer for errors

**"App won't launch after install"**
- Check Visual C++ Runtime is installed
- Verify WebView2 runtime is available
- Check firewall settings

**"Docker image too large"**
- Current: ~216MB (acceptable)
- To optimize: Use `.dockerignore` (already done)

---

## What's Next?

After first release:
1. Gather user feedback
2. Fix any critical bugs
3. Plan v0.2.0 features:
   - Auto-update for Windows
   - Web version (no installation needed)
   - Advanced reporting features
   - Multi-language support
