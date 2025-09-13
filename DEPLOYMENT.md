# Deployment Guide

## Setup

### 1. Configure NPM Token

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Your NPM access token (with publish permissions)
6. Click **"Add secret"**

### 2. Get NPM Access Token

1. Go to [NPM website](https://www.npmjs.com/)
2. Login to your account
3. Go to **Access Tokens** in your profile
4. Click **"Generate New Token"**
5. Select **"Automation"** type
6. Copy the token and add it to GitHub secrets as `NPM_TOKEN`

### 3. Verify Package Permissions

Make sure you have publish permissions for the `ts-prune` package:

```bash
npm access list packages
```

## How to Release

### Using GitHub Actions (Simple)

1. Go to **Actions** tab in GitHub
2. Select **"Publish to NPM"** workflow
3. Click **"Run workflow"** button
4. Fill in:
   - **Branch**: `master` (or any branch)
   - **Version**: `0.10.5` (or any version)
5. Click **"Run workflow"**

That's it! GitHub Actions will handle everything automatically.

## Troubleshooting

- **NPM_TOKEN not found**: Check GitHub repository secrets
- **Permission denied**: Check NPM package permissions
- **Version already exists**: The workflow will skip if version exists
- **Tests failing**: Fix tests before running workflow
- **pnpm not found**: Make sure pnpm is installed locally for development
