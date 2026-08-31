# Local testing scripts

From the repository root in PowerShell, create the local testing environment:

```powershell
.\scripts\setup-testing-environment.ps1
```

The setup script verifies Node.js 22+, Corepack, and Docker; creates `.env` from `.env.example` when needed; initializes an ignored local Corepack cache; installs workspace dependencies; installs Playwright Chromium; then starts and waits for the local PostgreSQL and Redis containers.

Use the optional flags to skip work already completed:

```powershell
.\scripts\setup-testing-environment.ps1 -SkipDependencies -SkipBrowser
```

Start the development services and keep their logs in the current PowerShell window:

```powershell
.\scripts\start-development.ps1
```

Then open the web/lobby shell at `http://localhost:5173` or the game client at `http://localhost:5174`. Press `Ctrl+C` in the script window to stop the development servers.

Stop the containers while preserving local database data:

```powershell
.\scripts\teardown-testing-environment.ps1
```

To also delete the PostgreSQL and Redis volumes, which permanently removes local test data:

```powershell
.\scripts\teardown-testing-environment.ps1 -RemoveVolumes
```

Run the browser smoke suite after setup:

```powershell
corepack pnpm test:e2e
```
