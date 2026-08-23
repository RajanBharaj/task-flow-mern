// src/App.jsx
//
// The top-level component. Kept intentionally thin — it just renders
// TaskList, but this is where you'd add routing, a shared header, etc.
// as the app grows.

import TaskList from "./components/TaskList.jsx";

export default function App() {
  return <TaskList />;
}
