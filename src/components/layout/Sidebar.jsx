"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Logo from "@/components/shared/Logo"
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Stethoscope,
  Calendar,
  MessageSquare,
  FileText,
  ScanLine,
  Bell,
  FolderHeart,
  Settings,
  AlertTriangle,
  Users,
  Brain,
  CheckSquare,
  Clock,
  DollarSign,
  ShieldCheck,
  FileSpreadsheet,
  Megaphone,
  LifeBuoy,
  FileClock,
  Truck,
  BriefcaseMedical
} from "lucide-react"


export function Sidebar({ role }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = {
    patient: [
      { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
      { name: "AI Symptom Checker", href: "/patient/symptom-checker", icon: Activity },
      { name: "Doctor Recommendation", href: "/patient/doctor-recommendation", icon: Stethoscope },
      { name: "Appointments", href: "/patient/appointments", icon: Calendar },
      { name: "Notifications", href: "/patient/notifications", icon: Bell },
      { name: "Doctor Chat", href: "/patient/chat", icon: MessageSquare },
      { name: "Health Reports", href: "/patient/reports", icon: FileText },
      { name: "Prescription OCR", href: "/patient/prescription-ocr", icon: ScanLine },
      { name: "Medicine Reminders", href: "/patient/reminders", icon: Clock },
      { name: "Pharmacy Delivery", href: "/patient/pharmacy", icon: Truck },
      { name: "Health Records", href: "/patient/records", icon: FolderHeart },
      { name: "Profile & Settings", href: "/patient/profile", icon: Settings },
      { name: "Support Tickets", href: "/patient/support-tickets", icon: LifeBuoy },
      { name: "Emergency SOS", href: "/patient/emergency", icon: AlertTriangle, variant: "destructive" },
    ],
    doctor: [
      { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
      { name: "Patient Queue", href: "/doctor/patient-queue", icon: Users },
      { name: "Emergency Scanner", href: "/doctor/emergency-scan", icon: ScanLine, variant: "destructive" },
      { name: "Chat with Patients", href: "/doctor/chat", icon: MessageSquare },
      { name: "Report Verification", href: "/doctor/report-verification", icon: CheckSquare },
      { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
      { name: "Schedule", href: "/doctor/schedule", icon: Clock },
      { name: "Patients", href: "/doctor/patients", icon: FolderHeart },
      { name: "Reports", href: "/doctor/reports", icon: FileText },
      { name: "Earnings", href: "/doctor/earnings", icon: DollarSign },
      { name: "Notifications", href: "/doctor/notifications", icon: Bell },
      { name: "Settings", href: "/doctor/settings", icon: Settings },
      { name: "Support Tickets", href: "/doctor/support-tickets", icon: LifeBuoy },
    ],
    admin: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
      { name: "Doctor Verification", href: "/admin/doctor-verification", icon: ShieldCheck },
      { name: "Appointments", href: "/admin/appointments", icon: Calendar },
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Pharmacy Orders", href: "/admin/pharmacy", icon: Truck },
      { name: "Medicine Stock", href: "/admin/medicine-stock", icon: BriefcaseMedical },
      { name: "Emergency Monitoring", href: "/admin/emergency-monitoring", icon: AlertTriangle, variant: "destructive" },
      { name: "Transactions", href: "/admin/transactions", icon: FileSpreadsheet },
      { name: "Support Tickets", href: "/admin/support-tickets", icon: LifeBuoy },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
      { name: "Audit Logs", href: "/admin/audit-logs", icon: FileClock },
      { name: "Ambulances", href: "/admin/ambulances", icon: Truck },
    ],
    super_admin: [
      { name: "Platform Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
      { name: "Platform Users", href: "/admin/users", icon: Users },
      { name: "Manage Hospitals", href: "/super-admin/admins", icon: ShieldCheck },
      { name: "Emergency Hub", href: "/super-admin/emergency-control", icon: AlertTriangle, variant: "destructive" },
      { name: "Ambulance Fleet", href: "/super-admin/ambulances", icon: Truck },
      { name: "Platform Analytics", href: "/super-admin/analytics", icon: Activity },
      { name: "Global Settings", href: "/super-admin/settings", icon: Settings },
    ]
  }

  const currentLinks = links[role] || []

  const toggleCollapse = () => setCollapsed(!collapsed)
  const toggleMobile = () => setMobileOpen(!mobileOpen)

  const sidebarClass = cn(
    "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 ease-in-out sm:relative",
    collapsed ? "w-20" : "w-64",
    mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
  )

  return (
    <>
      {/* Mobile Toggle Button - Visible only on small screens when sidebar is hidden */}
      <button
        className="fixed top-3 left-4 z-50 sm:hidden bg-white p-2 rounded-md shadow-sm border border-slate-200"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs sm:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClass}>
        <div className={cn(
          "flex h-16 items-center border-b border-slate-100 relative bg-white",
          collapsed ? "justify-center px-0" : "justify-between px-4"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center mx-auto overflow-visible" : "overflow-hidden"
          )}>
            <Logo
              href={null}
              variant="dark"
              iconOnly={collapsed}
              imageClassName="h-8 w-auto"
            />
          </div>
          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-cyan-600 transition-colors",
              collapsed ? "absolute right-1 top-1/2 -translate-y-1/2 scale-75" : ""
            )}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <nav className="space-y-1 px-3">
            {currentLinks.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const isDestructive = item.variant === "destructive"

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all group",
                    isActive
                      ? isDestructive 
                        ? "bg-red-50 text-red-600 font-bold shadow-xs" 
                        : "bg-cyan-50/80 text-cyan-700 font-bold shadow-xs border border-cyan-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive && isDestructive ? "text-red-600" :
                      isActive ? "text-cyan-600" :
                        "text-slate-400 group-hover:text-cyan-600"
                  )} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {!collapsed ? (
            <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-2xs">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Logged in as</p>
              <p className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                {role}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700 uppercase">
                {role.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
