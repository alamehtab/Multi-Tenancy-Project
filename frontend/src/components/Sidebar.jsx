import {
  Users,
  Notebook,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveSection = () => {
    if (location.pathname === "/noteslist") return "notes";
    if (location.pathname === "/users") return "users";
    if (location.pathname === "/add-user") return "add";
    if (location.pathname === "/edit-user") return "edit";
    return "notes";
  };

  const activeSection = getActiveSection();

  const handleNavigation = (path) => {
    if (!isOpen) toggleSidebar();
    navigate(path);
  };

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-gray-100 min-h-screen flex flex-col transition-all duration-300 ease-in-out relative z-40`}
      style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.08)" }}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-gray-200 hover:bg-blue-600 hover:text-white rounded transition focus:outline-none"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-2">
        {/* Notes */}
        <SidebarItem
          icon={<Notebook size={22} />}
          label="Notes"
          active={activeSection === "notes"}
          isOpen={isOpen}
          onClick={() => handleNavigation("/noteslist")}
        />

        {/* Admin-only items */}
        {user?.role === "ADMIN" && (
          <>
            <SidebarItem
              icon={<Users size={22} />}
              label="Users"
              active={activeSection === "users"}
              isOpen={isOpen}
              onClick={() => handleNavigation("/users")}
            />
            <SidebarItem
              icon={<Plus size={22} />}
              label="Add User"
              active={activeSection === "add"}
              isOpen={isOpen}
              onClick={() => handleNavigation("/add-user")}
              activeColor="green"
            />
            <SidebarItem
              icon={<Edit size={22} />}
              label="Edit User"
              active={activeSection === "edit"}
              isOpen={isOpen}
              onClick={() => handleNavigation("/edit-user")}
              activeColor="yellow"
            />
          </>
        )}
      </nav>
    </aside>
  );
}

// Reusable sidebar item component
function SidebarItem({ icon, label, active, isOpen, onClick, activeColor = "blue" }) {
  const activeBg = `bg-${activeColor}-600 text-white`;
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded transition ${
          active ? activeBg : "hover:bg-gray-200"
        }`}
        aria-label={label}
      >
        {icon}
        {isOpen && <span className="font-medium">{label}</span>}
      </button>
      {!isOpen && (
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-800 text-white text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition">
          {label}
        </span>
      )}
    </div>
  );
}
