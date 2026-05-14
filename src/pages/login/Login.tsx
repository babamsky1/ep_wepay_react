import rightBg from "../../../asset/right-bg.jpg";
import loginBg from "../../../asset/login-bg.jpg";
import { Wallet } from "lucide-react";
import { Button } from "@/components/shared_components/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      setError(result.error || "Invalid email or password");
    }
  };
  return (
    <div className="min-h-screen flex text-black relative">
      <div className="absolute left-0 top-0 w-1/2 h-full z-0">
        <img
          src={loginBg}
          alt="login background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-end px-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex gap-3 mb-1">
            <div className="w-10 h-10 text-black rounded-lg flex items-center justify-center font-bold">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">WePay</h1>
          </div>

          <p className="text-black text-sm mb-4">Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="text-md text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full mt-2 px-3 py-2 rounded-sm bg-gray-50 border border-gray-300 disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label className="text-md text-black">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full mt-2 px-3 py-2 rounded-sm bg-gray-50 border border-gray-300 disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-md" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
            <p className="font-semibold mb-2">Test Accounts:</p>
            <p className="text-xs"><strong>admin@test.com / 123123</strong> (Super Admin)</p>
            <p className="text-xs"><strong>finance@test.com / 123123</strong> (Finance)</p>
            <p className="text-xs"><strong>hr@test.com / 123123</strong> (HR)</p>
            <p className="text-xs"><strong>manager@test.com / 123123</strong> (Manager)</p>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2">
        <img
          src={rightBg}
          alt="login visual"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
