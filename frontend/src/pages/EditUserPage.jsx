import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  ArrowLeft,
  User,
  Save,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EditUserPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    role: "MEMBER",
  });
  const [originalFormData, setOriginalFormData] = useState({
    email: "",
    role: "MEMBER",
  });
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      let res;
      if (user.role === "ADMIN") {
        res = await api.get("/tenants/all-users");
      } else {
        res = await api.get(`/tenants/${user.tenantSlug}/users`);
      }
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      const userData = { email: selected.email, role: selected.role };
      setFormData(userData);
      setOriginalFormData(userData);
      setError("");
      setSuccess("");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const hasChanges = () =>
    formData.email !== originalFormData.email ||
    formData.role !== originalFormData.role;

  const resetForm = () => {
    setFormData(originalFormData);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a user to edit");
      return;
    }
    if (!hasChanges()) {
      setError("No changes detected");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/tenants/${user.tenantSlug}/users/${selectedUserId}`,
        formData
      );

      setSuccess(response.data.message);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserId
            ? { ...u, email: formData.email, role: formData.role }
            : u
        )
      );
      setOriginalFormData(formData);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update user";
      setError(msg);
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) =>
    role === "ADMIN"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-green-100 text-green-800 border-green-200";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Users
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <User className="text-yellow-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Edit User
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Modify user details and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center text-sm sm:text-base">
          <CheckCircle className="text-green-500 mr-2" size={20} />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-sm sm:text-base">
          <XCircle className="text-red-500 mr-2" size={20} />
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-700 mb-4 text-lg sm:text-xl">
            Select User to Edit
          </h3>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User
                size={48}
                className="mx-auto mb-3 text-gray-300"
              />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserSelect(u.id)}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedUserId === u.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900 truncate">
                      {u.email}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Tenant: {u.tenant?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Plan:{" "}
                    <span
                      className={`font-medium ${
                        u.tenant?.plan === "PRO"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {u.tenant?.plan || "N/A"}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          {selectedUserId ? (
            <>
              <h3 className="font-semibold text-gray-700 mb-4 text-lg sm:text-xl">
                Edit User Details
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <div className="font-medium text-blue-900">
                      {
                        users.find((u) => u.id === selectedUserId)
                          ?.email
                      }
                    </div>
                    <div className="text-sm text-blue-700">
                      Editing user details
                    </div>
                  </div>
                  {hasChanges() && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      Unsaved Changes
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                  />
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Admin:</strong> Full access to manage users,
                    notes, and tenant settings.
                    <br />
                    <strong>Member:</strong> Can only create and manage
                    their own notes (with plan limits).
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={!hasChanges() || loading}
                    className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={!hasChanges() || loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Update User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <User
                size={48}
                className="mx-auto mb-3 text-gray-300"
              />
              <h4 className="font-medium text-gray-600 mb-2 text-sm sm:text-base">
                No User Selected
              </h4>
              <p className="text-sm sm:text-base">
                Please select a user from the list to begin editing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
          Editing Guidelines
        </h3>
        <ul className="text-gray-700 text-sm sm:text-base space-y-1">
          <li>• You can update user email addresses and roles</li>
          <li>• Email addresses must be unique within the tenant</li>
          <li>• At least one admin must remain in the tenant</li>
          <li>• Changes take effect immediately</li>
          <li>• Users will need to use their updated email for login</li>
        </ul>
      </div>
    </div>
  );
};

export default EditUserPage;
