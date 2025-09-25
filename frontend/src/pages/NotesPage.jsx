import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  LogOut,
  Menu,
  Notebook,
  UserPlus,
  UserRoundPen,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UsersSection from "../components/UsersSection";
import AddUserPage from "./AddUserPage";
import EditUserPage from "./EditUserPage";
import UpgradeBanner from "../components/UpgradeBanner";
import NoteForm from "../components/NoteForm";
import NotesList from "../components/NotesList";

export default function NotesPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);

  // Control desktop sidebar open/collapse (md+ only)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Control mobile menu dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // apply auth header
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // fetch notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notes");
      // show only this user's notes
      const userNotes = res.data.filter((n) => n.user?.id === user.id);
      setNotes(userNotes);

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

  useEffect(() => {
    fetchNotes();
  }, []);

  // note create / delete / update / upgrade
  const handleCreate = async ({ title, content }) => {
    try {
      const res = await api.post("/notes", { title, content });
      setNotes((prev) => [...prev, res.data]);
      if (user.role !== "ADMIN" && notes.length + 1 >= 3) {
        setLimitReached(true);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setLimitReached(true);
      } else {
        alert(err.response?.data?.error || "Error creating note");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      if (user.role !== "ADMIN" && updated.length < 3) {
        setLimitReached(false);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting note");
    }
  };

  const handleUpdate = (id, updatedNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? updatedNote : n))
    );
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

  // choose which page to render
  const renderContent = () => {
    if (location.pathname === "/users" && user.role === "ADMIN") {
      return <UsersSection />;
    }
    if (location.pathname === "/add-user" && user.role === "ADMIN") {
      return <AddUserPage />;
    }
    if (location.pathname === "/edit-user" && user.role === "ADMIN") {
      return <EditUserPage />;
    }
    // default notes page
    return (
      <>
        {limitReached && (
          <UpgradeBanner
            onUpgrade={handleUpgrade}
            tenantPlan={user.role === "ADMIN" ? "PRO" : "FREE"}
          />
        )}
        <NoteForm onCreate={handleCreate} />
        <NotesList
          notes={notes}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </>
    );
  };

  // list of nav items for mobile & desktop
  const navItems = [
    { label: "Notes", to: "/noteslist", show: true },
    { label: "Users", to: "/users", show: user.role === "ADMIN" },
    { label: "Add User", to: "/add-user", show: user.role === "ADMIN" },
    { label: "Edit User", to: "/edit-user", show: user.role === "ADMIN" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* logo / title */}
            <button
              className="text-lg font-bold text-gray-800 md:hidden focus:outline-none"
              onClick={() => navigate("/noteslist")}
            >
              Notes
            </button>
            <div className="hidden md:flex items-center gap-10">
              <Link to="/noteslist" className="hover:text-green-600">
                <Notebook />
              </Link>
              {user.role === "ADMIN" && (
                <>
                  <Link to="/users" className="hover:underline hover:text-blue-600">
                    <Users />
                  </Link>
                  <Link to="/add-user" className="hover:text-blue-600">
                    <UserPlus />
                  </Link>
                  <Link to="/edit-user" className="hover:text-blue-600">
                    <UserRoundPen />
                  </Link>
                </>
              )}
              <button
                onClick={logout}
                className=" hover:text-red-600 ml-4"
              >
                <LogOut />
              </button>
            </div>

            {/* mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 rounded hover:bg-gray-100 transition focus:outline-none"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navItems
                .filter((i) => i.show)
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded hover:bg-gray-100 ${location.pathname === item.to
                        ? "bg-gray-100 font-medium"
                        : ""
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex h-full justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
