import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NoteForm from "../components/NoteForm";
import NotesList from "../components/NotesList";
import UpgradeBanner from "../components/UpgradeBanner";
import UsersSection from "../components/UsersSection";
import SettingsPage from "./SettingsPage";

export default function NotesPage() {
  const { token, user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("notes");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, [token]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notes");
      // Filter notes to current user only
      const userNotes = res.data.filter((note) => note.user?.id === user.id);
      setNotes(userNotes);

      // Limit banner only for members
      if (user.role !== "ADMIN") {
        setLimitReached(userNotes.length >= 3);
      } else {
        setLimitReached(false);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async ({ title, content }) => {
    try {
      const res = await api.post("/notes", { title, content });
      setNotes((prev) => [...prev, res.data]);
      if (user.role !== "ADMIN" && notes.length + 1 >= 3) setLimitReached(true);
    } catch (err) {
      if (err.response?.status === 403) setLimitReached(true);
      else alert(err.response?.data?.error || "Error creating note");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      const updatedNotes = notes.filter((n) => n.id !== id);
      setNotes(updatedNotes);
      if (user.role !== "ADMIN" && updatedNotes.length < 3) setLimitReached(false);
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting note");
    }
  };

  const handleUpdate = (id, updatedNote) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
  };

  const handleUpgrade = async () => {
    try {
      await api.post(`/tenants/${user.tenantSlug}/upgrade`);
      setLimitReached(false);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.error || "Error upgrading plan");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="max-w-xl mx-auto mt-6 p-4">
          {activeSection === "notes" && (
            <>
              {limitReached && <UpgradeBanner onUpgrade={handleUpgrade} tenantPlan={user.role === "ADMIN" ? "PRO" : "FREE"} />}
              <NoteForm onCreate={handleCreate} />
              <NotesList notes={notes} onDelete={handleDelete} onUpdate={handleUpdate} />
            </>
          )}
          {activeSection === "users" && user.role === "ADMIN" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Users</h2>
              <UsersSection />
            </div>
          )}
          {activeSection === "settings" && (
            <SettingsPage />
          )}
        </div>
      </div>
    </div>
  );
}
