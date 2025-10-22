import React, { useState } from "react";
import Button from "../components/atoms/Button";
import { signInByEmail } from "../lib/api"; // ✅ import the shared API function

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const customer = await signInByEmail(email);

      alert(`Welcome ${customer.name || customer.email}! You are now signed in.`);
      window.location.href = "/"; // redirect to catalog or home
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-8 w-full max-w-sm animate-fadeIn"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Sign in with Email
        </h1>

        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md w-full px-3 py-2 mb-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />

        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          size="md"
          className="w-full"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-3">{error}</p>
        )}

        <p className="text-gray-500 text-sm text-center mt-6">
          Enter your email to sign in or create an account automatically.
        </p>
      </form>
    </div>
  );
}
