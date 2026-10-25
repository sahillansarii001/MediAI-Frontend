"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Activity, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Logo from "@/components/shared/Logo"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsOtp, setNeedsOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()



  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = { email, password }
      console.log("[LoginPage] Submitting login");

      const response = await api.post('/auth/login', payload)
      console.log("[LoginPage] Response received:", response.data);

      if (response.data.success) {
        login(response.data, response.data.token, response.data.role, rememberMe)
      }
    } catch (err) {
      console.error("[LoginPage] Login error:", err);
      
      // Handle the case where the doctor is approved but needs to enter OTP
      if (err.response?.status === 401 && err.response?.data?.requireOtp) {
        setNeedsOtp(true)
        setError(err.response.data.message)
      } else {
        setError(err.response?.data?.message || "Failed to login.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      }

      const res = await api.post('/auth/verify-otp', payload)

      if (res.data.success) {
        // If verify-otp returns tokens directly, log in immediately
        if (res.data.token && res.data.role) {
          login(res.data, res.data.token, res.data.role, rememberMe)
        } else {
          // Otherwise re-authenticate
          const loginPayload = { email, password }
          const loginRes = await api.post('/auth/login', loginPayload)
          if (loginRes.data.success) {
            login(loginRes.data, loginRes.data.token, loginRes.data.role, rememberMe)
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden bg-white">
      {/* Left side - Brand/Hero (Hidden on smaller screens) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between bg-slate-900 p-12 text-white overflow-hidden">
        {/* Background gradient/image effect */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-teal-950 z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Brand */}
        <div className="relative z-10">
          <Logo href="/" variant="light" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            Verified Clinical Portal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Connected Healthcare <br/>
            <span className="text-teal-400">Intelligence.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed font-normal">
            Secure, end-to-end encrypted access to your health vault, real-time diagnostic consultations, and physician records.
          </p>
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-medium text-slate-400">
            <div>
              <div className="text-white font-mono font-bold text-base">AES-256</div>
              <div>End-to-End Encryption</div>
            </div>
            <div>
              <div className="text-white font-mono font-bold text-base">99.4%</div>
              <div>Clinical Precision</div>
            </div>
          </div>
        </div>

        {/* Bottom Footer or Trust Badge */}
        <div className="relative z-10 text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} MediAI Health Inc. • Zero-Knowledge Architecture
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 min-h-screen lg:h-full overflow-y-auto bg-white">
        <div className="w-full max-w-sm flex flex-col justify-center py-8 lg:py-0">
          
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-teal-600 transition-colors group"
            >
              <div className="p-1.5 rounded-lg border border-slate-200 group-hover:border-teal-500/40 group-hover:bg-teal-50 transition-all">
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              Back to Home
            </Link>
          </div>

          {/* Mobile Header (Only visible on small screens) */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <Logo href="/" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
              <p>{error}</p>
            </div>
          )}

          {needsOtp ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 mb-2">
                <Label htmlFor="otp" className="font-medium text-slate-700">Verification Code</Label>
                <p className="text-xs text-slate-500 mb-2">Enter the 6-digit code sent to <span className="font-medium text-slate-700">{email}</span></p>
                <Input
                  id="otp"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="text-center text-3xl tracking-[0.5em] h-14 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all font-mono"
                  placeholder="000000"
                />
              </div>
              <div className="space-y-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all" 
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setNeedsOtp(false); setOtp(""); setError(""); }} 
                  className="w-full h-11 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium text-slate-700">Password</Label>
                  <Link href="/auth/forgot-password" size="sm" className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-12 h-12 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 transition-colors" 
                />
                <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all duration-300" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link href={`/auth/register`} className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
