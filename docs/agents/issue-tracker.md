# Issue Tracker: Local Markdown

This repo uses WeChat Code Management for Git collaboration, so agent-generated issues, PRDs, and triage results should be stored as markdown files in this repository instead of GitHub Issues.

## Location

- Feature workspace: `.scratch/<feature-slug>/`
- PRD: `.scratch/<feature-slug>/PRD.md`
- Issues: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Triage notes: stored in the related issue file, usually near the top as `Status: <label>`

## Conventions

- Use one directory per feature or workstream.
- Number implementation issues from `01`.
- Keep each issue independently actionable.
- Add conversation history or follow-up notes under a `## Comments` heading.
- Do not require GitHub, GitLab, Jira, or Linear unless this file is updated later.

## When a skill says "publish to the issue tracker"

Create or update markdown files under `.scratch/<feature-slug>/`.

## When a skill says "fetch the ticket"

Read the referenced markdown file path. If the user gives only a short task name, look for a matching folder under `.scratch/`.
