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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/tenants/${user.tenantSlug}/invite`, { email, role });
      setUsers((prev) => [...prev, res.data.user]);
      setEmail("");
      setRole("MEMBER");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to invite user");
    }
  };

  if (user.role !== "ADMIN") {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold">Users Section</h2>
        <p>Only admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="flex gap-2 mb-4">
        <input
          type="email"
          required
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-2 py-1 border rounded"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="px-2 py-1 border rounded">
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
          Invite
        </button>
      </form>

      {/* Users List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between p-2 bg-gray-100 rounded">
              <span>{u.email}</span>
              <span className="text-sm font-medium">{u.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
