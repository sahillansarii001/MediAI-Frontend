"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { 
  HeartPulse, Activity, Weight, Calendar, Clock, AlertTriangle, 
  ChevronRight, Bell, XCircle, CalendarCheck, FileText, Plus, 
  Sparkles, ShieldAlert, Pill, UserCheck, Stethoscope, ArrowUpRight,
  TrendingUp, Droplet, Thermometer
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { formatDoctorName } from "@/lib/utils"

export default function PatientDashboard() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState(authUser)
  const [appointments, setAppointments] = useState([])
  const [reminders, setReminders] = useState([])
  const [reports, setReports] = useState([])
  const [notifications, setNotifications] = useState([])
  const [weeklyActivity, setWeeklyActivity] = useState([])
  const [latestVitals, setLatestVitals] = useState(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)

  // Manual Form States
  const [manualForm, setManualForm] = useState({
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    temperature: "",
    oxygenLevel: "",
    weight: "",
    bloodSugar: ""
  })

  // Sync with auth user immediately
  useEffect(() => {
    if (authUser) {
      setUser(authUser)
    }
  }, [authUser])

  const fetchDashboardData = async () => {
    try {
      if (!user && typeof window !== 'undefined') {
        const activeStorage = localStorage.getItem('token') ? localStorage : sessionStorage;
        const storedUser = activeStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser.user || parsedUser);
        }
      }

      const [apptsRes, remsRes, repsRes, notifsRes, vitalsRes, activityRes] = await Promise.allSettled([
        api.get('/appointments/patient'),
        api.get('/medicines/patient'),
        api.get('/reports/patient'),
        api.get('/notifications'),
        api.get('/patient/vitals/latest'),
        api.get('/patient/activity/weekly')
      ])

      if (apptsRes.status === 'fulfilled' && apptsRes.value.data.success) {
        setAppointments(apptsRes.value.data.data.sort((a, b) => new Date(b.date) - new Date(a.date)))
      }
      if (remsRes.status === 'fulfilled' && remsRes.value.data.success) {
        setReminders(remsRes.value.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
      if (repsRes.status === 'fulfilled' && repsRes.value.data.success) {
        setReports(repsRes.value.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value.data.success) {
        setNotifications(notifsRes.value.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
      if (vitalsRes.status === 'fulfilled' && vitalsRes.value.data.success) {
        setLatestVitals(vitalsRes.value.data.data)
      }
      if (activityRes.status === 'fulfilled' && activityRes.value.data.success) {
        setWeeklyActivity(activityRes.value.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch patient dashboard data", error)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const handleCancelledEvent = () => {
      fetchDashboardData()
    }
    window.addEventListener("appointmentCancelled", handleCancelledEvent)

    const interval = setInterval(fetchDashboardData, 20000)
    return () => {
      clearInterval(interval)
      window.removeEventListener("appointmentCancelled", handleCancelledEvent)
    }
  }, [])

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingManual(true)
    try {
      const payload = {
        heartRate: manualForm.heartRate ? Number(manualForm.heartRate) : undefined,
        systolicBP: manualForm.systolicBP ? Number(manualForm.systolicBP) : undefined,
        diastolicBP: manualForm.diastolicBP ? Number(manualForm.diastolicBP) : undefined,
        temperature: manualForm.temperature ? Number(manualForm.temperature) : undefined,
        oxygenLevel: manualForm.oxygenLevel ? Number(manualForm.oxygenLevel) : undefined,
        weight: manualForm.weight ? Number(manualForm.weight) : undefined,
        bloodSugar: manualForm.bloodSugar ? Number(manualForm.bloodSugar) : undefined,
        source: 'manual',
        recordedAt: new Date()
      }

      const res = await api.post('/patient/vitals', payload)
      if (res.data.success) {
        toast.success("Health vitals recorded successfully!")
        setLatestVitals(res.data.data)
        setIsManualModalOpen(false)
        setManualForm({
          heartRate: "",
          systolicBP: "",
          diastolicBP: "",
          temperature: "",
          oxygenLevel: "",
          weight: "",
          bloodSugar: ""
        })
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Failed to record vitals:", error)
      toast.error(error.response?.data?.message || "Failed to record vitals")
    } finally {
      setIsSubmittingManual(false)
    }
  }

  const upcomingAppointments = appointments.filter(a =>
    a.status === "Upcoming" || a.status === "scheduled" || a.status === "Scheduled" || a.status === "confirmed"
  )

  const currentUser = user || authUser || {}
  const patientDisplayName = currentUser.fullName || currentUser.firstName || "Patient"

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Patient Health Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {patientDisplayName}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Your real-time clinical summary, vital statistics, upcoming appointments, and AI-assisted triage services.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/patient/symptom-checker">
              <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 h-11 rounded-xl shadow-lg shadow-teal-500/25 transition-all">
                <Activity className="w-4 h-4 mr-2" /> Start AI Checkup
              </Button>
            </Link>
            <Link href="/patient/emergency">
              <Button variant="outline" className="border-red-500/40 bg-red-950/40 hover:bg-red-900/40 text-red-200 font-semibold px-4 h-11 rounded-xl transition-all">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-400" /> Emergency SOS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Vitals Quick Entry Callout Banner */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/10 border border-teal-200/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Keep Your Health Records Synchronized</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Accurate resting heart rate, blood pressure, and oxygen levels help doctors diagnose you faster during consultations.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsManualModalOpen(true)}
          className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-5 py-2.5 h-10 rounded-xl shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Log New Vitals
        </Button>
      </div>

      {/* Vital Metric KPI Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Heart Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resting Heart Rate</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {latestVitals?.heartRate ? `${latestVitals.heartRate}` : "--"}
            <span className="text-sm font-medium text-slate-400 ml-1.5">bpm</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {latestVitals?.heartRate ? (
              <span className={`font-semibold ${latestVitals.heartRate >= 60 && latestVitals.heartRate <= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {latestVitals.heartRate >= 60 && latestVitals.heartRate <= 100 ? "● Normal resting pulse" : "● Elevated / Lower pulse"}
              </span>
            ) : (
              <span className="text-slate-400">No records submitted yet</span>
            )}
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Blood Pressure</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {latestVitals?.systolicBP && latestVitals?.diastolicBP ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}` : "--"}
            <span className="text-sm font-medium text-slate-400 ml-1.5">mmHg</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {latestVitals?.systolicBP ? (
              <span className={`font-semibold ${latestVitals.systolicBP <= 125 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {latestVitals.systolicBP <= 125 ? "● Optimal pressure" : "● Pre-hypertension"}
              </span>
            ) : (
              <span className="text-slate-400">Regular checks recommended</span>
            )}
          </div>
        </div>

        {/* Oxygen / SpO2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Blood Oxygen (SpO2)</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mb-1">
            {latestVitals?.oxygenLevel ? `${latestVitals.oxygenLevel}` : "--"}
            <span className="text-sm font-medium text-slate-400 ml-1.5">%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {latestVitals?.oxygenLevel ? (
              <span className={`font-semibold ${latestVitals.oxygenLevel >= 95 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {latestVitals.oxygenLevel >= 95 ? "● Healthy oxygenation" : "● Low blood oxygenation"}
              </span>
            ) : (
              <span className="text-slate-400">Pulse oximeter data</span>
            )}
          </div>
        </div>

        {/* Appointments Count */}
        <Link href="/patient/appointments" className="block group">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Visits</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">
              {upcomingAppointments.length}
            </div>
            <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              {upcomingAppointments.length > 0 ? (
                <>Next: {new Date(upcomingAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
              ) : (
                "Schedule new visit"
              )}
            </p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Health Activity & Clinical Reports vs Reminders & Upcoming */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Health Activity Chart */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Health Engagement Trends</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your clinical interactions, vitals updates, and app activity over the past 7 days</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> Active Streak
                </span>
              </div>
            </div>

            {weeklyActivity.length === 0 || weeklyActivity.every(d => d.activity === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-2xl">
                <Activity className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-600">No activity logged this week yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Start an AI symptom checkup, update your daily vitals, or schedule a doctor appointment to track your momentum.
                </p>
              </div>
            ) : (() => {
              const maxAct = Math.max(...weeklyActivity.map(d => d.activity), 1);
              return (
                <div className="flex items-end gap-3 h-48 mt-4 pt-4 border-b border-slate-100 pb-2">
                  {weeklyActivity.map((d, i) => {
                    const pct = Math.round((d.activity / maxAct) * 100);
                    const heightPct = Math.max(pct, d.activity > 0 ? 12 : 4);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                        <span className="text-[10px] font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.activity} pts
                        </span>
                        <div
                          className="w-full rounded-t-xl transition-all duration-500 cursor-pointer relative"
                          style={{
                            height: `${heightPct}%`,
                            background: d.activity > 0
                              ? `linear-gradient(to top, #0f766e, #2dd4bf)`
                              : '#f1f5f9',
                            minHeight: '6px'
                          }}
                        />
                        <span className="text-xs font-semibold text-slate-500">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Medical Reports & Diagnostic History */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Medical Reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated AI lab draft summaries and specialist validated diagnostic reports</p>
              </div>
              <Link href="/patient/reports">
                <Button variant="ghost" size="sm" className="text-teal-700 hover:text-teal-800 font-semibold gap-1 text-xs">
                  All Reports <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {reports.length > 0 ? (
                reports.slice(0, 4).map((report) => (
                  <div
                    key={report._id || report.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-teal-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{report.title || report.testName || "Medical Diagnostic Report"}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(report.createdAt || report.date).toLocaleDateString()} • Verified by {report.doctor?.fullName || "MediAI Clinical Engine"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        (report.status === 'Approved' || report.status === 'approved' || report.status === 'final')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status || "Pending Review"}
                      </span>
                      <Link href={`/patient/reports`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold rounded-lg">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No medical reports found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Upload lab results or request consultations to generate records</p>
                  <Link href="/patient/reports" className="inline-block mt-3">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold">
                      Upload New Report
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming Consultations */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Upcoming Consults
              </h3>
              <Link href="/patient/appointments" className="text-xs text-indigo-600 hover:underline font-semibold">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 3).map((apt) => (
                  <div key={apt._id || apt.id} className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{formatDoctorName(apt.doctor?.fullName || "Physician")}</h4>
                        <p className="text-xs text-indigo-700 font-medium">{apt.doctor?.specialization || "Clinical Specialist"}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800 uppercase">
                        {apt.consultationType || "Telemedicine"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-white/80 p-2.5 rounded-xl border border-indigo-100/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        {new Date(apt.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {apt.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs font-semibold text-slate-500">No pending visits</p>
                  <Link href="/patient/doctor-recommendation" className="inline-block mt-2">
                    <Button size="sm" variant="outline" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                      Find a Doctor
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Medicine Reminders */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Medication Reminders
              </h3>
              <Link href="/patient/reminders" className="text-xs text-teal-600 hover:underline font-semibold">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {reminders.length > 0 ? (
                reminders.slice(0, 4).map((reminder) => (
                  <div key={reminder._id || reminder.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${reminder.taken ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-500 ring-4 ring-amber-100'}`} />
                      <div>
                        <h4 className={`text-xs font-bold ${reminder.taken ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {reminder.medicineName || reminder.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{reminder.dosage || "1 dose"}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {reminder.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-xs font-semibold text-slate-500">No active medication alarms</p>
                  <Link href="/patient/reminders" className="inline-block mt-2">
                    <Button size="sm" variant="ghost" className="text-xs text-teal-600 hover:bg-teal-50">
                      + Add Prescription Alarm
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent System Notifications */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Recent Alerts
              </h3>
              <Link href="/patient/notifications" className="text-xs text-slate-500 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {notifications && notifications.slice(0, 3).length > 0 ? (
                notifications.slice(0, 3).map((notif) => (
                  <div key={notif._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-900">{notif.title}</p>
                    <p className="text-slate-600 mt-0.5 line-clamp-1">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No recent alerts</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Vitals Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Record Clinical Patient Vitals"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Keep your clinical vitals up-to-date. Values will immediately reflect on your health dashboard and physician consultations.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={manualForm.heartRate}
                onChange={e => setManualForm({ ...manualForm, heartRate: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oxygen Level SpO2 (%)</label>
              <input
                type="number"
                placeholder="e.g. 98"
                min="0" max="100"
                value={manualForm.oxygenLevel}
                onChange={e => setManualForm({ ...manualForm, oxygenLevel: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                placeholder="e.g. 120"
                value={manualForm.systolicBP}
                onChange={e => setManualForm({ ...manualForm, systolicBP: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                placeholder="e.g. 80"
                value={manualForm.diastolicBP}
                onChange={e => setManualForm({ ...manualForm, diastolicBP: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 98.6"
                value={manualForm.temperature}
                onChange={e => setManualForm({ ...manualForm, temperature: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 70"
                value={manualForm.weight}
                onChange={e => setManualForm({ ...manualForm, weight: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Sugar (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 90"
              value={manualForm.bloodSugar}
              onChange={e => setManualForm({ ...manualForm, bloodSugar: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManualModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 rounded-xl shadow-md shadow-teal-600/20"
              disabled={isSubmittingManual}
            >
              {isSubmittingManual ? "Saving..." : "Save Vitals"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
