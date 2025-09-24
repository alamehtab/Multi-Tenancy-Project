import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === "ADMIN") fetchTenant();
    else setLoading(false);
  }, []);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${user.tenantSlug}`);
      setTenant(res.data);
    } catch (err) {
      console.error("Error fetching tenant:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await api.post(`/tenants/${user.tenantSlug}/upgrade`);
      setTenant(res.data);
      alert("Tenant upgraded to PRO!");
    } catch (err) {
      console.error(err);
      alert("Failed to upgrade tenant");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      {user.role !== "ADMIN" && (
        <p>Settings are only available for admins.</p>
      )}

      {user.role === "ADMIN" && tenant && (
        <div className="space-y-4">
          <p>
            <strong>Tenant Name:</strong> {tenant.name}
          </p>
          <p>
            <strong>Plan:</strong> {tenant.plan}
          </p>
          {tenant.plan === "FREE" && (
            <button
              onClick={handleUpgrade}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Upgrade to PRO
            </button>
          )}
        </div>
      )}
    </div>
  );
}
