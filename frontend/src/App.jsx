import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import NotesPage from "./pages/NotesPage";

export default function App() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={!token ? <LoginPage /> : <Navigate to="/noteslist" />} 
        />

        {/* Notes List Route */}
        <Route 
          path="/noteslist" 
          element={token ? <NotesPage /> : <Navigate to="/login" />} 
        />

        {/* Catch-all route */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/noteslist" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
