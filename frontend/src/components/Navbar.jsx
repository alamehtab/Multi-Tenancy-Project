import { useState } from "react";
import {
  Menu,
  X,
  Notebook,
  Users,
  Plus,
  Edit,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      label: "Notes",
      to: "/noteslist",
      icon: <Notebook size={20} />,
      show: true,
    },
    {
      label: "Users",
      to: "/users",
      icon: <Users size={20} />,
      show: user?.role === "ADMIN",
    },
    {
      label: "Add",
      to: "/add-user",
      icon: <Plus size={20} />,
      show: user?.role === "ADMIN",
    },
    {
      label: "Edit",
      to: "/edit-user",
      icon: <Edit size={20} />,
      show: user?.role === "ADMIN",
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/noteslist"
          className="text-lg font-bold text-gray-800"
        >
          Multi-Tenant Notes
        </Link>

        {/* Desktop: email + logout */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-gray-700 font-medium truncate">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="p-1 hover:bg-gray-100 rounded transition"
            aria-label="Logout"
          >
            <LogOut size={20} className="text-red-600" />
          </button>
        </div>

        {/* Mobile: hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 hover:bg-gray-100 rounded transition focus:outline-none"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-wrap justify-around py-2">
            {navItems
              .filter((i) => i.show)
              .map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col items-center px-3 py-2 rounded transition ${
                    location.pathname === item.to
                      ? "bg-gray-100 font-medium"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex flex-col items-center px-3 py-2 rounded hover:bg-gray-50 transition"
            >
              <LogOut size={20} className="text-red-600" />
              <span className="text-xs">Logout</span>
            </button>

            {/* Email at bottom */}
            <div className="w-full text-center mt-2">
              <span className="block text-xs text-gray-700 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
