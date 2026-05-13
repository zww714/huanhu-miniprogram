# Domain Docs

This repo is treated as a single-context WeChat mini program project.

## Before exploring

When a skill needs project context, read these files if they exist:

- `CONTEXT.md` at the repo root
- `docs/adr/` for architecture decisions
- `docs/agents/` for agent workflow configuration

If `CONTEXT.md` or `docs/adr/` does not exist, continue silently. Those files can be created later when the project vocabulary and architecture decisions need to be documented.

## Layout

Expected single-context layout:

```text
/
├─ AGENTS.md
├─ CONTEXT.md
├─ docs/
│  ├─ agents/
│  └─ adr/
├─ .scratch/
└─ src/
```

## Vocabulary rule

Use the project's existing names for pages, features, and data concepts. For this repo, examples include:

- 首页
- 发现页
- 我的页面
- 消息页
- 通知列表页
- 技能详情页
- 技能证明详情页
- 我的发布
- 兴趣标签

If a new term is needed, define it in the related PRD or issue before using it across multiple files.

## ADR rule

If a future change conflicts with an ADR in `docs/adr/`, call that out explicitly before implementing.
