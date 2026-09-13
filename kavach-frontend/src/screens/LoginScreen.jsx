import { useState } from 'react';
import { login } from '../api/apiClient';

export function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [btnText, setBtnText] = useState("Log in");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setBtnText("Verifying security token...");
    setErrorMsg("");

    try {
      await login(email, password);
      setIsLoading(false);
      setBtnText("Authorized");
      setIsAuthorized(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 600);
    } catch (err) {
      setIsLoading(false);
      setBtnText("Log in");
      setErrorMsg(err.message || "Authentication failed");
    }
  };

  return (
    <div className="bg-page-bg text-on-surface font-body-sm text-body-sm min-h-screen flex flex-col justify-between selection:bg-surface-container selection:text-on-surface">
      <header className="w-full bg-page-bg">
        <div className="max-w-[1200px] mx-auto px-margin h-16 flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-on-surface text-[20px]">shield</span>
            <span className="font-headline-h2 text-body-md font-medium text-on-surface tracking-tight">KAVACH</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-success-text"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-normal tracking-normal">DEFENSE GRID ACTIVE</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-margin py-space-xl w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col w-full items-center justify-center">
          <div className="w-full max-w-[420px] bg-page-bg rounded-lg p-space-xl sm:p-[40px] flex flex-col gap-space-lg border border-[#E5E5E3]">
            <div className="flex flex-col gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-surface-panel border border-[#E5E5E3] flex items-center justify-center mb-space-xs">
                <span className="material-symbols-outlined text-on-surface text-[18px]">shield</span>
              </div>
              <h1 className="font-headline-h1 text-headline-h1 text-on-surface tracking-tight">Log in to Kavach</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Enter your enterprise credentials to access the defense dashboard.</p>
            </div>

            <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Work email</label>
                <div className="relative w-full">
                  <input
                    className="w-full h-10 px-3 py-2 bg-surface-panel border border-[#E5E5E3] text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm rounded-lg outline-none transition-colors focus:bg-page-bg"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                </div>
                <div className="relative w-full flex items-center">
                  <input
                    className="w-full h-10 pl-3 pr-14 py-2 bg-surface-panel border border-[#E5E5E3] text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-body-sm rounded-lg outline-none transition-colors focus:bg-page-bg"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors select-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="pt-space-xs flex flex-col gap-space-sm">
                <button
                  className={`w-full h-10 ${isAuthorized ? "bg-success-text" : "bg-primary hover:bg-primary-container"} text-on-primary font-body-sm text-body-sm font-medium rounded-lg flex items-center justify-center transition-colors select-none`}
                  disabled={isLoading}
                  type="submit"
                >
                  <span>{btnText}</span>
                  {isLoading && (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  )}
                </button>
                <div className="flex justify-center pt-1">
                  <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#reset" onClick={(e) => { e.preventDefault(); alert("Recovery link dispatched to active sovereign YubiKey endpoint."); }}>
                    Forgot password?
                  </a>
                </div>
                {errorMsg && (
                  <div className="text-danger text-label-sm text-center font-medium mt-1">
                    {errorMsg}
                  </div>
                )}
              </div>
            </form>

            <div className="pt-space-xs flex flex-col gap-space-sm">
              <div className="h-[1px] w-full bg-[#E5E5E3]"></div>
              <div className="flex items-center justify-between text-on-surface-variant px-1">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-on-surface-variant">verified_user</span>
                  <span className="font-label-sm text-label-sm">Hardware key &amp; SSO enforced</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-space-md transition-opacity duration-200">
            <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-panel border border-[#E5E5E3] font-label-sm text-label-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-success-text"></span>
              <span>System ready</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-page-bg py-space-lg">
        <div className="max-w-[1200px] mx-auto px-margin flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
          <div>© 2025 KAVACH Cyber-Defense. Strictly authorized access only.</div>
        </div>
      </footer>
    </div>
  );
}
