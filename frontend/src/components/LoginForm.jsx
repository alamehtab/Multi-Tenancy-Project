import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../../api/api";
import { loginUser } from "../../api/auth";

export default function LoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await loginUser({ email, password });
            const { token, user } = res.data;
            setAuthToken(token);
            login({ token, user });
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                setError("Login failed. Please try again.");
            }
        }
    };
    return (
        <section className=" dark:bg-gray-900 min-h-screen flex items-center justify-center px-6 py-8">
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow dark:bg-gray-800 dark:border dark:border-gray-700 overflow-hidden">
                <div className="hidden md:flex md:w-2xl bg-blue-600 relative">
                    <img
                        src="https://plus.unsplash.com/premium_photo-1674582744373-c0805c281744?q=80&w=1481&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Illustration"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
                <div className="w-full md:w-2xl p-6 sm:p-8 space-y-6">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center md:text-left">
                        Sign in to your account
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 text-sm text-gray-500 dark:text-gray-300"
                                >
                                    Remember me
                                </label>
                            </div>
                            <a
                                href="#"
                                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
