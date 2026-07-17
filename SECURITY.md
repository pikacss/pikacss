# Security Policy

## Supported versions

PikaCSS is pre-1.0. Until 1.0.0 is released, only the latest published
`0.0.x` release receives security fixes. Once 1.0.0 ships, the latest minor of
the current major line will be supported.

| Version | Supported |
| ------- | --------- |
| latest `0.0.x` | ✅ |
| older | ❌ |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately through GitHub's ["Report a vulnerability"](https://github.com/pikacss/pikacss/security/advisories/new)
flow (Security → Advisories). Include a description, affected package(s) and
version(s), and a minimal reproduction if possible.

You can expect an initial acknowledgement within a few days. Once a fix is
prepared, a patched release is published and the advisory is disclosed with
credit to the reporter (unless anonymity is requested).

## Scope

PikaCSS is a build-time CSS-in-JS engine and bundler integration. The most
relevant classes of issues are: arbitrary code execution via config or plugin
loading, path traversal in scanning/codegen output, and denial of service in
the compiler. Runtime output is static CSS/JS with no embedded secrets.
