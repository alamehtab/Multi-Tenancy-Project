import { Users, Notebook, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ activeSection, setActiveSection, isOpen, toggleSidebar }) {
  const { user } = useAuth();

  const handleClick = (section) => {
    if (!isOpen) toggleSidebar();
    setActiveSection(section);
  };

  return (
    <aside
      className={`${isOpen ? "w-64" : "w-16"} bg-gray-100 min-h-screen flex flex-col transition-all duration-300 ease-in-out relative`}
      style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.08)" }}
    >
      <div className="flex justify-end p-2">
        <button onClick={toggleSidebar} className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition">
          {isOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-2">
        {/* Notes */}
        <div className="relative group">
          <button
            onClick={() => handleClick("notes")}
            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${
              activeSection === "notes" ? "bg-blue-600 text-white" : "hover:bg-gray-200"
            }`}
          >
            <Notebook size={22} />
            {isOpen && <span className="font-medium">Notes</span>}
          </button>
          {!isOpen && <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-800 text-white text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition">Notes</span>}
        </div>

        {/* Users (admin only) */}
        {user?.role === "ADMIN" && (
          <div className="relative group">
            <button
              onClick={() => handleClick("users")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded ${
                activeSection === "users" ? "bg-blue-600 text-white" : "hover:bg-gray-200"
              }`}
            >
              <Users size={22} />
              {isOpen && <span className="font-medium">Users</span>}
            </button>
            {!isOpen && <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-gray-800 text-white text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition">Users</span>}
          </div>
        )}
      </nav>
    </aside>
  );
}
