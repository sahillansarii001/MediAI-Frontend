"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { HeartPulse, Activity, Weight, Calendar, Clock, AlertTriangle, ChevronRight, Bell, XCircle, CalendarCheck, FileText, Plus } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reminders, setReminders] = useState([])
  const [reports, setReports] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Weekly health activity chart
  const [weeklyActivity, setWeeklyActivity] = useState([])

  // Vitals State
  const [latestVitals, setLatestVitals] = useState(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

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
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)

  const fetchDashboardData = async () => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = sessionStorage.getItem('user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser.user || parsedUser)
        }
      }

      const [apptsRes, remsRes, repsRes, notifsRes, vitalsRes, activityRes, meRes] = await Promise.allSettled([
        api.get('/appointments/patient'),
        api.get('/medicines/patient'),
        api.get('/reports/patient'),
        api.get('/notifications'),
        api.get('/patient/vitals/latest'),
        api.get('/patient/activity/weekly'),
        api.get('/auth/me')
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
      console.error("Failed to fetch dashboard data", error)
      toast.error(typeof error === 'string' ? error : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const handleCancelledEvent = () => {
      console.log("[PatientDashboard] Received appointmentCancelled custom event. Hot-reloading...");
      fetchDashboardData()
    }
    window.addEventListener("appointmentCancelled", handleCancelledEvent)

    const interval = setInterval(fetchDashboardData, 30000) // Poll every 30s
    return () => {
      clearInterval(interval)
      window.removeEventListener("appointmentCancelled", handleCancelledEvent)
    }
  }, [])

  // Manual Vitals Entry Handler
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
        toast.success("Vitals recorded successfully!")
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading your health dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.fullName || user?.firstName || "Patient"}! Here's your health overview.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/patient/symptom-checker">
            <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
              <Activity className="h-4 w-4" /> Start AI Checkup
            </Button>
          </Link>
        </div>
      </div>

      {/* Emergency Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-900">Emergency SOS</p>
              <p className="text-sm text-red-700">Quickly find nearby doctors and alert emergency contacts.</p>
            </div>
          </div>
          <Link href="/patient/emergency">
            <Button variant="danger" size="sm">Access SOS</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Health Vitals Banner */}
      <Card className="border-teal-100 bg-linear-to-r from-teal-50/60 to-emerald-50/40 border shadow-sm">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100/80 text-teal-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Patient Health Vitals</h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Keep your health markers updated for physician consults and AI triage.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs py-2 h-9 font-bold shadow-sm"
              onClick={() => setIsManualModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Log New Vitals
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Overview Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="block">
          <StatCard
            title="Heart Rate"
            value={latestVitals?.heartRate ? `${latestVitals.heartRate} bpm` : "Not recorded yet"}
            icon={HeartPulse}
            trend={latestVitals?.heartRate ? (latestVitals.heartRate > 100 ? "up" : latestVitals.heartRate < 60 ? "down" : "stable") : "stable"}
            trendValue={latestVitals?.heartRate ? "--" : undefined}
            description={latestVitals ? "Resting heart rate" : "Average resting heart rate"}
            className={!latestVitals ? "border-slate-100 bg-slate-50/50" : ""}
          />
        </div>
        <div className="block">
          <StatCard
            title="Blood Pressure"
            value={(latestVitals?.systolicBP && latestVitals?.diastolicBP) ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP} mmHg` : "Not recorded yet"}
            icon={Activity}
            description={latestVitals?.recordedAt ? `Last checked: ${new Date(latestVitals.recordedAt).toLocaleDateString()}` : "Last checked: Recently"}
            className={!latestVitals ? "border-slate-100 bg-slate-50/50" : ""}
          />
        </div>
        <div className="block">
          <StatCard
            title="Weight"
            value={latestVitals?.weight ? `${latestVitals.weight} kg` : "Not recorded yet"}
            icon={Weight}
            trend="stable"
            trendValue={latestVitals?.weight ? "--" : undefined}
            description={latestVitals ? "Recorded patient weight" : "From last vitals submission"}
            className={!latestVitals ? "border-slate-100 bg-slate-50/50" : ""}
          />
        </div>
        <Link href="/patient/appointments" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Appointments"
            value={upcomingAppointments.length}
            icon={Calendar}
            description={
              upcomingAppointments.length > 0
                ? `Next: ${new Date(upcomingAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : "No upcoming visits"
            }
          />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Content Area */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Activity Graph */}
          <Card className="h-75">
            <CardHeader>
              <CardTitle>Health Activity</CardTitle>
              <CardDescription>Your health engagement over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-4">
              {weeklyActivity.length === 0 || weeklyActivity.every(d => d.activity === 0) ? (
                <div className="flex flex-col items-center justify-center h-45 text-center">
                  <Activity className="h-8 w-8 text-slate-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No activity recorded this week.</p>
                  <p className="text-xs text-slate-300 mt-1">Start a checkup, book an appointment, or log vitals to see your progress.</p>
                </div>
              ) : (() => {
                const maxAct = Math.max(...weeklyActivity.map(d => d.activity), 1);
                return (
                  <div className="flex items-end gap-2 h-45 mt-2">
                    {weeklyActivity.map((d, i) => {
                      const pct = Math.round((d.activity / maxAct) * 100);
                      const heightPct = Math.max(pct, d.activity > 0 ? 8 : 0);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
                          <span className="text-[9px] font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.activity}
                          </span>
                          <div
                            className="w-full rounded-t-lg transition-all duration-500 cursor-pointer relative"
                            style={{
                              height: d.activity > 0 ? `${heightPct}%` : '4px',
                              background: d.activity > 0
                                ? `linear-gradient(to top, #0d9488, #5eead4)`
                                : '#e2e8f0',
                              minHeight: '4px'
                            }}
                          />
                          <span className="text-[10px] font-semibold text-slate-400">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Latest medical test results and AI drafts.</CardDescription>
              </div>
              <Link href="/patient/reports">
                <Button variant="ghost" size="sm" className="gap-1 text-teal-600">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.length > 0 ? (
                  reports.slice(0, 3).map((report) => (
                    <div key={report._id || report.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md border border-slate-200">
                          <FileText className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{report.title || report.testName || "Medical Report"}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(report.createdAt || report.date).toLocaleDateString()} • {report.doctor?.fullName || "MediAI System"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={(report.status === 'Approved' || report.status === 'approved' || report.status === 'final') ? 'success' : 'warning'}>
                        {report.status || "Pending"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-slate-500">No medical reports found</p>
                    <Link href="/patient/reports">
                      <Button variant="link" className="text-teal-600 text-xs mt-1">Upload your first report</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Updates from your doctors and MediAI.</CardDescription>
              </div>
              <Link href="/patient/notifications">
                <Button variant="ghost" size="sm" className="gap-1 text-teal-600">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications && notifications.slice(0, 3).length > 0 ? (
                  notifications.slice(0, 3).map((notif) => (
                    <Link
                      key={notif._id}
                      href={notif.type?.includes('appointment') ? '/patient/appointments' : '/patient/notifications'}
                      className={`block p-4 rounded-lg border transition-all hover:shadow-md ${notif.isRead ? 'bg-slate-50 border-slate-100' : 'bg-teal-50/50 border-teal-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${notif.type === 'appointment_cancel' ? 'bg-red-100 text-red-600' :
                            notif.type === 'appointment_update' ? 'bg-amber-100 text-amber-600' :
                              'bg-teal-100 text-teal-600'
                          }`}>
                          {notif.type === 'appointment_cancel' ? <XCircle className="h-4 w-4" /> :
                            notif.type === 'appointment_update' ? <CalendarCheck className="h-4 w-4" /> :
                              <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <p className="text-sm text-slate-500">No new notifications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Medicine Reminders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Medicine Reminders</CardTitle>
              <Bell className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders.length > 0 ? (
                  reminders.slice(0, 5).map((reminder) => (
                    <div key={reminder._id || reminder.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${reminder.taken ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <div>
                          <p className={`text-sm font-medium ${reminder.taken ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {reminder.medicineName || reminder.name}
                          </p>
                          <p className="text-xs text-slate-500">{reminder.dosage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{reminder.time}</p>
                        {!reminder.taken && (
                          <button className="text-xs text-teal-600 hover:underline mt-0.5">Mark Taken</button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">No reminders set</p>
                    <Link href="/patient/reminders">
                      <Button variant="link" className="text-teal-600 text-xs mt-1">Add medication</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 2).map((apt) => (
                    <div key={apt._id || apt.id} className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-teal-900">{apt.doctor?.fullName || "Doctor"}</p>
                          <p className="text-sm text-teal-700">{apt.doctor?.specialization || "General"}</p>
                        </div>
                        <Badge variant="teal">{apt.consultationType || "Visit"}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-teal-800 mt-4 bg-white/60 p-2 rounded-md">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> {new Date(apt.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {apt.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming appointments</p>
                )}

                <Link href="/patient/doctor-recommendation" className="block w-full">
                  <Button variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50">Find a Doctor</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MANUAL VITALS ENTRY MODAL */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Enter Patient Vitals Manually"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">Record your current clinical vitals. Leave blank if not available.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={manualForm.heartRate}
                onChange={e => setManualForm({ ...manualForm, heartRate: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oxygen Level (%)</label>
              <input
                type="number"
                placeholder="e.g. 98"
                min="0" max="100"
                value={manualForm.oxygenLevel}
                onChange={e => setManualForm({ ...manualForm, oxygenLevel: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
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
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                placeholder="e.g. 80"
                value={manualForm.diastolicBP}
                onChange={e => setManualForm({ ...manualForm, diastolicBP: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
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
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
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
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
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
              className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsManualModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6"
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
