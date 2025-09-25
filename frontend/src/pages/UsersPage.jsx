import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === "ADMIN") fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${user.tenantSlug}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/tenants/${user.tenantSlug}/invite`,
        { email, role }
      );
      setUsers((prev) => [...prev, res.data.user]);
      setEmail("");
      setRole("MEMBER");
    } catch (err) {
      console.error("Error inviting user:", err);
      alert(err.response?.data?.error || "Failed to invite user");
    }
  };

  if (user.role !== "ADMIN") {
    return (
      <div className="px-4 py-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">Users Section</h2>
        <p className="text-gray-600">Only admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">
        Manage Users
      </h2>

      <form
        onSubmit={handleInvite}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <input
          type="email"
          required
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full sm:flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full sm:w-40 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Invite
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-4 rounded-lg shadow-sm"
            >
              <p className="font-medium text-gray-800 truncate w-full sm:w-auto">
                {u.email}
              </p>
              <span className="mt-2 sm:mt-0 inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs sm:text-sm font-medium">
                {u.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
