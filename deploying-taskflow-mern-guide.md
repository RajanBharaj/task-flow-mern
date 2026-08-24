# Deploying TaskFlow (MERN) to Cloudflare Pages + Render + MongoDB Atlas

A step-by-step guide to taking the TaskFlow MERN demo from a local project
to a live, publicly accessible website — using a free/low-cost combination
of MongoDB Atlas (database), Render (backend API), and Cloudflare Pages
(frontend).

**Order matters.** Set these up database → backend → frontend, in that
order — each step needs a real value produced by the step before it.

---

## Prerequisites

- The `task-flow-mern` project pushed to a GitHub repository (see
  `gitignore-env-secrets-guide.md` for safely getting it there without
  committing any secrets)
- A free account on [MongoDB Atlas](https://mongodb.com/atlas),
  [Render](https://render.com), and [Cloudflare](https://cloudflare.com)

---

## Step 1: Set up the database on MongoDB Atlas

1. Create a new **free M0 cluster**.
2. **Database Access** → add a database user with a username/password.
   Use a dedicated app credential here — not your personal Atlas login.
3. **Network Access** → add IP address `0.0.0.0/0` ("Allow access from
   anywhere"). This is necessary because Render's servers don't have a
   fixed IP you can whitelist in advance on the free tier.
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Add your database name to the end of it, before the `?`:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
   ```

Keep this full string handy — it's your `MONGODB_URI`, and it's a secret.
Never commit it to your repo; it only ever goes into Render's environment
variable settings (Step 2).

---

## Step 2: Deploy the backend (`server/`) to Render

1. In Render: **New → Web Service** → connect your GitHub repo.
   When prompted for repository access, choose **"Only select
   repositories"** and pick just `task-flow-mern` — never grant a
   platform access to every repo in your account.
2. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Starter ($7/month, always-on — the free tier
     spins down after 15 minutes of inactivity, which is fine for
     testing but not for a real user-facing site)
3. Under **Environment Variables**, add:
   - `MONGODB_URI` = the connection string from Step 1
   - `PORT` = `4000` (Render injects its own `PORT` automatically, and
     `server.js` already falls back to this value, so either way works)
4. Deploy. Render gives you a URL like:
   ```
   https://task-flow-api.onrender.com
   ```
5. **Test it**: visit `https://task-flow-api.onrender.com/api/tasks` in
   your browser. An empty array `[]` means the database connected
   successfully.

---

## Step 3: Deploy the frontend (`client/`) to Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Select your GitHub repo — again, scope access to only this repository.
3. Configure the build:
   - **Root directory**: `client`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Framework preset**: Vite (usually auto-detected)
4. Under **Environment variables**, add:
   - `VITE_API_BASE_URL` = `https://task-flow-api.onrender.com/api/tasks`
     (your real Render URL from Step 2 — not `localhost`)
5. Deploy. Cloudflare gives you a URL like:
   ```
   https://task-flow-mern.pages.dev
   ```

---

## Step 4: Lock down CORS between them (recommended)

By default the demo's `cors()` call allows requests from anywhere, which
is fine for getting things working. Once verified, tighten it to just
your real frontend domain:

```javascript
// server/server.js
app.use(cors({
  origin: "https://task-flow-mern.pages.dev", // your real Cloudflare Pages URL
}));
```

Commit and push this change — Render redeploys automatically on push.

---

## Step 5: Verify the whole chain

Visit your Cloudflare Pages URL and try adding a task.

| Symptom | Likely cause |
|---|---|
| CORS error in browser console | Step 4's `origin` doesn't exactly match your Pages URL — check for trailing slashes or `http` vs `https` |
| Request succeeds but nothing appears | `VITE_API_BASE_URL` wasn't set at build time — Vite bakes env variables in during the build, so a new deploy is needed after changing it, not just a refresh |
| Request fails entirely / times out | Confirm the Render service is actually running (check its dashboard/logs) and that the URL doesn't have a typo |

---

## Step 6: Connect a custom domain (optional)

- **Cloudflare Pages** → Custom domains tab → add your domain. If your
  domain's nameservers already point to Cloudflare, this step needs no
  manual DNS record copying.
- **Render** → add `api.yourdomain.com` as a custom domain for the
  backend, then add the CNAME record on your registrar's DNS settings.
- Update `VITE_API_BASE_URL` to the new `api.yourdomain.com` address and
  redeploy the frontend.

---

## Quick reference: what goes where

| Value | Produced by | Used in |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | Render environment variable |
| Render backend URL | Render dashboard, after deploy | `VITE_API_BASE_URL` on Cloudflare Pages |
| Cloudflare Pages URL | Cloudflare dashboard, after deploy | `cors()` origin in `server.js` |

---

## Appendix: common Git/GitHub errors along the way

These aren't specific to this deployment, but reliably come up for
students pushing a project to GitHub for the first time.

**`fatal: Authentication failed`** — GitHub no longer accepts your
password for Git operations. Use a Personal Access Token, or switch to
SSH authentication.

**`Permission denied (publickey)`** — usually means one of:
- Your SSH key was never loaded into your SSH agent — run
  `ssh-add ~/.ssh/id_ed25519` (start the agent first with
  `eval "$(ssh-agent -s)"` if you see "Could not open a connection to
  your authentication agent").
- The public key on your machine doesn't match what's uploaded to
  GitHub — compare `cat ~/.ssh/id_ed25519.pub` against
  **GitHub → Settings → SSH and GPG keys**.

**`gpg: signing failed: Unusable secret key`** — your Git config is
pointed at a GPG key that no longer exists (e.g. after regenerating your
keys). Either update Git to your new key ID
(`git config --global user.signingkey <new-key-id>`), or disable commit
signing entirely for a student/portfolio project:
```bash
git config --global commit.gpgsign false
```

**`fatal: Could not read from remote repository`** — almost always
means the repository doesn't exist yet at that exact URL. Create it on
GitHub first (without initializing a README/`.gitignore`, since your
local project already has content), then push again.

**Before every push**, run `git status` and confirm `.env` never
appears in the list of files about to be committed — see
`gitignore-env-secrets-guide.md` for the full reasoning and a one-time
history check (`git log --all --full-history -- "**/.env"`) if you're
verifying an existing repo.
