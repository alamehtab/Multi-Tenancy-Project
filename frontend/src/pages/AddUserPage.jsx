import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddUserPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    role: "MEMBER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        `/tenants/${user.tenantSlug}/invite`,
        formData
      );
      alert("User invited successfully!");
      setFormData({ email: "", role: "MEMBER" });
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to invite user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full px-4 py-6 max-w-3xl mx-auto">
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
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <UserPlus className="text-green-600" size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Add New User
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Invite a new user to your tenant
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
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

          {/* Role Field */}
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
            <p className="text-sm text-gray-500 mt-1">
              Admins have full access to manage users and settings.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Invite User
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
          About User Invitations
        </h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Users will receive an email invitation</li>
          <li>• Default password will be set to "password"</li>
          <li>• Users can change their password after first login</li>
          <li>• Free plan users have limited note creation capabilities</li>
        </ul>
      </div>
    </div>
  );
};

export default AddUserPage;
