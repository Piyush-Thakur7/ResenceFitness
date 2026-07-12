---
name: get-shit-done
description: Trigger the GSD spec-driven development loop to execute atomic codebase tasks.
---

# Get Shit Done (GSD) Development Workflow

You have activated the GSD spec-driven development flow. Follow these instructions strictly:

## 1. Specification (Spec) Alignment
- Before making any code changes, read the specification file (`SPEC.md` or `.planning/SPEC.md`).
- If no spec exists, ask the user to specify one, or draft a `SPEC.md` outlining the atomic targets, files affected, and verification tests.

## 2. Execution Loop
- Perform modifications to one file or component at a time.
- Verify changes immediately by running compilation or test suites.
- Do not let conversation history grow excessively; write intermediate state progress to `progress.txt` and focus on execution efficiency.

## 3. Completion Checklist
- Verify all requirements in `SPEC.md` are completed.
- Compile and build successfully.
- Present a final delta summary to the user.
