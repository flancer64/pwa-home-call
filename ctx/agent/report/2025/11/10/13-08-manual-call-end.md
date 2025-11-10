# Iteration report

- **Goal:** ensure manual call termination no longer triggers recursive shutdown while preserving automatic loss handling.
- **Actions:**
  - introduced guards that temporarily ignore the next closed peer state when a local shutdown is underway and log only manual terminations.
  - taught `endCall` to mark manual shutdowns and re-used the guard to skip the duplicate closed event that previously recursed.
- **Results:** new shutdown path keeps the app out of the infinite recursion when the user ends a call; accidental disconnects still trigger the expected cleanup path, and a report has been recorded.
