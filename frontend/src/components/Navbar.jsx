import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="container mx-auto px-4 py-3 flex justify-between items-center bg-gray-200 relative"
      style={{
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      {/* Left: Brand */}
      <h1 className="text-base sm:text-lg font-bold text-gray-800">
        Multi-Tenant Notes
      </h1>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-gray-700 font-medium">{user?.email}</span>
        <button
          onClick={logout}
          className="p-2 md:p-1.5 rounded-md border border-gray-300 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="focus:outline-none"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full right-4 mt-2 bg-white text-gray-800 shadow-lg rounded p-4 w-48 z-50 transition-all duration-300 ease-in-out">
              <button
                onClick={onToggleSidebar}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                Menu
              </button>
              <div className="flex items-center justify-between px-2 py-1 mt-2">
                <span className="text-sm text-gray-600 truncate">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-md border border-gray-300 hover:bg-red-500 hover:text-white transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
