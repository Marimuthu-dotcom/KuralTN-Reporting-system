import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { LanguageToggle } from "../../components/common/LanguageToggle";
import { DEMO_ACCOUNTS } from "../../utils/constants";
import { Button } from "../../components/common/Button";
import {
  User,
  Shield,
  PlusCircle,
  X,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const { t, isTamil } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Four predefined static accounts for Google account chooser and quick-test personas
  const GOOGLE_ACCOUNTS = DEMO_ACCOUNTS;

  // Preserve intended destination with query params if available
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/dashboard";

  const handlePostLoginRedirect = (res) => {
    // If backend specifies account is pending administrator approval
    if (res?.redirectTo === "/pending-approval" || res?.authStatus === "PENDING_APPROVAL") {
      navigate("/pending-approval", { replace: true });
      return;
    }

    // If backend specifies a required step (e.g. /onboarding, /verification-pending)
    if (res?.redirectTo === "/onboarding" || res?.authStatus === "NEW_ACCOUNT_PENDING_DETAILS" || res?.authStatus === "INCOMPLETE_REGISTRATION") {
      navigate("/onboarding", { replace: true });
      return;
    }

    if (res?.redirectTo === "/verification-pending" || res?.authStatus === "PENDING_WARD_VERIFICATION" || res?.authStatus === "WARD_VERIFICATION_REJECTED") {
      navigate("/verification-pending", { replace: true });
      return;
    }

    // Role-specific routing from trusted backend response
    if (res?.redirectTo) {
      if (res.user?.role === "CITIZEN" && from !== "/dashboard") {
        navigate(from, { replace: true });
      } else {
        navigate(res.redirectTo, { replace: true });
      }
      return;
    }

    // Fallback if res only contains user
    const role = res?.user?.role || res?.role;
    if (role === "WARD_COUNCILLOR") navigate("/councillor", { replace: true });
    else if (role === "ACCOUNTABILITY_REVIEWER") navigate("/reviewer", { replace: true });
    else if (role === "ADMIN") navigate("/admin", { replace: true });
    else if (role === "DEPARTMENT_HANDLER") navigate("/councillor/assignments", { replace: true });
    else navigate(from, { replace: true });
  };

  const executeGoogleAuth = async (googleAccountPayload) => {
    setIsLoading(true);
    setError("");
    setShowAccountChooser(false);
    try {
      // Create valid JWT structure standard for Google tokens
      const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
      const payload = btoa(
        JSON.stringify({
          sub: googleAccountPayload.sub,
          email: googleAccountPayload.email,
          name: googleAccountPayload.name,
          picture: googleAccountPayload.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          email_verified: true,
          iss: "https://accounts.google.com",
          aud: "tn-civic-applet",
        })
      );
      const signature = btoa("mock_secure_google_signature");
      const credential = `${header}.${payload}.${signature}`;

      const res = await loginWithGoogle(credential);
      handlePostLoginRedirect(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGoogleAccount = (account) => {
    executeGoogleAuth({
      sub: account.sub || account.id,
      email: account.email,
      name: account.name || account.full_name,
      picture: account.picture || account.avatar_url,
    });
  };

  const handleNewGoogleCitizen = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setError("Please provide a valid Google email address");
      return;
    }

    const email = customEmail.toLowerCase().trim();
    const name = customName.trim() || email.split("@")[0].replace(/[._-]/g, " ");

    // Generate deterministic stable sub from email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = (hash << 5) - hash + email.charCodeAt(i);
      hash |= 0;
    }
    const stableSub = `google_sub_${Math.abs(hash).toString(16).padStart(12, "0")}`;

    executeGoogleAuth({
      sub: stableSub,
      email,
      name,
      picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    });
  };

  const handleDemoLogin = async (account) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await loginWithGoogle(null, account.id || account.userId);
      handlePostLoginRedirect(res);
    } catch (err) {
      setError(err.response?.data?.message || (isTamil ? "உள்நுழைவு தோல்வியடைந்தது" : "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-[#171717]">
          {isTamil ? "உங்கள் கணக்கில் உள்நுழைக" : "Sign In to Your Account"}
        </h1>
        <p className="text-xs text-[#737373]">
          {isTamil
            ? "வார்டு புகார்கள், மக்கள் கலந்துரையாடல் மற்றும் தீர்வுகளை அணுகுங்கள்"
            : "Access your ward grievances, community discussions, and official updates"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setShowAccountChooser(true)}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#171717] hover:bg-neutral-50 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {isLoading
            ? isTamil
              ? "சரிபார்க்கிறது..."
              : "Authenticating with Google..."
            : isTamil
            ? "கூகிள் மூலம் உள்நுழைக (Google Sign In)"
            : "Continue with Google"}
        </span>
      </button>

      {/* Google Account Chooser Modal (prompt=select_account) */}
      {showAccountChooser && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-[#171717]">Sign in with Google</h3>
                  <p className="text-[11px] text-[#737373]">Choose an account to continue to KuralTN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAccountChooser(false);
                  setShowCustomForm(false);
                }}
                className="text-[#737373] hover:text-[#171717] p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!showCustomForm ? (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id || acc.sub}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc)}
                    className="w-full text-left p-3 rounded-xl border border-[#E7E5E4] hover:border-[#F97316] hover:bg-orange-50/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.picture || acc.avatar}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#E7E5E4]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#171717] group-hover:text-[#F97316]">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-[#737373]">{acc.email}</div>
                        <div className="text-[10px] text-neutral-500">{acc.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {acc.role.replace(/_/g, " ")}
                    </span>
                  </button>
                ))}

                {/* Option to create a new Google account or use another email */}
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full text-left p-3 rounded-xl border border-dashed border-[#E7E5E4] hover:border-[#F97316] hover:bg-neutral-50 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-[#737373] group-hover:text-[#F97316]">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] group-hover:text-[#F97316]">
                      Register New User Account
                    </div>
                    <div className="text-[11px] text-[#737373]">
                      New registrations require administrator verification and role approval
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewGoogleCitizen} className="space-y-3 pt-1">
                <div className="text-xs font-bold text-[#171717]">
                  Register / Sign In with New Google Account
                </div>
                <p className="text-[11px] text-[#737373]">
                  Enter your Google email address. In accordance with security policy, new user accounts are placed in <strong>Pending Administrator Approval</strong> status until a System Administrator reviews and assigns an authorized role.
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#171717]">
                    Google Verified Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kavitha.murugan@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#171717]">
                    Display Name (Optional, prefilled from Google)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kavitha Murugan"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Back to Accounts
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    Continue with Account
                  </Button>
                </div>
              </form>
            )}

            <div className="text-[10px] text-[#737373] text-center pt-2 border-t border-[#E7E5E4]">
              To protect your account, Google will share your verified name, email address, and profile picture with KuralTN.
            </div>
          </div>
        </div>
      )}

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-[#E7E5E4]" />
        <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
          {isTamil ? "அல்லது மாதிரி பயனராக நுழைக" : "Or Quick Test With Demonstration Persona"}
        </span>
        <div className="flex-grow border-t border-[#E7E5E4]" />
      </div>

      {/* Demo Persona Buttons: Exactly Four Predefined Static User Accounts */}
      <div className="space-y-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.id || acc.userId}
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoLogin(acc)}
            className="w-full text-left p-3 rounded-xl border border-[#E7E5E4] bg-neutral-50 hover:bg-orange-50/60 hover:border-[#F97316] transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-[#171717] group-hover:text-[#F97316]">
                {acc.name}
              </div>
              <div className="text-[11px] text-[#737373]">{acc.desc}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E7E5E4] text-neutral-700">
              {acc.role.replace(/_/g, " ")}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link to="/" className="text-xs text-[#737373] hover:text-[#171717]">
          &larr; {isTamil ? "முகப்புப் பக்கத்திற்குத் திரும்புக" : "Back to public homepage"}
        </Link>
      </div>
    </div>
  );
}
