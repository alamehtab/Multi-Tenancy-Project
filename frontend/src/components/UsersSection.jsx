import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext"; // adjust path if needed

export default function UsersSection() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user?.tenantSlug) return; // avoid undefined tenantSlug
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${user.tenantSlug}/users`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user?.tenantSlug) return;
    try {
      await api.delete(`/tenants/${user.tenantSlug}/users/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting member");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  if (loading) return <p>Loading members...</p>;
  if (!user) return <p>Please login to view members.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tenant Members</h2>
      <ul className="space-y-3">
        {members.map((member) => (
          <li
            key={member.id}
            className="p-3 bg-gray-100 flex justify-between items-center rounded"
          >
            <span>{member.email} ({member.role})</span>
            <button
              onClick={() => handleDelete(member.id)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
