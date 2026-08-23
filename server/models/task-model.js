// server/models/task-model.js
//
// Mongoose defines the shape of documents stored in MongoDB's "tasks"
// collection. Unlike a SQL database, MongoDB itself is schema-flexible —
// Mongoose is what adds structure and validation at the application level.

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true, // automatically strips leading/trailing whitespace
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

// mongoose.model("Task", ...) tells Mongoose to use (or create) a MongoDB
// collection named "tasks" — the lowercase, pluralized version of "Task".
module.exports = mongoose.model("Task", taskSchema);
