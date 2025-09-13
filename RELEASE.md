# Release Guide

## How to Release a New Version

### Using GitHub Actions (Recommended)

1. Go to **Actions** tab in GitHub
2. Select **"Publish to NPM"** workflow
3. Click **"Run workflow"** button
4. Fill in the form:
   - **Branch**: Choose branch to publish from (default: `master`)
   - **Version**: Enter version number (e.g., `0.10.5`)
5. Click **"Run workflow"**

GitHub Actions will automatically:

- Run tests
- Build the project
- Check if version already exists
- Update package.json version
- Publish to NPM
- Create Git tag
- Create GitHub release

### Manual Release (if needed)

1. **Update version**:

   ```bash
   npm version patch  # 0.10.4 -> 0.10.5
   ```

2. **Run tests**:

   ```bash
   pnpm test
   pnpm test:integration
   ```

3. **Build and publish**:

   ```bash
   pnpm build
   npm publish
   ```

4. **Create Git tag and push**:
   ```bash
   git tag v0.10.5
   git push origin v0.10.5
   ```

## Prerequisites

- NPM_TOKEN secret must be set in GitHub repository settings
- You must have publish permissions for the `ts-prune` package on NPM

## Version Numbering

- **Patch** (0.10.4 → 0.10.5): Bug fixes, small improvements
- **Minor** (0.10.4 → 0.11.0): New features, backward compatible
- **Major** (0.10.4 → 1.0.0): Breaking changes
