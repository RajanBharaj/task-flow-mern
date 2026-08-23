# TaskFlow — MERN (MongoDB, Express, React, Node.js) Demo

Same app, different paradigm: here the **backend and frontend are two separate
applications** that communicate over HTTP. This is the classic decoupled
architecture pattern.

## Project structure
```
task-flow-mern/
├── server/                      # Express + MongoDB API
│   ├── models/
│   │   └── task-model.js        # Mongoose schema
│   ├── routes/
│   │   └── task-routes.js       # Express router for /api/tasks
│   └── server.js                # Entry point — starts Express
└── client/                      # React frontend (separate app, own build)
    └── src/
        └── components/
            └── TaskList.jsx     # UI for viewing/adding tasks
```

---

### `server/models/task-model.js`
Mongoose defines the shape of documents stored in MongoDB's `tasks` collection.
Unlike Prisma/Postgres, MongoDB is schema-flexible — Mongoose adds structure
on top of it at the application level.

```javascript
// server/models/task-model.js

const mongoose = require("mongoose");

// Schema describing a single task document.
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// "Task" -> Mongoose automatically uses/creates the "tasks" collection.
module.exports = mongoose.model("Task", taskSchema);
```

---

### `server/routes/task-routes.js`
Express routes are defined explicitly and mounted onto the app manually —
more boilerplate than Next.js's file-based routing, but fully explicit.

```javascript
// server/routes/task-routes.js

const express = require("express");
const Task = require("../models/task-model");

const taskRouter = express.Router();

// GET /api/tasks — return all tasks, newest first.
taskRouter.get("/", async (request, response) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  response.json(tasks);
});

// POST /api/tasks — create a new task.
taskRouter.post("/", async (request, response) => {
  const { title } = request.body;

  if (!title || typeof title !== "string") {
    return response.status(400).json({ error: "A non-empty 'title' string is required." });
  }

  const newTask = await Task.create({ title });
  response.status(201).json(newTask);
});

module.exports = taskRouter;
```

---

### `server/server.js`
The Express entry point — wires together the database connection, middleware,
and routes into one runnable server.

```javascript
// server/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const taskRouter = require("./routes/task-routes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());          // allow the separately-hosted React app to call this API
app.use(express.json());  // parse incoming JSON request bodies

app.use("/api/tasks", taskRouter);

async function startServer() {
  // Connect to MongoDB before accepting traffic.
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
  });
}

startServer();
```

---

### `client/src/components/TaskList.jsx`
The React frontend — a completely separate app (its own `npm run dev`,
its own port) that talks to the Express API over `fetch`.

```jsx
// client/src/components/TaskList.jsx

import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:4000/api/tasks";

export default function TaskList() {
  const [taskList, setTaskList] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Load tasks once when the component mounts.
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch(API_BASE_URL);
    const data = await response.json();
    setTaskList(data);
  }

  async function handleAddTask(event) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;

    await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle }),
    });

    setNewTaskTitle("");
    await fetchTasks(); // re-fetch to reflect the new task
  }

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>TaskFlow</h1>

      <form onSubmit={handleAddTask}>
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {taskList.map((task) => (
          <li key={task._id} style={{ textDecoration: task.isComplete ? "line-through" : "none" }}>
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## What this demonstrates
- **Decoupled architecture**: `server/` and `client/` are independently deployable — you could swap React for a mobile app without touching the API.
- **Explicit routing**: every endpoint is manually registered (`taskRouter.get(...)`), unlike Next.js's file-based `route.ts` convention.
- **Schema-on-write vs schema-on-read**: Mongoose's schema is enforced by the application, not the database itself — MongoDB would happily store a document that skips validation if you bypass Mongoose.
- **`_id` vs `id`**: MongoDB documents use `_id` by default (note the difference from Prisma's `id` in the Next.js demo) — a common source of bugs when switching stacks.
