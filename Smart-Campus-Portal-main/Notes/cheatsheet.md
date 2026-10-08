# Git & GitHub Cheat Sheet (Beginner Edition)

## The Basic Idea
- **Git** = version control tool on your computer (tracks changes to files)
- **GitHub** = website that hosts your Git repositories online, so a team can share code

```
Your Computer (Git)  <-- push/pull -->  GitHub (remote repo)
```

## One-Time Setup
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Getting a Project

**Starting fresh:**
```bash
git init                          # turn current folder into a git repo
```

**Joining an existing project on GitHub:**
```bash
git clone <repo-url>              # download the repo to your computer
cd repo-name
```

## The Daily Workflow (memorize this loop)
```bash
git status                # what's changed?
git add <file>             # stage a file (or `git add .` for everything)
git commit -m "message"    # save a snapshot with a description
git push                   # send commits to GitHub
git pull                   # get latest changes from GitHub
```

**Golden rule:** `git pull` before you start working, `git push` when you're done.

## Branches (very important for teams)
Branches let each person work without breaking each other's code.

```bash
git branch                        # list branches
git branch new-feature            # create a branch
git checkout new-feature          # switch to it
git checkout -b new-feature       # create + switch in one step
git checkout main                 # switch back to main branch
```

**Typical team flow:**
1. `git checkout -b your-feature` — make your own branch
2. Do your work, `add` + `commit` as usual
3. `git push -u origin your-feature` — push your branch to GitHub
4. Open a **Pull Request (PR)** on GitHub so teammates can review it
5. Once approved, merge it into `main`

## Undoing Things
```bash
git checkout -- <file>            # discard unstaged changes to a file
git reset HEAD <file>              # unstage a file (keeps the changes)
git revert <commit>                 # safely undo a commit (makes a new commit)
git log                            # see commit history
git log --oneline                  # compact history view
```

## Merge Conflicts (don't panic)
Happens when two people edit the same lines. Git will mark it like this in the file:
```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> branch-name
```
Manually edit the file to keep what you want, delete the `<<<<`, `====`, `>>>>` markers, then:
```bash
git add <file>
git commit
```

## .gitignore
Create a file named `.gitignore` in your project root to stop Git from tracking junk files (e.g. `node_modules/`, `.env`, build folders).
```
node_modules/
.env
*.log
```

## GitHub-Specific Terms
| Term              | Meaning                                                    |
|                   |                                                            |
| Repository (repo) | The project folder, hosted on GitHub                       |
| Fork              | Your own copy of someone else's repo                       |
| Pull Request (PR) | "Please merge my branch into yours" — used for code review |
| Issue             | A tracked task/bug on GitHub                               |
| Clone             | Download a repo to your computer                           |
| Origin            | Nickname for "the GitHub repo I cloned from"               |
| main / master     | The default/primary branch                                 |




## Quick Reference Cheat Table
| Task                   |    Command            |
|                        |                       |
| Check what changed     | `git status`          |
| Stage everything       | `git add .`           |
| Commit                 | `git commit -m "msg"` |
| Push                   | `git push`            |
| Pull latest            | `git pull`            |
| New branch             | `git checkout -b name`|
| Switch branch          | `git checkout name`   |
| See history            | `git log --oneline`   |
| Clone a repo           | `git clone <url>`     |



## Survival Tips for a Beginner
1. Commit often, with clear messages (`"fix login bug"`, not `"stuff"`)
2. Always `pull` before you `push`
3. Never work directly on `main` — use a branch
4. If stuck in a weird git state, it's usually fine to `git status` and read what it tells you — Git is very verbose about what to do next
5. When in doubt, Google the exact error message — Git errors are extremely well documented