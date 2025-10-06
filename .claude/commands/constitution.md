---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

You are updating the project constitution at `.specify/memory/constitution.md`. This file is a TEMPLATE containing placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to (a) collect/derive concrete values, (b) fill the template precisely, and (c) propagate any amendments across dependent artifacts.

Follow this execution flow:

1. Load the existing constitution template at `.specify/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
     **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that - follow the general template. You will update the doc accordingly.

2. Collect/derive values for placeholders:
   - If user input (conversation) supplies a value, use it.
   - If placeholder has sufficient context from repo context (README, docs, prior constitution versions), infer.
   - If neither user input nor repo context provides value: Mark section with [NEEDS CLARIFICATION].
   - Track which sections are marked incomplete (for summary in Step 8).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown ask or mark TODO), `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
   - If version bump type ambiguous, propose reasoning before finalizing.

3. Draft the updated constitution content:
   - Replace every placeholder with concrete text OR [NEEDS CLARIFICATION] marker.
   - Sections marked with [NEEDS CLARIFICATION] indicate missing user input (not AI speculation).
   - Preserve heading hierarchy and comments can be removed once replaced unless they still add clarifying guidance.
   - Do NOT hallucinate or guess content for marked sections (violates NFR-001).
   - Marker placement rules:
     - Valid: In content sections (e.g., `**Language**: [NEEDS CLARIFICATION: version]`)
     - Invalid: In headings (e.g., `### [NEEDS CLARIFICATION]` - not allowed)
     - Include optional hints when helpful (e.g., `[NEEDS CLARIFICATION: FastAPI vs Django]`)
   - Ensure each Principle section: succinct name line, paragraph (or bullet list) capturing non‑negotiable rules, explicit rationale if not obvious.
   - Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations.

4. Consistency propagation checklist (convert prior checklist into active validations):
   - Read `.specify/templates/plan-template.md` and ensure any "Constitution Check" or rules align with updated principles.
   - Read `.specify/templates/spec-template.md` for scope/requirements alignment—update if constitution adds/removes mandatory sections or constraints.
   - Read `.specify/templates/tasks-template.md` and ensure task categorization reflects new or removed principle-driven task types (e.g., observability, versioning, testing discipline).
   - Read each command file in `.specify/templates/commands/*.md` (including this one) to verify no outdated references (agent-specific names like CLAUDE only) remain when generic guidance is required.
   - Read any runtime guidance docs (e.g., `README.md`, `docs/quickstart.md`, or agent-specific guidance files if present). Update references to principles changed.

5. Produce a Sync Impact Report (prepend as an HTML comment at top of the constitution file after update):
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections
   - Removed sections
   - Templates requiring updates (✅ updated / ⚠ pending) with file paths
   - Follow-up TODOs if any placeholders intentionally deferred.

6. Validation before final output:
   - No remaining unexplained bracket tokens.
   - Version line matches report.
   - Dates ISO format YYYY-MM-DD.
   - Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

7. Write the constitution back to `.specify/memory/constitution.md` (overwrite).
   - Include [NEEDS CLARIFICATION] markers if present.
   - Initialize session metadata: `<!-- Clarification Sessions: 0 -->` (if markers exist).
   - If markers exist, prepare /clarify-constitution suggestion for Step 8.

8. Output a final summary to the user with:
   - New version and bump rationale.
   - Count of [NEEDS CLARIFICATION] markers (if any) with affected sections listed.
   - Any files flagged for manual follow-up.
   - Next command:
     - /clarify-constitution (if markers present)
     - /specify (if constitution complete)
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).
   - If markers present, output example:

     ```
     Constitution created at .specify.specify/memory/constitution.md

     Version: 1.0.0 (new constitution)

     ⚠ Incomplete Sections (4):
     - Architectural Principle (Principle I)
     - Framework (Technology Stack)
     - Development Workflow
     - Governance policies

     Next command: /clarify-constitution

     The clarification command will ask targeted questions to complete these sections
     without making assumptions.
     ```

   - If no markers (comprehensive input), output example:

     ```
     Constitution created at .specify.specify/memory/constitution.md

     Version: 1.0.0 (new constitution)

     ✓ All sections complete

     Next command: /specify
     ```

Formatting & Style Requirements:

- Use Markdown headings exactly as in the template (do not demote/promote levels).
- Wrap long rationale lines to keep readability (<100 chars ideally) but do not hard enforce with awkward breaks.
- Keep a single blank line between sections.
- Avoid trailing whitespace.

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

If critical info missing (e.g., ratification date truly unknown), insert `TODO(<FIELD_NAME>): explanation` and include in the Sync Impact Report under deferred items.

Do not create a new template; always operate on the existing `.specify/memory/constitution.md` file.
