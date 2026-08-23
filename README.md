# TaskFlow — MERN (MongoDB, Express, React, Node.js)

A minimal task tracker demonstrating the classic decoupled architecture:
a standalone Express API and a standalone React app, talking to each
other over HTTP.

## Project structure
```
task-flow-mern/
├── server/                      # Express + MongoDB API (its own app)
│   ├── models/
│   │   └── task-model.js        # Mongoose schema for a Task document
│   ├── routes/
│   │   └── task-routes.js       # Express router for /api/tasks
│   ├── server.js                # Entry point — starts Express
│   ├── package.json
│   └── .env.example
└── client/                      # React frontend (separate app, own build)
    ├── src/
    │   ├── main.jsx              # React entry point
    │   ├── App.jsx               # Top-level component
    │   └── components/
    │       └── TaskList.jsx      # UI for viewing/adding tasks
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## Run it locally

You'll run two separate processes — one for the API, one for the frontend.

### 1. Start the API (server/)
```bash
cd server
npm install
cp .env.example .env
```
Fill in `.env` with a free MongoDB connection string from
[MongoDB Atlas](https://mongodb.com/atlas), then:
```bash
npm run dev
```
The API runs at http://localhost:4000

### 2. Start the frontend (client/)
In a **second terminal**:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Visit the URL Vite prints (usually http://localhost:5173)

## Deploying

Because this is a decoupled architecture, frontend and backend deploy to
**two different platforms**:

1. **Backend (`server/`)** → Railway or Render
   - Push this repo to GitHub, connect it in Railway/Render, set the
     root directory to `server/`.
   - Add the `MONGODB_URI` environment variable (from MongoDB Atlas).
2. **Frontend (`client/`)** → Netlify or Vercel
   - Same repo, set the root directory to `client/`, build command
     `npm run build`, publish directory `dist`.
   - Add a `VITE_API_BASE_URL` environment variable pointing at your
     deployed backend's URL (e.g. `https://your-api.up.railway.app/api/tasks`).

## What this demonstrates

- **Decoupled architecture**: `server/` and `client/` are independently
  deployable — you could swap React for a mobile app without touching the API.
- **Explicit routing**: every endpoint is manually registered
  (`taskRouter.get(...)`), unlike a file-based routing convention.
- **Schema-on-write vs. schema-on-read**: Mongoose's schema is enforced by
  the application, not the database itself.
- **`_id` vs. `id`**: MongoDB documents use `_id` by default — notice this
  in `TaskList.jsx`'s `key={task._id}`, a common gotcha when moving between
  MongoDB and SQL-based stacks.
