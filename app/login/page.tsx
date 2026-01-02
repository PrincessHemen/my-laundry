'use client'

import { useState, useEffect } from "react";
import { signUpWithEmail, loginWithEmail, signInWithGoogle, sendResetPasswordEmail } from "../lib/auth"; 
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { z } from "zod";


// ------------------
// TYPES
// ------------------

type AuthAction = "Login" | "Sign Up";

type Message = {
  type: "success" | "error" | "info"; // Or other message types
  text: string;
}

// ------------------
// ZOD SCHEMAS
// ------------------

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = loginSchema.extend({
  name: z.string().min(1, { message: "Name is required" }),
});


export default function LoginPage() {

  useEffect(() => {
    document.title = "Login | MyLaundry";
  }, [])

  const router = useRouter(); 

  const [action, setAction] = useState<AuthAction>("Login");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<Message | null>(null); 
  const [user, setUser] = useState<User | null>(null);

  // ------------------
  // AUTH STATE CHECK 
  // ------------------

  useEffect(() => {
    // optional: listen to auth state and redirect if already logged in
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
      if (u) {
        setMsg({ type: "success", text: `Signed in as ${u.displayName || u.email}` });
        // TODO: redirect to app/dashboard if desired
        router.replace("/dashboard");
      }
    });
    return () => unsub();
  }, []);

  const resetMsg = () => setMsg(null);

  // ------------------
  // EMAIL LOGIN / SIGNUP
  // ------------------

  async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();

    resetMsg();
    
    try {
      // Choose schema based on action
      const schema = action === "Sign Up" ? signUpSchema : loginSchema;
    
      // Validate form data
      schema.parse({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        // Show first validation error
        setMsg({ type: "error", text: err.issues[0].message });
        return;
      }
      throw err; // rethrow for Firebase error handling
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
    } catch (err: any) {
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

  // ------------------
  // GOOGLE LOGIN
  // ------------------

  async function handleGoogle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    resetMsg()

    setLoading(true)

    try {
      await signInWithGoogle()
      setMsg({type: "success", text: "Signed in with Google."})
    } catch {
      setMsg({type: "error", text: "Google Sign In Failed."})
    } finally {
      setLoading(false)
    }
  }

  // ------------------
  // FORGOT PASSWORD
  // ------------------

  async function handleForgotPassword() {
    resetMsg()

    if (!email.trim()) {
      setMsg({type: "error", text: "Enter your email to reset the password."})
      return
    }

    setLoading(true)

    try {
      await sendResetPasswordEmail(email.trim())
      setMsg({type: "success", text: "Password reset email sent."})
    } catch {
      setMsg({type: "error", text: "Could not send password reset email."})
    } finally {
      setLoading(false)
    }
  }

  // If User already logged in

  if (user) {
    return (

      <div className="min-h-screen justify-center items-center flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-[#7231EC] relative overflow-hidden">
        <div className="p-6 bg-white shadow rounded justify-center items-center w-1/2 text-center">
          <p className="mb-4 font-semibold">
            Signed in as: {user.displayName || user.email}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-indigo-900 text-white rounded hover:cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
      
    );
  }

  // ------------------
  // UI RENDER
  // ------------------

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-90 relative overflow-hidden">

      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md">

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900">{action}</h1>
          <div className="w-20 h-1 bg-indigo-900 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* FEEDBACK MESSAGE */}
        {msg && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              msg.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleEmailAuth} className="space-y-5">

          {/* Name field only for Sign Up */}
          {action === "Sign Up" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              disabled={loading}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 outline-none text-gray-700"
            />
          )}

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={loading} 
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 outline-none text-gray-700"
          />

          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={loading} 
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 outline-none text-gray-700"
          />

          {/* SUBMIT BUTTON */}
          <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-900 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Please wait..." : action === "Sign Up" ? "Create Account" : "Login"}
          </button>

          {/* TOGGLE BUTTONS */}
          <div className="flex items-center justify-between mt-4">
            <button
            type="button"
            onClick={() => { setAction("Login"); resetMsg(); }}
            className={`w-[48%] py-3 rounded-lg text-lg font-semibold transition ${
            action === "Login"
            ? "bg-indigo-900 text-white shadow-lg"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            >
              Login
            </button>

            <button
            type="button"
            onClick={() => { setAction("Sign Up"); resetMsg(); }}
            className={`w-[48%] py-3 rounded-lg text-lg font-semibold transition ${
            action === "Sign Up"
            ? "bg-indigo-900 text-white shadow-lg"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            >
              Sign Up
            </button>
          </div>

        </form>

        {/* LOST PASSWORD (Login only) */}
        {action === "Login" && (
          <div className="text-right mt-4 text-gray-600 text-sm">
            Lost Password?{" "}
            <span onClick={handleForgotPassword} className="text-indigo-800 font-semibold cursor-pointer">
              Click here
            </span>
          </div>
        )}

        {/* GOOGLE BUTTON */}
        <button 
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          className="mt-6 w-full bg-indigo-900 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition hover:cursor-pointer">
            
            {loading ? "Please wait..." : action === "Sign Up" ? "Sign In with Google" : "Log in with Google"}
        
        </button>

      </div>
    </div>
  );
}
