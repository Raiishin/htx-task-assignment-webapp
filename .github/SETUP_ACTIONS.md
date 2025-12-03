# GitHub Actions Setup Guide

This document explains how to set up and use the GitHub Actions CI/CD workflows for this project.

## Prerequisites

1. Push your code to a GitHub repository
2. GitHub Actions is enabled by default for all repositories
3. No additional configuration or secrets required (tests use mocked APIs)

## Workflows Overview

### 1. Test Workflow (`test.yml`)

**Purpose:** Run all unit tests automatically

**Triggers:**
- Every push to `main` branch
- Every pull request to `main` branch

**What it does:**
- Sets up PostgreSQL database for backend tests
- Runs 25 backend tests
- Runs 11 frontend tests
- Generates coverage reports
- Uploads coverage as artifacts (available for 7 days)

**Viewing Results:**
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Click on a workflow run
4. View test results in each job
5. Download coverage reports from **Artifacts** section

### 2. Build Workflow (`build.yml`)

**Purpose:** Verify that all components build successfully

**Triggers:**
- Every push to `main` branch
- Every pull request to `main` branch

**What it does:**
- Builds backend TypeScript to JavaScript
- Builds frontend Next.js production bundle
- Builds Docker images for both services
- Uses GitHub Actions cache for faster builds

**Why it's important:**
- Catches build-time errors before deployment
- Verifies Docker images can be created
- Ensures production builds work

### 3. Lint Workflow (`lint.yml`)

**Purpose:** Enforce code quality and consistency

**Triggers:**
- Every push to `main` branch
- Every pull request to `main` branch

**What it does:**
- Runs TypeScript compiler checks on backend
- Runs Next.js ESLint on frontend
- Runs TypeScript compiler checks on frontend

**Why it's important:**
- Catches type errors
- Enforces code style
- Prevents common bugs

## Setting Up Badges

The README.md includes status badges. To make them work:

1. Find these lines in `README.md`:
   ```markdown
   ![Tests](https://github.com/YOUR_USERNAME/htx-task-assignment/actions/workflows/test.yml/badge.svg)
   ![Build](https://github.com/YOUR_USERNAME/htx-task-assignment/actions/workflows/build.yml/badge.svg)
   ![Lint](https://github.com/YOUR_USERNAME/htx-task-assignment/actions/workflows/lint.yml/badge.svg)
   ```

2. Replace `YOUR_USERNAME` with your GitHub username or organization name

3. Commit and push the changes

The badges will automatically update to show the status of each workflow.

## Running Workflows Manually

You can also run workflows manually:

1. Go to **Actions** tab
2. Select a workflow from the left sidebar
3. Click **Run workflow** button
4. Select the branch
5. Click **Run workflow**

## Troubleshooting

### Workflow Fails on First Run

**Common Issues:**

1. **PostgreSQL Connection:** The test workflow includes a PostgreSQL service. If tests fail with database errors, check that:
   - The service is healthy before tests run (already configured with health checks)
   - Database URL in workflow matches test expectations

2. **Node Version:** Workflows use Node.js 20. If you need a different version:
   - Edit the `node-version` field in each workflow file
   - Update to '18' or '21' as needed

3. **Dependencies:** If `npm ci` fails:
   - Ensure `package-lock.json` is committed
   - Check for platform-specific dependencies

### Tests Pass Locally But Fail in CI

**Check:**
- Environment variables (test workflows use test values)
- File paths (CI uses Linux, may differ from Windows/Mac)
- Database state (CI starts with fresh database each time)

### Build Workflow Fails

**Common Causes:**
- Missing environment variables in build
- TypeScript errors not caught locally
- Next.js build issues

**Fix:**
- Run `npm run build` locally first
- Ensure all TypeScript errors are resolved
- Check build logs in GitHub Actions

## Optimizations

The workflows include several optimizations:

1. **Dependency Caching:** npm dependencies are cached between runs
2. **Docker Layer Caching:** Docker builds use GitHub Actions cache
3. **Parallel Execution:** Backend and frontend jobs run in parallel
4. **Service Containers:** PostgreSQL runs as a service container

## Local Testing Before Push

Run these commands to ensure CI will pass:

```bash
# Backend
cd backend
npm ci
npm test
npm run build
npx tsc --noEmit

# Frontend
cd frontend
npm ci
npm test
npm run lint
npm run build
npx tsc --noEmit
```

## Monitoring

### Email Notifications

By default, GitHub sends email notifications for:
- Failed workflow runs on your commits
- Successful fixes after failures

Configure in: **GitHub Settings → Notifications → Actions**

### Pull Request Checks

When you create a pull request:
- All workflows run automatically
- PR shows status checks at the bottom
- Green checkmarks = all tests passed
- Red X = something failed
- Click "Details" to see what failed

### Branch Protection Rules (Optional)

To require all tests to pass before merging:

1. Go to **Settings → Branches**
2. Add rule for `main` branch
3. Enable **Require status checks to pass**
4. Select workflows: `Backend Tests`, `Frontend Tests`, `Backend Lint`, etc.
5. Save

Now PRs can only be merged if all tests pass!

## Costs

GitHub Actions is free for:
- Public repositories (unlimited minutes)
- Private repositories (2,000 minutes/month for free accounts)

These workflows typically use:
- Test workflow: ~5-10 minutes per run
- Build workflow: ~3-5 minutes per run
- Lint workflow: ~2-3 minutes per run

**Total per push:** ~10-18 minutes

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Service Containers](https://docs.github.com/en/actions/using-containerized-services)
- [Caching Dependencies](https://docs.github.com/en/actions/guides/caching-dependencies-to-speed-up-workflows)

## Need Help?

If workflows aren't working as expected:

1. Check the **Actions** tab for error messages
2. Review workflow logs (they're very detailed)
3. Compare with this guide
4. Try running commands locally first
5. Check GitHub Actions status page for outages
