"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { 
  Users, Activity, AlertTriangle, ShieldCheck, UserCheck, TrendingUp, 
  CheckCircle, Clock, Server, Hospital, Radio, Cpu, ArrowUpRight, ShieldAlert,
  Building2, Sparkles, RefreshCw
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function SuperAdminDashboard() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const authToken = token || (typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null)
      
      const res = await fetch(`${apiBase}/super-admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching super admin stats:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [token])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Global Telemetry & Infrastructure Command
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Super Admin Executive Hub
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Platform-wide governance, hospital tenant registry, specialist credentialing oversight, and live emergency telemetry.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Metrics
            </button>
            <Link href="/super-admin/emergency-control">
              <button className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all">
                <AlertTriangle className="w-4 h-4" /> Live SOS Dispatch
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Global Patients</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {stats?.totalUsers ?? "--"}
          </div>
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Registered citizen records
          </p>
        </div>

        {/* Active Doctors */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Specialists</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {stats?.activeDoctors ?? "--"}
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> On-duty credentialed doctors
          </p>
        </div>

        {/* Registered Hospitals */}
        <Link href="/super-admin/admins" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hospital Centers</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Hospital className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {stats?.totalAdmins ?? "--"}
            </div>
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
              Administered healthcare nodes
            </p>
          </div>
        </Link>

        {/* Active Emergencies */}
        <Link href="/super-admin/emergency-control" className="block group">
          <div className="p-5 rounded-2xl bg-red-50/20 border border-red-200/80 shadow-xs hover:shadow-md hover:border-red-400 transition-all h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Active Emergencies</span>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-red-900 mb-1">
              {stats?.activeEmergencies ?? "0"}
            </div>
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
              Telemetry SOS dispatches
            </p>
          </div>
        </Link>
      </div>

      {/* Main Grid: System Health & Infrastructure vs Fast Navigation Hub */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
        {/* System Health & Operations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Infrastructure Health & Workflow Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status of MediAI microservices and queue throughput</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Nominal Latency
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    REV
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pending Doctor Approvals</h4>
                    <p className="text-xs text-slate-500">Physicians awaiting license credential verification</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                  {stats?.pendingApprovals ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    MED
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Completed Consultations</h4>
                    <p className="text-xs text-slate-500">Successfully closed patient doctor video & clinic visits</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  {stats?.completedAppointments ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    SYS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Node Cluster & MongoDB Shards</h4>
                    <p className="text-xs text-slate-500">Primary replica sets synchronized across active regions</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Operational 99.98%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Administrative Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Administrative Governance
            </h3>

            <div className="grid grid-cols-2 gap-3.5">
              <Link
                href="/super-admin/doctor-verification"
                className="flex flex-col items-center justify-center p-3.5 bg-amber-50/70 rounded-2xl hover:bg-amber-100 transition-all border border-amber-200 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-amber-950">Verify Doctors</span>
                <span className="text-[10px] text-amber-700 mt-0.5">Approve / Reject</span>
              </Link>

              <Link
                href="/super-admin/doctors"
                className="flex flex-col items-center justify-center p-3.5 bg-blue-50/70 rounded-2xl hover:bg-blue-100 transition-all border border-blue-200 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-blue-950">All Doctors</span>
                <span className="text-[10px] text-blue-700 mt-0.5">Hospitals Registry</span>
              </Link>

              <Link
                href="/super-admin/admins"
                className="flex flex-col items-center justify-center p-3.5 bg-indigo-50/60 rounded-2xl hover:bg-indigo-100/80 transition-all border border-indigo-100 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-indigo-950">Manage Hospitals</span>
                <span className="text-[10px] text-indigo-700 mt-0.5">Hospital Tenants</span>
              </Link>

              <Link
                href="/super-admin/patients"
                className="flex flex-col items-center justify-center p-3.5 bg-cyan-50/60 rounded-2xl hover:bg-cyan-100 transition-all border border-cyan-100 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-cyan-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-cyan-950">Manage Patients</span>
                <span className="text-[10px] text-cyan-700 mt-0.5">Health Records</span>
              </Link>

              <Link
                href="/super-admin/ambulances"
                className="flex flex-col items-center justify-center p-3.5 bg-emerald-50/60 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-emerald-950">Ambulance Fleet</span>
                <span className="text-[10px] text-emerald-700 mt-0.5">Manage & Dispatch</span>
              </Link>

              <Link
                href="/super-admin/emergency-control"
                className="flex flex-col items-center justify-center p-3.5 bg-red-50/60 rounded-2xl hover:bg-red-100/80 transition-all border border-red-100 text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-red-950">Emergency Hub</span>
                <span className="text-[10px] text-red-700 mt-0.5">Live SOS</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
