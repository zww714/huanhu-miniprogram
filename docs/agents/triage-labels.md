# Triage Labels

The engineering skills use five canonical triage roles. Because this repo uses local markdown instead of a hosted issue tracker, record the role as plain text in each issue file.

| Skill role | Local status value | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate the issue |
| `needs-info` | `needs-info` | Waiting for more information from the reporter |
| `ready-for-agent` | `ready-for-agent` | Fully specified and ready for an agent to implement |
| `ready-for-human` | `ready-for-human` | Needs human judgment or manual implementation |
| `wontfix` | `wontfix` | Will not be actioned |

Use this format near the top of local issue files:

```markdown
Status: ready-for-agent
```

If the team later adopts another tracker, update this file instead of changing each skill prompt.
