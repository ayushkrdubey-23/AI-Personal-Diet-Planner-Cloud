# GitHub Setup and Finalization

## Repository

Recommended name:

`AI-Powered-Personal-Diet-Planner-Cloud`

Recommended description:

`Cloud-based AI-powered personal diet planning application with Firebase Authentication, Firestore, FastAPI REST APIs, daily tracking, personalized recommendations, and a cloud-ready storage architecture.`

## First Push

```bash
git init
git add .
git commit -m "Initialize cloud diet planner project"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

## Final Documentation Commit

```bash
git add README.md docs .env.example .gitignore requirements.txt
git commit -m "docs: complete README and project documentation"
git push
```

## Before Pushing

```bash
git status
git ls-files | findstr /I "serviceAccountKey .env"
```

The credential file and real `.env` should not appear in tracked files.
