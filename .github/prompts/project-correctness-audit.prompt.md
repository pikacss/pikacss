---
description: "Audit this workspace for project correctness by checking source consistency, test alignment, documentation accuracy, and translation parity; save findings under .audit, delegate investigation to subagents, and fix issues through handleIssue"
name: "Project Correctness Audit"
argument-hint: "[optional focus, scope, or constraints]"
agent: "agent"
---

Audit the current workspace for project correctness.

Follow this workflow strictly:

1. Run `auditSourceCode`.
2. If issues are found, handle each issue before continuing.
3. Run `auditTests`.
4. If issues are found, handle each issue before continuing.
5. Run `auditDocumentation`.
6. If issues are found, handle each issue before continuing.
7. Run `auditDocumentationTranslation`.
8. If issues are found, handle each issue before continuing.
9. End with a concise workflow summary.

Operating rules:

- If any requirement, tradeoff, or fix direction is ambiguous, use #tool:vscode_askQuestions before making the change.
- Follow the delegation rule strictly: every audit phase must be delegated to a subagent, and every issue-handling step must also be delegated to a subagent.
- Use subagents for broad read-only exploration, cross-file comparison, issue analysis, and implementation work. Use the subagent result as the required input to the next action.
- During analysis, only read the generated context file for the current phase. Do not read repository files directly until implementation work is required.
- Store all workflow artifacts under `.audit/`. Create the directory if it does not exist.
- Save each issue as `.audit/issue_{issue_id}.txt`.
- Never edit generated files in `dist/` or `coverage/`.
- Never run `pnpm build`.
- Keep all file content written by this workflow in English.
- Keep the final chat response concise and action-oriented.

Definitions:

`runWorkflow()`
- Execute the four audit phases in order.
- Do not skip a later phase just because an earlier phase had issues.
- For each phase, first delegate the audit to a subagent, then delegate each discovered issue to a subagent through `handleIssue`.
- Handle discovered issues phase by phase.

`delegateSubagent(task)`
- Choose a suitable subagent for the current task.
- Use investigation-oriented subagents for audit and analysis work.
- Use implementation-capable subagents for `handleIssue` work.
- Return a structured result with findings, affected files, actions taken, and recommended next actions.

`saveIssueToFile(issue)`
- Save one file per issue using `.audit/issue_{issue_id}.txt`.
- Include: title, phase, severity, affected files, relevant code or doc snippets, explanation, possible fix options, and current status.

`handleIssue(issue)`
- Analyze the issue and identify the safest fix options.
- Ask the user which option to apply whenever there is more than one reasonable resolution, any tradeoff, or any behavior change.
- Apply the selected adjustment by delegating the implementation work to a subagent.
- Update the corresponding issue file with the chosen solution, actions taken, validation result, and current status.
- Return whether the issue was resolved, deferred, or blocked.

`auditSourceCode()`
- Build a source-only AI context from this repository.
- Delegate this audit to a subagent.
- Inspect implementation consistency across packages, public APIs, internal types, and package boundaries.
- Focus on contradictions, invalid assumptions, dead integration paths, incompatible types, and behavior mismatches.
- Save every discovered issue file before returning the issue list and phase summary.

`auditTests()`
- Build a source-code context and a tests context.
- Delegate this audit to a subagent.
- Compare tests against real implementation behavior.
- Focus on missing coverage for important behavior, outdated assertions, incorrect assumptions, broken fixture usage, and missing downstream verification when core behavior changes.
- Save every discovered issue file before returning the issue list and phase summary.

`auditDocumentation()`
- Build a source-code context and a documentation context.
- Delegate this audit to a subagent.
- Exclude translated documentation from this phase.
- Compare docs against actual implementation and configuration behavior.
- Focus on missing features, outdated examples, wrong defaults, invalid setup steps, and unsupported claims.
- Save every discovered issue file before returning the issue list and phase summary.

`auditDocumentationTranslation()`
- Build an English documentation context and a translated documentation context.
- Delegate this audit to a subagent.
- Compare translated docs against the source-language docs for missing sections, semantic drift, outdated terminology, and omitted warnings or constraints.
- Save every discovered issue file before returning the issue list and phase summary.

`prepareAIContext(type)`
- Run `./scripts/prepare-audit-context.sh <type>` from the repository root.
- Use the shared `pnpm repopack` defaults extracted into `package.json` as the baseline behavior.
- Override include, ignore, and output settings per audit phase inside the script instead of relying on `repomix.config.json`.
- Write generated context files under `.audit/` using deterministic filenames and overwrite them on each run.
- Treat the generated file path as the returned AI context artifact for the current phase.

Context guidance by type:

- `sourceCode`: run `./scripts/prepare-audit-context.sh sourceCode` to write `.audit/source-code-context.txt`.
- `tests`: run `./scripts/prepare-audit-context.sh tests` to write `.audit/tests-context.txt`.
- `documentation`: run `./scripts/prepare-audit-context.sh documentation` to write `.audit/documentation-context.txt`.
- `documentationTranslation`: run `./scripts/prepare-audit-context.sh documentationTranslation` to write `.audit/documentation-translation-context.txt`.

Expected behavior:

- Report each phase result clearly.
- If no issues are found in a phase, say so explicitly.
- If issues are found, save them first, then process them one by one through `handleIssue`, and keep artifact files updated throughout the workflow.
- End with: overall status, unresolved items, and any follow-up validation that should be run.

Optional user input:

- If the user provides extra scope in `$ARGUMENTS`, treat it as audit constraints or focus areas.
- Examples: `only packages/core and integration`, `focus on docs and translations`, `prefer minimal fixes`, `skip test execution and do static review only`.
