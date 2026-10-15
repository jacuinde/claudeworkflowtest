## Agent skills

### Issue tracker

Issues and specs are tracked in this repo's GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Git workflow

`main` is protected: changes reach it only through a pull request with a passing `test` check.

- Start every ticket from an up-to-date `main`: `git switch main && git pull`, then `git switch -c <issue-number>-<short-name>`.
- Add a test for each acceptance criterion. Run `npm test` and `npm run typecheck` before pushing; both must pass.
- Open the PR with `gh pr create`. The description starts with `Closes #<issue>` and maps each acceptance criterion to the test that covers it.
- If the PR shows no checks or is behind `main`, run `gh pr update-branch <number>`, then `git pull` before pushing more commits.
- Never merge a PR and never push to `main`. A human reviews and merges.