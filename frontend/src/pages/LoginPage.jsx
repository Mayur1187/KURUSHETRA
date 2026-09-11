import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { Input } from "../components/common/Input";
import { projectConfig } from "../config/projectConfig";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{projectConfig.projectName}</h1>
        <h2>Log in</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ErrorMessage error={error} />
          <Button type="submit" fullWidth loading={loading}>
            Log in
          </Button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
