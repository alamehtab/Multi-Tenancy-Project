import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import NotesPage from "./pages/NotesPage";
import AddUserPage from "./pages/AddUserPage";
import EditUserPage from "./pages/EditUserPage";

export default function App() {
  const { token, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/noteslist" />}
        />

        <Route
          path="/noteslist"
          element={
            token ? (
              <NotesPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/users"
          element={
            token && user?.role === "ADMIN" ? (
              <NotesPage />
            ) : token ? (
              <Navigate to="/noteslist" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/add-user"
          element={
            token && user?.role === "ADMIN" ? (
              <NotesPage />
            ) : token ? (
              <Navigate to="/noteslist" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/edit-user"
          element={
            token && user?.role === "ADMIN" ? (
              <NotesPage />
            ) : token ? (
              <Navigate to="/noteslist" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/settings"
          element={
            token ? (
              <NotesPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/"
          element={<Navigate to={token ? "/noteslist" : "/login"} />}
        />

        <Route
          path="*"
          element={<Navigate to={token ? "/noteslist" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}