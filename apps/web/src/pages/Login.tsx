import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useShowcase, type Role } from "../state/ShowcaseContext";

const roleOptions: Array<{
  role: Role;
  title: string;
  description: string;
}> = [
  {
    role: "ADMIN",
    title: "Board administrator",
    description: "Full membership, finance, policy and reporting access."
  },
  {
    role: "TREASURER",
    title: "Treasurer",
    description: "Contributions, accounting, refunds and investments."
  },
  {
    role: "MEMBER",
    title: "Member",
    description: "Personal statement, requests, contributions and documents."
  }
];

export function Login() {
  const { login, quickLogin } = useShowcase();
  const [email, setEmail] = useState("admin@stkisa.org");
  const [password, setPassword] = useState("Demo@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!login(email, password)) {
      setError("Use one of the demo accounts shown below.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <img src="/st-kisa-logo.jpeg" alt="St. Kisa Youth logo" />
          <div>
            <strong>St. Kisa Youth</strong>
            <span>Self-Help Group</span>
          </div>
        </div>
        <div className="story-copy">
          <p className="eyebrow">Together we grow</p>
          <h1>Clear records.<br />Shared confidence.</h1>
          <p>
            One secure workspace for membership, contributions, welfare,
            refunds and accountable group decisions.
          </p>
        </div>
        <div className="story-security">
          <ShieldCheck size={20} />
          <span>
            <strong>Role-aware demonstration</strong>
            Each account sees the tools and records appropriate to its role.
          </span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <div className="login-heading">
            <span className="login-lock"><LockKeyhole size={22} /></span>
            <p className="eyebrow">Member portal</p>
            <h2>Welcome back</h2>
            <p>Sign in or choose a showcase role.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="field">
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="field">
              Password
              <span className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button primary login-submit" type="submit">
              Sign in <ArrowRight size={17} />
            </button>
          </form>

          <div className="quick-login">
            <span>Quick showcase access</span>
            {roleOptions.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => quickLogin(option.role)}
              >
                <span className={`role-dot role-${option.role.toLowerCase()}`} />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
          <p className="demo-note">
            Demo password for every account: <strong>Demo@2026</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
