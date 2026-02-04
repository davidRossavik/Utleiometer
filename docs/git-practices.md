# Git practices
Having common Git practices within the team helps ensure a structured, maintainable and clean repository that is easy to navigate.  

## 1. Check status 
To check whether your local branch is up to date with remote: 

```bash
git status
```

## 2. Pull latest changes from main to local repository (main)
If the `main` branch has been updated by another team member and you want to get the latest version locally, follow the steps below: 

Switch to local `main` branch: 

```bash
git checkout main
```

Pull latest changes from remote `main` branch: 

```bash
git pull origin main
```

## 3. Pull latest changes from `main` into your local branch

If you are working on a local feature branch and want to get the latest changes from `main`, follow these steps:

```bash
git checkout <your branchname>
```


This ensures that you are in the correct branch, and don't accidentilly update another branch. If in correct branch, continue with: 

```bash
git fetch origin
git merge origin/main
```

## 4. Create new branch

For this project, branches are primarly made when creating new issues. Click "create new branch" on the right in github, after publishing the issue. 

If in need for creating through the terminal, the following is best practice: 

```bash
git checkout main
git pull origin main
```

Ensures you are creating a branch based on the newest `main`. Then type: 

```bash
git checkout -b <issueNumber-branch-name>
```

Lastly, push new branch to remote: 

```bash
git push -u origin <branch-name>
```

## 5. Add new files to remote branch

You can either use the integrated source control in VS Code to stage changes by clicking the + symbol, or use the following git commands: 

```bash
git add <file>
```

## 6. Commit and push files to remote branch

After adding a new file, or when updating an existing, you can either use the integrated source control in VS Code as described below. Always use the commit guidelines format for the commit messages. 

* stage all changes by clicking + (as mentioned above)
* write a commit message (see commit guidelines)
* click "Commit"

... OR in the terminal: 

```bash 
git commit -m "message"
git push
```



