**Automation & Update Workflow**

This document explains the `Update data from RaidTheory` GitHub Actions workflow, how to run it manually, and alternatives (webhook / repository_dispatch). It also documents the commit strategy used by the workflow.

- **Workflow file:** `.github/workflows/update-data.yml`
- **Schedule:** daily at 03:00 UTC (cron: `0 3 * * *`) and `workflow_dispatch` manual runs.

What the workflow does
- Checkout repository (full history, `fetch-depth: 0`).
- Install Node.js and dependencies (`npm ci`).
- Run `npm run update-data` (this executes `scripts/update-data.mjs`).
- Stage and commit the generated metadata and consolidated JSON files.
- Pushes to `main` if the update script exits with code `0`, otherwise pushes to (or creates) a `data` branch for inspection.

Why this branching behavior
- Successful runs push to `main` so the site and data stay current.
- Failed runs push to `data` so you can inspect the generated artifacts and logs without modifying `main`.

Manual triggers
- From GitHub: open the repository, go to the `Actions` tab, choose `Update data from RaidTheory`, and click `Run workflow`.
- From the CLI (simulate): you can test the update script locally with:

```powershell
npm run update-data
```

Notes about commits and large files
- The workflow stages the following files by default:
  - `src/data/update-metadata.json` (small)
  - `src/data/arc_raiders_all_items.json` (large)
  - `src/data/arc_raiders_categorized.json` (large)
- If you prefer to avoid committing the large generated files to `main`, change the push target to the `data` branch or remove the large files from `git add` in the workflow.

Repository dispatch / webhook alternative
- If you want updates triggered by an external event (e.g., upstream repo changed), you have two options:
  1. Upstream repository can call the GitHub Actions API to dispatch this workflow using `workflow_dispatch` or `repository_dispatch` (requires a token with `repo` scope).
  2. Create a small webhook receiver (server) that listens for upstream push events, then calls GitHub's `actions/workflows/{workflow_id}/dispatches` API to trigger the workflow.

Example: trigger via `repository_dispatch` (curl)

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/<owner>/<repo>/dispatches \
  -d '{"event_type":"raidtheory-update"}'
```

Security notes
- The workflow runs with `GITHUB_TOKEN`. Commits pushed by Actions will appear as `github-actions[bot]`.
- Consider protecting `main` with branch protection rules if you want PRs/reviews for produced changes.

Troubleshooting
- If the workflow does not push changes, check the step logs in the Actions run. The script writes an exit code that the workflow reads to decide the push target.
- If the `data` branch is created by the workflow and you want it removed later, delete it from the GitHub UI or via `git push origin --delete data`.

Contact
- If you want me to change behavior (only commit metadata, always push to `data`, or add artifacts upload), tell me which option you prefer and I will update the workflow.
