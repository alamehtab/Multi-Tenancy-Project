import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UsersSection = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const usersPerPage = 5;
    const navigate=useNavigate()

    useEffect(() => {
        if (!user) return;
        fetchMembers();
    }, [user]);

    const fetchMembers = async () => {
        setLoading(true);
        setError("");

        try {
            let res;
            if (user.role === "ADMIN") {
                res = await api.get("/tenants/all-users");
            } else if (user.tenantSlug) {
                res = await api.get(`/tenants/${user.tenantSlug}/users`);
            } else {
                throw new Error("User role or tenant information missing.");
            }

            setUsers(res.data);
        } catch (err) {
            console.error("API Error:", err.response?.data || err.message);

            if (err.response?.status === 403) {
                setError(
                    user.role === "ADMIN"
                        ? "You do not have permission to view these users."
                        : "You can only see users in your tenant."
                );
            } else if (err.response?.status === 404) {
                setError("Users not found.");
            } else {
                setError("Something went wrong while fetching users.");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.tenant?.name && u.tenant.name.toLowerCase().includes(search.toLowerCase()));
        const matchesRole = roleFilter === "ALL" ? true : u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const toggleSelectAll = () => {
        if (selectedUsers.length === currentUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentUsers.map((u) => u.id));
        }
    };

    const toggleSelectUser = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const togglePlan = async (tenantSlug) => {
        try {
            const res = await api.post(`/tenants/${tenantSlug}/toggle-plan`);
            setUsers((prev) =>
                prev.map((u) =>
                    u.tenant.slug === tenantSlug
                        ? { ...u, tenant: { ...u.tenant, plan: res.data.plan } }
                        : u
                )
            );
        } catch (err) {
            console.error("Error toggling plan:", err);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete user ${userEmail}?`)) {
            return;
        }

        setDeleteLoading(userId);
        try {
            await api.delete(`/tenants/${user.tenantSlug}/users/${userId}`);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(err.response?.data?.error || "Failed to delete user");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleEditUser = (userData) => {
        // Navigate to edit page with user data
        console.log("Edit user:", userData);
        // You can implement navigation to edit page here
        alert(`Edit functionality for ${userData.email} would open here`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
                <div className="text-red-600 font-semibold mb-2">Error</div>
                <p className="text-red-700">{error}</p>
                <button 
                    onClick={fetchMembers}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
    
    if (users.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-600">No users found</h3>
                <p className="text-gray-500">There are no users to display at the moment.</p>
            </div>
        </div>
    );

    return (
        <div className="w-full p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage your team members and their permissions</p>
            </div>

            {/* Top Bar with Filters & Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    {/* Left Side - Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* Role Filter */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="text-gray-700 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium rounded-lg text-sm px-4 py-2.5 w-48"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                            </select>
                        </div>
                    </div>

                    {/* Horizontal Rule for medium screens */}
                    <hr className="lg:hidden w-full border-gray-200" />

                    {/* Right Side - Search */}
                    <div className="flex flex-col w-full lg:w-auto">
                        <label className="text-sm font-medium text-gray-700 mb-1">Search Users</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by email or tenant name..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full lg:w-96 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Selected Users Actions */}
                {selectedUsers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-blue-700 font-medium">
                                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                                    Bulk Actions
                                </button>
                                <button 
                                    onClick={() => setSelectedUsers([])}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-white uppercase bg-gradient-to-r from-blue-600 to-blue-700">
                        <tr>
                            <th scope="col" className="p-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                        onChange={toggleSelectAll}
                                        disabled={currentUsers.length === 0}
                                    />
                                    <label className="sr-only">Select all</label>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 font-semibold">
                                Tenant Name
                            </th>
                            <th scope="col" className="px-6 py-4 font-semibold">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-4 font-semibold">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-4 font-semibold">
                                Plan
                            </th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentUsers.map((u) => (
                            <tr key={u.id} className="bg-white hover:bg-gray-50 transition-colors">
                                <td className="w-4 p-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                            checked={selectedUsers.includes(u.id)}
                                            onChange={() => toggleSelectUser(u.id)}
                                        />
                                        <label className="sr-only">Select user</label>
                                    </div>
                                </td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-700 font-semibold text-sm">
                                                {u.tenant?.name ? u.tenant.name.charAt(0).toUpperCase() : "—"}
                                            </span>
                                        </div>
                                        {u.tenant?.name || "—"}
                                    </div>
                                </th>
                                <td className="px-6 py-4 font-mono text-gray-700 text-sm">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                            u.role === "ADMIN"
                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                : "bg-green-100 text-green-700 border border-green-200"
                                        }`}
                                    >
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.role === "MEMBER" ? (
                                        <button
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                                                u.tenant.plan === "PRO"
                                                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                                                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200"
                                            }`}
                                            onClick={() => togglePlan(u.tenant.slug)}
                                        >
                                            {u.tenant.plan} {u.tenant.plan === "FREE" ? "→ Upgrade" : "→ Downgrade"}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center space-x-2">
                                        <button 
    onClick={() => navigate('/edit-user', { state: { user: u } })}
    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    title="Edit User"
>
    <Edit size={16} />
</button>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                            disabled={deleteLoading === u.id}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete User"
                                        >
                                            {deleteLoading === u.id ? (
                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                        <button 
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {currentUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-4xl mb-3">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-600">No users found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mt-6 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{indexOfFirstUser + 1}</span> to{" "}
                        <span className="font-semibold">
                            {Math.min(indexOfLastUser, filteredUsers.length)}
                        </span>{" "}
                        of <span className="font-semibold">{filteredUsers.length}</span> users
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-sm font-medium rounded-lg transition ${
                                        currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersSection;