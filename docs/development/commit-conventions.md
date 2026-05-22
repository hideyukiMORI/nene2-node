# Commit Message Conventions

nene2-node uses [Conventional Commits](https://www.conventionalcommits.org/). Descriptions are **English** in this repository (international contributors).

## Format

```text
<type>(<optional scope>): <description> (#<issue>)

[optional body]

[optional footer]
```

## Example

```text
docs(governance): add scope and sibling-repo ADR (#1)
```

## Common types

| Type       | Use                                    |
| ---------- | -------------------------------------- |
| `feat`     | New feature                            |
| `fix`      | Bug fix                                |
| `docs`     | Documentation only                     |
| `refactor` | Code change without feature or bug fix |
| `test`     | Test additions or changes              |
| `build`    | Dependency or build setup              |
| `ci`       | CI configuration                       |
| `chore`    | Maintenance                            |

## Breaking changes

Use `!` or a `BREAKING CHANGE:` footer when public package API, CLI, or documented behavior changes incompatibly.
