// src/components/TaskList.jsx
//
// The main UI: fetches tasks from the Express API and lets the user add
// new ones. This is a completely separate app from the server — it runs
// in the browser and talks to the API over plain HTTP fetch calls.

import { useEffect, useState } from "react";

// Read the API's base URL from the environment so the same code works
// against a local server during development and the deployed server
// in production — see .env.example.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TaskList() {
  const [taskList, setTaskList] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Load tasks once, when the component first mounts.
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch(API_BASE_URL);
    const data = await response.json();
    setTaskList(data);
  }

  async function handleAddTask(event) {
    event.preventDefault(); // stop the browser's default full-page form submit

    if (!newTaskTitle.trim()) return;

    await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle }),
    });

    setNewTaskTitle("");
    await fetchTasks(); // re-fetch so the new task appears in the list
  }

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>TaskFlow</h1>

      <form onSubmit={handleAddTask}>
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="What needs doing?"
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {taskList.map((task) => (
          // MongoDB documents use "_id" by default (not "id") — a common
          // source of bugs when switching between MongoDB and SQL stacks.
          <li
            key={task._id}
            style={{ textDecoration: task.isComplete ? "line-through" : "none" }}
          >
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
