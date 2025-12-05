'use client'

import { useState, useEffect } from "react";
import { signUpWithEmail, loginWithEmail, signInWithGoogle, sendResetPasswordEmail } from "../lib/auth"; 
import { onAuthStateChanged, User } from "firebase/auth";
// import { auth } from "../lib/firebase";

export default function LoginPage() {
  const [action, setAction] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Message | null>(null); 
  const [user, setUser] = useState(null);

  type Message = {
    type: "success" | "error" | "info"; // Or other message types
    text: string;
  }

  useEffect(() => {
    // optional: listen to auth state and redirect if already logged in
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
      if (u) {
        setMsg({ type: "success", text: `Signed in as ${u.displayName || u.email}` });
        // TODO: redirect to app/dashboard if desired
      }
    });
    return () => unsub();
  }, []);

  const resetMsg = () => setMsg(null);

  async function handleEmailAuth(e) {
    e?.preventDefault();

    resetMsg();
    
    if (!email || !password || (action === "Sign Up" && !name)) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }
    setLoading(true);
    try {
      if (action === "Sign Up") {
        await signUpWithEmail(name.trim(), email.trim(), password);
        setMsg({ type: "success", text: "Account created. You are now signed in." });
      } else {
        await loginWithEmail(email.trim(), password);
        setMsg({ type: "success", text: "Welcome back!" });
      }
    } catch (err) {
      // friendly error messages (firebase throws codes we can check)
      const code = err?.code || err?.message || "auth/error";

      let friendly = "Something went wrong. Please try again.";

      if (code.includes("auth/email-already-in-use")) friendly = "Email already in use.";
      if (code.includes("auth/invalid-email")) friendly = "Invalid email address.";
      if (code.includes("auth/wrong-password")) friendly = "Incorrect password.";
      if (code.includes("auth/user-not-found")) friendly = "No account found with this email.";
      if (code.includes("auth/weak-password")) friendly = "Weak password; choose a stronger one.";
      setMsg({ type: "error", text: friendly });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-90 relative overflow-hidden">

      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900">{action}</h1>
          <div className="w-20 h-1 bg-indigo-900 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* Name field only for Sign Up */}
          {action === "Sign Up" && (
            <input
              type="text"
              placeholder="Your name"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 outline-none text-gray-700"
            />
          )}

          <input
            type="email"
            placeholder="Your email"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 outline-none text-gray-700"
          />

          <input
            type="password"
            placeholder="Your password"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 outline-none text-gray-700"
          />
        </div>

        {/* LOST PASSWORD (Login only) */}
        {action === "Login" && (
          <div className="text-right mt-4 text-gray-600 text-sm">
            Lost Password?{" "}
            <span className="text-indigo-800 font-semibold cursor-pointer">
              Click here
            </span>
          </div>
        )}

        {/* GOOGLE BUTTON */}
        <button className="mt-6 w-full bg-indigo-900 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition hover:cursor-pointer">
          {action === "Sign Up" ? "Sign Up with Google" : "Log In with Google"}
        </button>

        {/* TOGGLE BUTTONS */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setAction("Login")}
            className={`w-[48%] py-3 rounded-lg hover:cursor-pointer text-lg font-semibold transition ${
              action === "Login"
                ? "bg-indigo-900 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setAction("Sign Up")}
            className={`w-[48%] py-3 rounded-lg hover:cursor-pointer text-lg font-semibold transition ${
              action === "Sign Up"
                ? "bg-indigo-900 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
}
