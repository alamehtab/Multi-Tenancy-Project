import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="px-6 py-3 flex justify-between items-center bg-white relative"
      style={{
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)", // subtle bottom border/shadow like sidebar
      }}
    >
      {/* Left: Brand */}
      <h1 className="text-lg font-bold text-gray-800">Multi-Tenant Notes</h1>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4">
        {/* Show full user email */}
        <span className="text-gray-700 font-medium">{user?.email}</span>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-md border border-gray-300 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="focus:outline-none"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {menuOpen && (
          <div className="absolute top-14 right-4 bg-white text-gray-800 shadow-lg rounded p-4 w-48">
            <button
              onClick={onToggleSidebar}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
            >
              Menu
            </button>
            <div className="flex items-center justify-between px-2 py-1 mt-2">
              <span className="text-sm text-gray-600 truncate">{user?.email}</span>
              <button
                onClick={logout}
                className="p-1.5 rounded-md border border-gray-300 hover:bg-red-500 hover:text-white transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
