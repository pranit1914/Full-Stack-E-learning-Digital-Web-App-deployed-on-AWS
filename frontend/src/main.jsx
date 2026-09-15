import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import { CourseContextProvider } from "./context/CourseContext.jsx";

export const server = import.meta.env.VITE_API_URL || "";
export const mediaUrl = (value) =>
  value?.startsWith("http") ? value : `${server}/${value}`;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserContextProvider>
      <CourseContextProvider>
        <App />
      </CourseContextProvider>
    </UserContextProvider>
  </StrictMode>,
);
