---
description: Auto-push for secondary branches, manual for main
---
1. Whenever a change is committed on any branch OTHER than `main`, automatically run `git push origin [branch-name]`.
2. For the `main` branch, only perform `git push` if the user explicitly requests it.
3. Use `git status` frequently to ensure the local state is clean before operations.
