# Project Behavior Rules: Ralph Loop & Autonomy

This workspace utilizes the Ralph Loop context engineering methodology.

## Rules for Agents:
1. **Memory Externalization**: 
   - Maintain and update a local file called `progress.txt` at the root of the project to track active tasks, pending tasks, and completion states.
   - Read this file at the start of your turn to regain exact context.
   - Write state updates back to this file before finishing your turn.
2. **Atomic Execution**:
   - Only execute one sub-task at a time to prevent context window degradation ("context rot").
   - Confirm completion of the current step in the `progress.txt` before moving on to the next.
3. **Structured planning**:
   - Save high-level designs in `.planning/PRD.md` or similar specification documents.
