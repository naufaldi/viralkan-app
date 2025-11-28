# Husky Lint-Staged Setup - Alternative 2: Fast Commit + Pre-Push Build

## Tasks

### Task IDs (kebab-case with date prefix)

**2025-11-28-install-deps**

- Status: completed
- Description: Install husky and lint-staged packages
- Blocked by: None
- Blocking: None
- Notes: Using Alternative 2 (no @ lint-staged/config needed)

**2025-11-28-init-husky**

- Status: completed
- Description: Initialize husky git hooks in the repository
- Blocked by: 2025-11-28-install-deps
- Blocking: 2025-11-28-configure-lintstaged
- Notes: Run `bunx husky init`

**2025-11-28-configure-lintstaged**

- Status: completed
- Description: Create .lintstagedrc.mjs configuration for staged files only (FAST mode)
- Blocked by: 2025-11-28-init-husky
- Blocking: 2025-11-28-configure-precommit
- Notes: Configure for lint+format only, NO BUILD in pre-commit

**2025-11-28-configure-precommit**

- Status: completed
- Description: Configure .husky/pre-commit hook (fast: 3-5s, lint+format only)
- Blocked by: 2025-11-28-configure-lintstaged
- Blocking: 2025-11-28-configure-prepush
- Notes: No build check, just lint-staged on staged files

**2025-11-28-configure-prepush**

- Status: completed
- Description: Configure .husky/pre-push hook (slow: 40-80s, full build verification)
- Blocked by: 2025-11-28-configure-precommit
- Blocking: 2025-11-28-test-scenario-a
- Notes: Run turbo run build --affected, turbo run lint --affected

**2025-11-28-test-scenario-a**

- Status: completed
- Description: Test Scenario A - Backend changes only
- Blocked by: 2025-11-28-configure-prepush
- Blocking: 2025-11-28-test-scenario-b
- Notes: Verify only API checked on commit, full build on push (1.24s)

**2025-11-28-test-scenario-b**

- Status: completed
- Description: Test Scenario B - Frontend changes only
- Blocked by: 2025-11-28-test-scenario-a
- Blocking: 2025-11-28-test-scenario-c
- Notes: Verify only web checked on commit, full build on push (0.95s)

**2025-11-28-test-scenario-c**

- Status: completed
- Description: Test Scenario C - Lint violations and auto-fix
- Blocked by: 2025-11-28-test-scenario-b
- Blocking: 2025-11-28-test-scenario-d
- Notes: Verify eslint --fix and prettier work correctly (0.90s)

**2025-11-28-test-scenario-d**

- Status: completed
- Description: Test Scenario D - Build failure blocking
- Blocked by: 2025-11-28-test-scenario-c
- Blocking: 2025-11-28-validate-final
- Notes: Verify push is blocked when build fails (correctly detected)

**2025-11-28-validate-final**

- Status: completed
- Description: Final validation and cleanup test commits
- Blocked by: 2025-11-28-test-scenario-d
- Blocking: None
- Notes: Verify timing, correct behavior, documentation

## Dependencies Graph

```
2025-11-28-install-deps
    ↓
2025-11-28-init-husky
    ↓
2025-11-28-configure-lintstaged
    ↓
2025-11-28-configure-precommit (3-5s fast)
    ↓
2025-11-28-configure-prepush (40-80s verification)
    ↓
2025-11-28-test-scenario-a (backend only)
    ↓
2025-11-28-test-scenario-b (frontend only)
    ↓
2025-11-28-test-scenario-c (lint auto-fix)
    ↓
2025-11-28-test-scenario-d (build blocking)
    ↓
2025-11-28-validate-final
```

## Key Changes from Original Plan

### Why Alternative 2 is Better:

1. **Fast commits**: 3-5 seconds (vs 40-80 seconds)
2. **Quality maintained**: Build verified on push
3. **Better dev experience**: No interruptions during coding
4. **Monorepo optimized**: Uses --affected flag on push
5. **CI-friendly**: Push-time build mirrors CI behavior

### Implementation Notes:

- Pre-commit: lint-staged on staged files only (NO BUILD)
- Pre-push: turbo run lint/build --affected (FULL VERIFICATION)
- Two-stage approach balances speed and quality

## Notes

- Exactly one task marked `in_progress` at any time
- Tasks can be re-ordered within dependencies if needed
- Each task should be completed before moving to next
- Mark tasks as `cancelled` if scope changes
- Test scenarios must validate timing (3-5s vs 40-80s)
