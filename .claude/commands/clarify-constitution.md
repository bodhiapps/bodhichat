---
description: Identify underspecified areas in the project constitution by asking up to 5 highly targeted clarification questions and encoding answers back into the constitution.
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Detect and reduce ambiguity or missing decision points in the project constitution and record the clarifications directly in the constitution file.

Note: This clarification workflow runs when the constitution has `[NEEDS CLARIFICATION]` markers. It helps complete the constitution before starting feature development. Users can also directly edit the constitution file if AI misunderstands their intent.

Execution steps:

1. Run `.specify.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root **once**. Parse JSON payload to get:
   - `CONSTITUTION_FILE` (should be `.specify.specify/memory/constitution.md`)
   - If JSON parsing fails or file not found, abort with error: "Constitution file not found at .specify.specify/memory/constitution.md. Run /constitution first to create the constitution."

2. Load the current constitution file. Perform a structured ambiguity scan for `[NEEDS CLARIFICATION]` markers using this constitution-specific taxonomy. For each category, mark status: Clear / Partial / Missing. Produce an internal coverage map used for prioritization (do not output raw map unless no questions will be asked).

   Constitution-Specific Taxonomy:

   Architectural Principles:
   - Core development philosophy (test-first, library-first, performance-first, etc.)
   - Principle rationale and enforcement mechanisms
   - Principle precedence and conflict resolution

   Technology Constraints:
   - Programming language and version
   - Primary frameworks and libraries
   - Platform targets (web, mobile, desktop, CLI)
   - Database and persistence choices
   - Build tools and packaging

   Development Workflow:
   - Team structure (solo vs team size)
   - Branching strategy (trunk-based, feature branches, etc.)
   - Code review process
   - CI/CD pipeline requirements
   - Release cadence and versioning

   Governance Policies:
   - Constitution amendment process
   - Amendment authority (who can change it)
   - Review frequency
   - Compliance validation
   - Versioning policy for constitution itself

   Detection pattern for markers: `\[NEEDS CLARIFICATION[^\]]*\]`

   For each category with Partial or Missing status (markers present), add a candidate question opportunity unless:
   - Clarification would not materially change development approach
   - Information is better deferred to feature-level decisions

3. Generate (internally) a prioritized queue of candidate clarification questions (maximum 5). Do NOT output them all at once. Apply these constraints:
   - Maximum of 5 total questions across the whole session.
   - Each question must be answerable with EITHER:
     - A short multiple-choice selection (2–5 distinct, mutually exclusive options), OR
     - A short answer (explicitly constrain: "Answer in ≤5 words").
   - Only include questions whose answers materially impact project governance, architecture, or development workflow.
   - Ensure category coverage balance: attempt to cover the highest impact unresolved categories first.
   - Exclude questions already answered or trivial stylistic preferences.
   - Favor clarifications that reduce downstream inconsistency or prevent misaligned feature development.
   - If more than 5 categories remain unresolved, select the top 5 by (Impact × Uncertainty) heuristic.

4. Sequential questioning loop (interactive):
   - Present EXACTLY ONE question at a time.
   - For multiple-choice questions render options as a Markdown table:

     | Option | Description                                 |
     | ------ | ------------------------------------------- | ------------------------------------------------------ |
     | A      | <Option A description>                      |
     | B      | <Option B description>                      |
     | C      | <Option C description>                      | (add D/E as needed up to 5)                            |
     | Short  | Provide a different short answer (≤5 words) | (Include only if free-form alternative is appropriate) |

   - For short-answer style (no meaningful discrete options), output a single line after the question: `Format: Short answer (≤5 words)`.
   - After the user answers:
     - Validate the answer maps to one option or fits the ≤5 word constraint.
     - If ambiguous, ask for a quick disambiguation (count still belongs to same question; do not advance).
     - Once satisfactory, record it in working memory (do not yet write to disk) and move to the next queued question.
   - Stop asking further questions when:
     - All critical ambiguities resolved early (remaining queued items become unnecessary), OR
     - User signals completion ("done", "good", "no more", "stop"), OR
     - You reach 5 asked questions.
   - Never reveal future queued questions in advance.
   - If no valid questions exist at start (no markers detected), immediately report: "No [NEEDS CLARIFICATION] markers found in constitution. The constitution appears complete. If you need to make changes, you can: 1. Directly edit .specify.specify/memory/constitution.md 2. Run /constitution again to regenerate"

5. Integration after EACH accepted answer (incremental update approach):
   - Maintain in-memory representation of the constitution (loaded once at start) plus the raw file contents.
   - For the first integrated answer in this session:
     - Ensure a `## Clarifications` section exists (create it after the highest-level overview section if missing).
     - Under it, create (if not present) a `### Session YYYY-MM-DD` subheading for today.
     - If session already exists for today, append to it (don't create duplicate).
   - Append a bullet line immediately after acceptance: `- Q: <question> → A: <final answer>`.
   - Then immediately apply the clarification to replace the `[NEEDS CLARIFICATION]` marker:
     - Architectural Principle → Replace marker with user's stated principle and expand with rationale if provided.
     - Technology Constraint → Replace marker with specific version/framework/tool choice.
     - Development Workflow → Replace marker with concrete workflow description (team structure, branching, review process).
     - Governance Policy → Replace marker with specific policy (amendment process, review frequency, versioning).
   - If the clarification invalidates an earlier ambiguous statement, replace that statement instead of duplicating; leave no obsolete contradictory text.
   - Save the constitution file AFTER each integration to minimize risk of context loss (atomic overwrite).
   - Preserve formatting: do not reorder unrelated sections; keep heading hierarchy intact.
   - Keep each inserted clarification minimal and concrete (avoid speculative additions beyond user's answer).
   - Update session count metadata: Increment `<!-- Clarification Sessions: N -->` at top of file after session completes.

6. Session tracking and soft limit:
   - At start, read session count from metadata comment: `<!-- Clarification Sessions: N -->`
   - If N >= 3, display warning BEFORE starting questions:

     ```
     ⚠ Warning: This is your <N+1>th clarification session.

     Multiple rounds may indicate:
     - Complex project requirements (valid)
     - AI misunderstanding your inputs (consider manual editing)

     You can directly edit .specify.specify/memory/constitution.md if the AI
     continues to misinterpret your responses.

     Continue with clarification? (yes/no)
     ```

   - If user responds "no", exit gracefully with message about manual editing option.
   - If user responds "yes" or N < 3, proceed with normal questioning.
   - After session completes, increment session count: `<!-- Clarification Sessions: <N+1> -->`
   - No hard limit - user can continue indefinitely if needed.

7. Validation (performed after EACH write plus final pass):
   - Clarifications session contains exactly one bullet per accepted answer (no duplicates).
   - Total asked (accepted) questions ≤ 5.
   - Updated sections contain no lingering `[NEEDS CLARIFICATION]` markers that the new answer was meant to resolve.
   - No contradictory earlier statement remains.
   - Markdown structure valid; only allowed new headings: `## Clarifications`, `### Session YYYY-MM-DD`.
   - Terminology consistency: same canonical term used across all updated sections.

8. Report completion (after questioning loop ends or early termination):
   - Number of questions asked & answered.
   - Path to updated constitution.
   - Sections touched (list names by category: Architectural Principles, Technology Constraints, etc.).
   - Coverage summary table listing each taxonomy category with Status:
     - Resolved (was Partial/Missing and addressed)
     - Clear (already sufficient from start)
     - Deferred (low impact or better suited for feature-level decisions)
     - Outstanding (still Partial/Missing but question quota reached)
   - Count of remaining `[NEEDS CLARIFICATION]` markers (if any).
   - Suggested next command:
     - If no markers remain: `/specify` (start feature development)
     - If markers remain: `/clarify-constitution` (continue clarification) OR manual editing suggestion
   - Example output:

     ```
     Clarification complete. 5 questions answered.

     Sections updated:
     - Architectural Principles (Principle I)
     - Technology Constraints (Language, Framework)
     - Development Workflow

     Constitution updated at: .specify.specify/memory/constitution.md

     Coverage Summary:
     | Category | Status |
     |----------|--------|
     | Architectural Principles | Resolved |
     | Technology Constraints | Resolved |
     | Development Workflow | Resolved |
     | Governance Policies | Outstanding (2 aspects remaining) |

     Remaining [NEEDS CLARIFICATION]: 2

     Next command: /clarify-constitution (to complete Governance) or /specify (proceed with partial)
     ```

Behavior rules:

- If no `[NEEDS CLARIFICATION]` markers found, respond with "No markers found" message and suggest `/specify` or manual editing.
- If constitution file missing, instruct user to run `/constitution` first (do not create a new constitution here).
- Never exceed 5 total asked questions (clarification retries for a single question do not count as new questions).
- Respect user early termination signals ("stop", "done", "proceed").
- If soft limit warning displayed and user chooses to stop, suggest manual editing: "You can directly edit .specify.specify/memory/constitution.md to specify your preferences. The file is plain Markdown. Just replace [NEEDS CLARIFICATION] with your text."
- Preserve all manual edits from previous sessions - only update sections with markers that user clarifies in current session.
- If user struggles to communicate intent (repeated clarifications on same topic), proactively suggest manual editing escape hatch.

Context for prioritization: $ARGUMENTS
