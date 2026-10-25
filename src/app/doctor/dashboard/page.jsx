"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, Calendar, FileText, AlertTriangle, ChevronRight, Activity, 
  DollarSign, Clock, Video, CheckCircle2, Stethoscope, Sparkles 
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

export default function DoctorDashboard() {
  const { user: authUser } = useAuth()
  const [doctor, setDoctor] = useState(authUser)
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [doctorStats, setDoctorStats] = useState({ totalEarnings: 0, weeklyConsultations: [] })
  const [isLoading, setIsLoading] = useState(false)

  // Sync immediately with auth user
  useEffect(() => {
    if (authUser) {
      setDoctor(authUser)
    }
  }, [authUser])

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        if (!doctor && typeof window !== 'undefined') {
          const activeStorage = localStorage.getItem('token') ? localStorage : sessionStorage;
          const storedUser = activeStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setDoctor(parsedUser.user || parsedUser);
          }
        }

        const [apptsRes, repsRes, statsRes] = await Promise.allSettled([
          api.get('/appointments/doctor'),
          api.get('/reports/doctor'),
          api.get('/doctors/dashboard/stats')
        ])

        if (apptsRes.status === 'fulfilled' && apptsRes.value.data.success) {
          setAppointments(apptsRes.value.data.data.sort((a, b) => new Date(b.date) - new Date(a.date)))
        }
        if (repsRes.status === 'fulfilled' && repsRes.value.data.success) {
          setReports(repsRes.value.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setDoctorStats(statsRes.value.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch doctor dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctorData()
    const interval = setInterval(fetchDoctorData, 15000)
    return () => clearInterval(interval)
  }, [])

  const currentDoctor = doctor || authUser || {}

  const upcomingAppointments = appointments.filter(a =>
    a.status === "Upcoming" || a.status === "scheduled" || a.status === "Scheduled" || a.status === "confirmed"
  )

  const todayAppointments = upcomingAppointments.filter(a => {
    const aptDate = new Date(a.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  })

  const pendingReportsCount = reports.filter(
    r => r.status === 'pending' || r.status === 'Under Doctor Review' || r.status === 'Draft by AI'
  ).length

  const uniquePatientsCount = Array.from(new Set(appointments.map(a => a.patient?._id).filter(Boolean))).length

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
              Verified Physician Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, Dr. {currentDoctor.fullName || currentDoctor.name || "Physician"}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Specialization: <span className="text-teal-300 font-semibold">{currentDoctor.specialization || "General Medicine"}</span> • {currentDoctor.hospitalName || "MediAI Clinical Network"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/doctor/chat">
              <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 h-11 rounded-xl shadow-lg shadow-teal-500/25 transition-all">
                <Video className="w-4 h-4 mr-2" /> Start Consultation
              </Button>
            </Link>
            <Link href="/doctor/appointments">
              <Button variant="outline" className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white font-medium px-4 h-11 rounded-xl transition-all">
                View Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Notice if not approved */}
      {currentDoctor.verificationStatus && currentDoctor.verificationStatus !== 'approved' && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-4 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm font-medium">
              Your profile is currently <span className="font-bold underline">{currentDoctor.verificationStatus}</span>. Hospital administrators will review your medical credentials.
            </p>
          </div>
          <Link href="/doctor/settings">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
              Review Documents
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/doctor/patient-queue" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Patients</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{uniquePatientsCount}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Active in care registry
            </p>
          </div>
        </Link>

        <Link href="/doctor/appointments" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Schedule</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{todayAppointments.length}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> {upcomingAppointments.length} total upcoming
            </p>
          </div>
        </Link>

        <Link href="/doctor/reports" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Reports</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{pendingReportsCount}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI drafts under review
            </p>
          </div>
        </Link>

        <Link href="/doctor/earnings" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Consultation Wallet</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">₹{Number(doctorStats.totalEarnings || 0).toLocaleString()}</div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              Direct consultation revenue
            </p>
          </div>
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left 2 Cols: Appointments & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 py-4 px-6">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Recent Patient Interactions</CardTitle>
                <CardDescription className="text-xs text-slate-500">Direct consultations and booked slots</CardDescription>
              </div>
              <Link href="/doctor/appointments">
                <Button variant="ghost" size="sm" className="gap-1 text-teal-600 font-semibold text-xs">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {appointments.length > 0 ? (
                  appointments.slice(0, 4).map((apt) => (
                    <div 
                      key={apt._id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-white hover:bg-slate-50/70 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {apt.patient?.fullName?.charAt(0) || "P"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 text-sm">{apt.patient?.fullName || "Patient"}</h4>
                            <Badge variant={apt.status === 'confirmed' || apt.status === 'scheduled' ? 'success' : 'secondary'} className="text-[10px] px-2 py-0.5">
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{apt.reason || "General Medical Consultation"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{apt.time || "09:00 AM"}</span>
                        <Link href="/doctor/chat">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 rounded-lg font-medium">
                            Consult
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No appointments scheduled</p>
                    <p className="text-xs text-slate-400 mt-1">New booking requests from patients will appear here automatically.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Consultation Graph */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Consultation Volume</CardTitle>
                <CardDescription className="text-xs text-slate-500">Weekly patient interaction activity</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-teal-700 border-teal-200 bg-teal-50">
                This Week
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {doctorStats.weeklyConsultations && doctorStats.weeklyConsultations.length > 0 && doctorStats.weeklyConsultations.some(d => d.count > 0) ? (
                (() => {
                  const maxCount = Math.max(...doctorStats.weeklyConsultations.map(d => d.count), 1);
                  return (
                    <div className="flex items-end gap-3 h-44 px-2 pb-2">
                      {doctorStats.weeklyConsultations.map((item, i) => {
                        const pct = Math.max(Math.round((item.count / maxCount) * 100), item.count > 0 ? 15 : 4);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full group">
                            <div className="text-[10px] font-mono text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                              {item.count}
                            </div>
                            <div
                              className="w-full bg-linear-to-t from-teal-600 to-teal-400 rounded-lg hover:from-teal-500 hover:to-teal-300 transition-all cursor-pointer shadow-xs"
                              style={{ 
                                height: `${pct}%`,
                                background: item.count > 0 ? 'linear-gradient(to top, #0d9488, #2dd4bf)' : '#f1f5f9'
                              }}
                            />
                            <span className="text-xs font-semibold text-slate-600">
                              {item.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-slate-200 rounded-xl">
                  <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No consultations logged this week</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">As patients book and complete visits, your weekly throughput will visualize here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Schedule & Quick Actions */}
        <div className="space-y-6">
          {/* Today's Agenda */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Today's Queue</span>
                <span className="text-xs font-mono font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  {todayAppointments.length} Booked
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {todayAppointments.length > 0 ? (
                  todayAppointments.slice(0, 4).map((apt) => (
                    <div key={apt._id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-14 text-center shrink-0">
                        <p className="text-xs font-bold text-slate-900">{apt.time?.split(' ')[0] || "09:00"}</p>
                        <p className="text-[10px] font-mono text-slate-400">{apt.time?.split(' ')[1] || "AM"}</p>
                      </div>
                      <div className="flex-1 pl-2 border-l-2 border-teal-500">
                        <p className="font-semibold text-slate-900 text-sm">{apt.patient?.fullName || "Patient"}</p>
                        <p className="text-xs text-slate-500 mb-2">{apt.consultationType || "Video Call"}</p>
                        <Link href="/doctor/chat">
                          <Button size="sm" variant="outline" className="h-7 text-xs border-teal-300 text-teal-700 hover:bg-teal-50 w-full">
                            Open Room
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No consultations queued for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Doctor Hub */}
          <div className="rounded-2xl bg-linear-to-br from-slate-900 to-teal-950 p-6 text-white border border-teal-800/40 shadow-lg">
            <h3 className="font-bold text-sm text-teal-300 uppercase tracking-wider mb-2">Physician Quick Actions</h3>
            <p className="text-xs text-slate-300 mb-4">
              Access telemetry scanner, AI prescription verification, or adjust daily clinic availability.
            </p>
            <div className="space-y-2">
              <Link href="/doctor/emergency-scanner" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-medium border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 h-9 rounded-xl">
                  <Activity className="w-3.5 h-3.5 mr-2 text-teal-400" /> Biometric Patient Scanner
                </Button>
              </Link>
              <Link href="/doctor/reports" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-medium border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 h-9 rounded-xl">
                  <FileText className="w-3.5 h-3.5 mr-2 text-blue-400" /> Review Prescription Drafts
                </Button>
              </Link>
              <Link href="/doctor/schedule" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-medium border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 h-9 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-purple-400" /> Manage Clinic Hours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
