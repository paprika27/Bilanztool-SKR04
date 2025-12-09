# 🚀 Build & Deployment Guide

This guide covers building BilanzTool as a Docker image and Tauri executable.

## Prerequisites

### For Both Builds
- **Node.js 18+** – [Download](https://nodejs.org/)
- **npm** – Comes with Node.js

### For Docker
- **Docker** – [Download Docker Desktop](https://www.docker.com/products/docker-desktop)

### For Tauri (Windows Executable)
- **Rust** – [Install from rustup.rs](https://rustup.rs/)
  - Includes Cargo (Rust's package manager)
- **Visual Studio Build Tools 2022** – [Download](https://visualstudio.microsoft.com/downloads/)
  - Required for building Rust on Windows
  - Or install full Visual Studio with C++ workload

---

## 📦 Docker Build & Release

### Build the Docker Image

```bash
# Navigate to project root
cd Bilanztool-SKR04

# Build the image
docker build -t bilanztool-skr04:latest .

# Or with version tag
docker build -t bilanztool-skr04:0.1.0 .
```

### Test Locally

```bash
# Run the container
docker run -p 3000:3000 bilanztool-skr04:latest

# Open in browser: http://localhost:3000
```

### Using Docker Compose (Recommended for Local Testing)

```bash
# Build and run
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop
docker-compose down
```

### Push to Docker Registry

```bash
# Tag for Docker Hub
docker tag bilanztool-skr04:latest yourusername/bilanztool-skr04:latest

# Login to Docker Hub
docker login

# Push
docker push yourusername/bilanztool-skr04:latest
```

Or for other registries (GitHub Container Registry, Azure Container Registry, etc.):

```bash
# GitHub Container Registry
docker tag bilanztool-skr04:latest ghcr.io/paprika27/bilanztool-skr04:latest
docker push ghcr.io/paprika27/bilanztool-skr04:latest
```

---

## 🖥️ Tauri Windows Executable Build

### Initial Setup

```bash
# Install Tauri CLI
npm install -D @tauri-apps/cli@latest

# Install dependencies
npm install
```

### Tauri Test Checkpoint #1: Development Mode

Run the app in development mode to test the Tauri integration:

```bash
npm run tauri-dev
```

This will:
1. Start the Vite dev server (http://localhost:5173)
2. Build and launch the Tauri window
3. Allow hot-reload as you make changes

**What to test:**
- ✅ App window opens correctly
- ✅ Upload Excel file works
- ✅ Navigation between tabs works
- ✅ All features functional

---

### Tauri Test Checkpoint #2: Production Build

```bash
npm run tauri-build
```

This will:
1. Build the React app for production
2. Compile the Rust/Tauri backend
3. Generate:
   - **MSI installer** – `src-tauri/target/release/bundle/msi/BilanzTool_SKR04_0.1.0_x64_en-US.msi`
   - **NSIS installer** – `src-tauri/target/release/bundle/nsis/BilanzTool SKR04_0.1.0_x64-setup.exe`

**What to test:**
- ✅ Installers run without errors
- ✅ Program installs correctly
- ✅ Uninstall process works
- ✅ App launches from installed location
- ✅ File upload still works
- ✅ All calculations correct
- ✅ Printing/export functionality works

---

### Signing the Executable (Optional but Recommended)

For production releases, you may want to code-sign your executable:

```bash
# This requires a code-signing certificate
# Update tauri.conf.json with signing details
```

---

## 📋 Release Checklist

### Before Release
- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Test Docker build locally
- [ ] Test Tauri dev mode
- [ ] Test Tauri production build
- [ ] Test installer on clean Windows system
- [ ] Update CHANGELOG
- [ ] Commit and tag release

### Release Steps

1. **Docker:**
   ```bash
   docker build -t bilanztool-skr04:0.1.0 .
   docker tag bilanztool-skr04:0.1.0 bilanztool-skr04:latest
   docker push bilanztool-skr04:0.1.0
   docker push bilanztool-skr04:latest
   ```

2. **Windows Executable:**
   ```bash
   npm run tauri-build
   ```
   - Distribute the `.msi` or `.exe` files from `src-tauri/target/release/bundle/`

3. **GitHub Release (Optional):**
   ```bash
   # Create release with:
   # - Windows installer (.exe or .msi)
   # - Release notes
   ```

---

## 🔧 Troubleshooting

### Docker Issues

**"Docker daemon is not running"**
- Start Docker Desktop

**Build fails**
- Check Node.js version: `node --version` (need 18+)
- Delete `node_modules` and `dist`, then run `npm install`

### Tauri Issues

**"Cannot find Rust compiler"**
- Install Rust: https://rustup.rs/
- Add to PATH: `C:\Users\<username>\.cargo\bin`

**"Windows build tools not found"**
- Install Visual Studio Build Tools 2022
- Ensure C++ workload is selected

**"Port 5173 already in use"**
- Kill the process: `lsof -i :5173` (macOS/Linux) or `netstat -ano | findstr :5173` (Windows)

**"Failed to find frontend dist"**
- Make sure to run `npm run build` before `npm run tauri-build`

---

## 📊 Distribution Comparison

| Method | Size | Setup | Audience |
|--------|------|-------|----------|
| **Docker** | ~200MB | Docker Desktop | Enterprises, self-hosted |
| **Windows MSI** | ~80MB | Run installer | Business users |
| **Web (current)** | ~1MB | Browser | Anyone with internet |

---

## 📝 Additional Notes

- **Vite Dev Server:** Default port is 5173 (configurable in vite.config.ts)
- **Tauri Window:** Configured in src-tauri/tauri.conf.json
- **Icons:** Add custom icons to `src-tauri/icons/`
- **Auto-updates:** Can be configured in Tauri (see [Tauri docs](https://tauri.app/en/develop/updater/))

---

## 🤝 Support

For issues with specific tools:
- **Tauri:** https://tauri.app/
- **Docker:** https://docs.docker.com/
- **Vite:** https://vitejs.dev/
- **React:** https://react.dev/
