# Security Policy

## Supported versions

| Version | Supported               |
| ------- | ----------------------- |
| `0.x`   | Best effort until `1.0` |

## Reporting

Report security issues privately to the repository maintainer (GitHub Security Advisories or the same contact used for NENE2).

Do not open public Issues for undisclosed vulnerabilities.

## Scope notes

This repository provides a **Node.js HTTP framework**. It must not ship secrets, commit `.env` files, or encourage direct database access from AI tools bypassing application boundaries. Framework users are responsible for secret storage, auth configuration, and production hardening.
