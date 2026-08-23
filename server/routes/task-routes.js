// server/routes/task-routes.js
//
// Defines the REST endpoints for tasks. Unlike Next.js's file-based
// routing, Express routes must be registered explicitly — this file
// exports a router that server.js then mounts onto the app.

const express = require("express");
const Task = require("../models/task-model");

const taskRouter = express.Router();

// GET /api/tasks
// Returns every task, most recently created first.
taskRouter.get("/", async (request, response) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  response.json(tasks);
});

// POST /api/tasks
// Creates a new task from a JSON body like { "title": "Buy milk" }.
taskRouter.post("/", async (request, response) => {
  const { title } = request.body;

  // Basic server-side validation — never trust data from the client.
  if (!title || typeof title !== "string") {
    return response
      .status(400)
      .json({ error: "A non-empty 'title' string is required." });
  }

  const newTask = await Task.create({ title });
  response.status(201).json(newTask);
});

module.exports = taskRouter;
