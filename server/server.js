// server/server.js
//
// The Express entry point. This is where the database connection,
// middleware, and routes all get wired together into one runnable server.

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const taskRouter = require("./routes/task-routes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());          // allows the separately-hosted React app to call this API
app.use(express.json());  // parses incoming JSON request bodies into request.body

// Mount every /api/tasks/* route defined in task-routes.js
app.use("/api/tasks", taskRouter);

// Simple health check — useful for confirming the server is up when
// deployed (e.g. Railway/Render often ping a root route to check health).
app.get("/", (request, response) => {
  response.json({ status: "TaskFlow API is running" });
});

async function startServer() {
  // Connect to MongoDB before accepting any traffic.
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
  });
}

startServer();
