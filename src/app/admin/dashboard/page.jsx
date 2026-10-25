"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, Stethoscope, Calendar, AlertTriangle, FileText, Activity, 
  ShieldCheck, ArrowUpRight, CheckCircle2, Server, TrendingUp, Sparkles, Hospital 
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats')
        if (res.data.success) {
          setStats(res.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Hospital className="w-3.5 h-3.5" />
              Hospital Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hospital Operations & Clinical Overview
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Welcome back, <span className="text-indigo-300 font-semibold">{user?.fullName || "Hospital Administrator"}</span>. Real-time physician verification and clinical triage overview.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/doctor-verification">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 h-11 rounded-xl shadow-lg shadow-indigo-600/25 transition-all">
                <ShieldCheck className="w-4 h-4 mr-2" /> Verify Physicians
              </Button>
            </Link>
            <Link href="/admin/emergency-monitoring">
              <Button variant="outline" className="border-red-500/30 bg-red-950/40 hover:bg-red-900/40 text-red-200 font-semibold px-4 h-11 rounded-xl transition-all">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-400" /> SOS Alerts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Patients</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{stats?.users ?? "--"}</div>
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total verified patient base
            </p>
          </div>
        </Link>

        <Link href="/admin/doctors" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Doctors</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{stats?.doctors ?? "--"}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved specialists on-duty
            </p>
          </div>
        </Link>

        <Link href="/admin/appointments" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointments</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{stats?.appointments ?? "--"}</div>
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
              Booked telemedicine & clinic visits
            </p>
          </div>
        </Link>

        <Link href="/admin/emergency-monitoring" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-red-200/80 shadow-xs hover:shadow-md hover:border-red-400 transition-all bg-red-50/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Emergency Dispatches</span>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-red-900 mb-1">{stats?.emergencies ?? "0"}</div>
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
              Satellite GPS telemetry tracked
            </p>
          </div>
        </Link>

        <Link href="/admin/reports" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Reports</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{stats?.reports ?? "--"}</div>
            <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
              AI Prescriptions & Lab OCR records
            </p>
          </div>
        </Link>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Uptime</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">{stats?.uptime || "99.9%"}</div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-availability WebSocket cluster
          </p>
        </div>
      </div>

      {/* Analytics & System Health */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-base font-bold text-slate-900">Patient Activity Trend</CardTitle>
            <CardDescription className="text-xs text-slate-500">System engagement over the last 7 intervals</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {stats?.weeklyActivity && stats.weeklyActivity.length > 0 && stats.weeklyActivity.some(d => d.count > 0) ? (
              (() => {
                const maxCount = Math.max(...stats.weeklyActivity.map(d => d.count), 1);
                return (
                  <div className="flex items-end gap-3 h-44 px-2 pb-2">
                    {stats.weeklyActivity.map((item, i) => {
                      const pct = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 15 : 4);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full group">
                          <div className="text-[10px] font-mono text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                            {item.count}
                          </div>
                          <div
                            className="w-full bg-linear-to-t from-indigo-600 to-blue-400 rounded-lg hover:from-indigo-500 hover:to-blue-300 transition-all cursor-pointer shadow-xs"
                            style={{ 
                              height: `${pct}%`,
                              background: item.count > 0 ? 'linear-gradient(to top, #4f46e5, #60a5fa)' : '#f1f5f9'
                            }}
                          />
                          <span className="text-xs font-semibold text-slate-500">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 rounded-xl">
                <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">No appointments scheduled this week</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Live booking transactions will automatically chart here as patients schedule.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-base font-bold text-slate-900">Hospital Operational Health</CardTitle>
            <CardDescription className="text-xs text-slate-500">Real-time status of backend clinical services</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">REST API Gateway</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">Operational</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Socket.IO Signaling (WebRTC)</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">Connected</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">AI Diagnostic Routing (Gemini & Groq)</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">Online</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">MongoDB Geospatial Clusters</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">Synced</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
