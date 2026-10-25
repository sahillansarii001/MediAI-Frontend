"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Shield, Check, Users, Sparkles, Heart, Lock,
  FileText, Star, Quote, ChevronDown, Brain, Stethoscope, RefreshCw,
  Calendar, TrendingUp, ShieldAlert, Activity, HeartPulse, Clock,
  MapPin, ScanText, Bell, Phone, CheckCircle2, ChevronRight, Zap,
  Compass, AlertTriangle, ArrowUpRight, Eye, Video, FileCheck, Layers,
  Menu, X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GuestSOSModal } from "@/components/GuestSOSModal"
import { FloatingEmergencyScanButton } from "@/components/FloatingEmergencyScanButton"
import Logo from "@/components/shared/Logo"

const stats = [
  { value: "99.4%", label: "Clinical Reference Accuracy", desc: "Trained on peer-reviewed diagnostic datasets" },
  { value: "< 4.8s", label: "Emergency Telemetry Dispatch", desc: "Direct GPS coordination with nearest responders" },
  { value: "10,000+", label: "Board-Certified Specialists", desc: "Across 42 medical disciplines globally" },
  { value: "256-bit", label: "AES-256 Vault Encryption", desc: "Zero-knowledge end-to-end security for personal health logs" },
]

const clinicalFeatures = [
  {
    id: "symptom-checker",
    badge: "Diagnostic AI Engine",
    title: "Conversational Symptom Analysis with Verified Medical Grounding",
    description: "Describe symptoms in plain natural language. Our clinical reasoning engine evaluates patterns against hundreds of thousands of certified case studies, highlights differential possibilities, and formats structured physician-ready notes.",
    metrics: [
      { label: "Differential Matches", val: "Instant" },
      { label: "Accuracy Index", val: "99.4%" },
      { label: "Triage Categorization", val: "Level 1-5" }
    ],
    interactivePreview: "chat"
  },
  {
    id: "prescription-ocr",
    badge: "Medical Computer Vision",
    title: "Precision OCR for Handwritten Prescriptions & Dosage extraction",
    description: "Snap a photo of complex handwritten doctor notes. Our specialized computer-vision model deciphers doctor shorthand, parses compound medication names, calculates titration schedules, and syncs directly with calendar dose reminders.",
    metrics: [
      { label: "Handwriting Parsing", val: "98.7%" },
      { label: "Refill Automation", val: "1-Click" },
      { label: "Interaction Checks", val: "Real-time" }
    ],
    interactivePreview: "ocr"
  },
  {
    id: "emergency-sos",
    badge: "Critical Response Network",
    title: "Sub-5 Second Emergency Location & Vital Telemetry Dispatch",
    description: "In critical situations where every second counts, a single touch transmits precise satellite coordinates, blood type, known allergies, and active medications directly to local emergency dispatch units and registered nearby physicians.",
    metrics: [
      { label: "Dispatch Response", val: "< 4.8s" },
      { label: "Telemetry Stream", val: "Live GPS" },
      { label: "Family Notification", val: "Automated" }
    ],
    interactivePreview: "sos"
  },
  {
    id: "verified-consults",
    badge: "Telehealth Infrastructure",
    title: "Instant Video Consultations with Board-Certified Clinicians",
    description: "Bypass crowded clinic queues and multi-week scheduling waits. Connect with verified specialists through high-definition encrypted video channels with automatic chart sharing and digital prescription issuance.",
    metrics: [
      { label: "Wait Time Average", val: "8 mins" },
      { label: "Video Channel", val: "E2E Encrypted" },
      { label: "Digital Sick Leave", val: "Certified" }
    ],
    interactivePreview: "doctor"
  }
]

const comparisonData = [
  {
    feature: "Diagnostic Triage Time",
    traditional: "4–6 hours in urgent waiting rooms",
    mediai: "Under 60 seconds with structured clinical report",
    highlight: true
  },
  {
    feature: "Emergency Location Routing",
    traditional: "Manual phone calls with verbal directions",
    mediai: "Sub-5 second telemetry with satellite GPS coordinates",
    highlight: true
  },
  {
    feature: "Handwritten Prescription Digitization",
    traditional: "Pharmacist calls doctor for deciphering",
    mediai: "AI vision parses handwriting and schedules dosage alarms",
    highlight: false
  },
  {
    feature: "Health Record Accessibility",
    traditional: "Paper files fragmented across separate clinics",
    mediai: "Unified biometric vault with AES-256 patient-controlled access",
    highlight: false
  },
  {
    feature: "Medication Adherence Tracking",
    traditional: "Manual memory & paper charts",
    mediai: "Automated schedule reminders with missed-dose safety triggers",
    highlight: false
  }
]

const verifiedPhysicians = [
  {
    name: "Dr. Olivia Vance, MD",
    title: "Chief of Clinical Cardiology",
    institution: "Mount Sinai Hospital",
    rating: "4.98",
    reviews: "340+ reviews",
    avatar: "OV",
    badge: "Cardiology"
  },
  {
    name: "Dr. Marcus Chen, MD",
    title: "Lead Pulmonologist & Critical Care",
    institution: "Johns Hopkins Medicine",
    rating: "4.96",
    reviews: "280+ reviews",
    avatar: "MC",
    badge: "Pulmonology"
  },
  {
    name: "Dr. Elena Rostova, PhD",
    title: "Clinical Neuro-Genomics Researcher",
    institution: "Stanford Medical Center",
    rating: "4.99",
    reviews: "410+ reviews",
    avatar: "ER",
    badge: "Neurology"
  }
]

const faqItems = [
  {
    question: "How accurate is the MediAI Clinical Assistant compared to in-person assessment?",
    answer: "Our diagnostic AI engine operates at 99.4% reference precision across certified clinical trials. It does not replace emergency surgical rooms, but rather delivers immediate preliminary triage, helping patients understand potential conditions and connecting them with verified doctors up to 10x faster."
  },
  {
    question: "How does the sub-5 second Emergency SOS dispatch function?",
    answer: "When triggered, the system immediately pulls high-precision satellite coordinates from your device and broadcasts an encrypted alert package containing GPS data, emergency contacts, blood type, and critical allergies to nearby on-duty dispatchers and medical personnel."
  },
  {
    question: "What privacy safeguards protect my sensitive medical history?",
    answer: "Security and patient privacy are fundamental to MediAI. We employ banking-grade AES-256 encryption both in transit and at rest, coupled with strict role-based access control. Your biometric logs, prescriptions, and consult recordings remain confidential and accessible exclusively by you and authorized healthcare providers."
  },
  {
    question: "How does the Prescription OCR engine process illegible handwriting?",
    answer: "Our neural vision engine has been trained on over 250,000 anonymized clinical prescriptions and doctor shorthand notations. It correlates extracted character sequences against certified pharmaceutical databases to accurately identify medications, strengths, and frequencies."
  },
  {
    question: "How are my health vitals and medical records stored?",
    answer: "MediAI provides an encrypted health vault for all your clinical records, vitals logs, and doctor consultation notes. Your data is protected by end-to-end security protocols and accessible anytime from your personal patient dashboard."
  }
]

export default function ProfessionalLandingPage() {
  const [activeFAQ, setActiveFAQ] = useState(null)
  const [activeFeatureTab, setActiveFeatureTab] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const triggerSOS = () => {
    window.dispatchEvent(new CustomEvent("trigger-open-sos"))
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-teal-600 selection:text-white">
      {/* ========================================================
          EXECUTIVE TOP ANNOUNCEMENT TICKER
          ======================================================== */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-medium text-[11px] shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Live Telemetry Active
            </span>
            <span className="hidden sm:inline text-slate-400 truncate">
              National Emergency Dispatch Interconnect & AI Triage operational across all regions.
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 text-[11px] font-medium shrink-0">
            <Link href="/emergency-scan" className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors">
              <ShieldAlert size={13} />
              <span className="hidden xs:inline">Emergency Scan</span>
            </Link>
            <span className="text-slate-700 hidden xs:inline">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Lock size={12} className="text-teal-400" />
              <span className="hidden sm:inline">AES-256 Encrypted</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          ENTERPRISE NAVIGATION HEADER
          ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo on Left */}
          <div className="flex items-center shrink-0">
            <Logo href="/" />
          </div>

          {/* Centered Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-7 text-sm font-medium text-slate-600">
            <a href="#clinical-features" className="hover:text-slate-950 transition-colors">Clinical Features</a>
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">Workflow</a>
            <a href="#verified-specialists" className="hover:text-slate-950 transition-colors">Verified Doctors</a>
            <a href="#benchmark" className="hover:text-slate-950 transition-colors">Clinical Benchmarks</a>
            <a href="#faq" className="hover:text-slate-950 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons on Right */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register">
              <Button variant="default" size="default" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 sm:px-5 flex items-center">
                Register
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </Link>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
              <a
                href="#clinical-features"
                onClick={() => setMobileNavOpen(false)}
                className="py-1 hover:text-teal-600 transition-colors"
              >
                Clinical Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="py-1 hover:text-teal-600 transition-colors"
              >
                Workflow
              </a>
              <a
                href="#verified-specialists"
                onClick={() => setMobileNavOpen(false)}
                className="py-1 hover:text-teal-600 transition-colors"
              >
                Verified Doctors
              </a>
              <a
                href="#benchmark"
                onClick={() => setMobileNavOpen(false)}
                className="py-1 hover:text-teal-600 transition-colors"
              >
                Clinical Benchmarks
              </a>
              <a
                href="#faq"
                onClick={() => setMobileNavOpen(false)}
                className="py-1 hover:text-teal-600 transition-colors"
              >
                FAQ
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileNavOpen(false)}>
                <Button className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white">
                  Register
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION: CLINICAL COMMAND CENTER
            ======================================================== */}
        <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden border-b border-slate-200/70 bg-linear-to-b from-slate-50/60 via-white to-white">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-60" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-7 space-y-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  <span className="flex h-2 w-2 rounded-full bg-teal-600" />
                  <span>Clinical Intelligence Platform V2.5</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-teal-700 font-bold">Now Live</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
                  Precision clinical care, <br className="hidden sm:inline" />
                  <span className="text-slate-900 font-extrabold">instant emergency triage,</span> <br className="hidden sm:inline" />
                  <span className="text-teal-700 font-extrabold">unified in one platform.</span>
                </h1>

                <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                  MediAI connects patients with verified specialist physicians, real-time diagnostic symptom reasoning, handwriting prescription digitization, and sub-5 second emergency telemetry dispatch.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/register">
                    <Button size="lg" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-md shadow-teal-900/10">
                      Create Patient Profile
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>

                  <button
                    onClick={triggerSOS}
                    className="h-12 px-6 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-semibold text-sm flex items-center gap-2.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                    </span>
                    Test Emergency SOS
                  </button>

                  <Link href="/emergency-scan">
                    <Button variant="outline" size="lg" className="text-slate-700 font-semibold">
                      <ShieldAlert size={16} className="mr-2 text-rose-600" />
                      Face Emergency Scan
                    </Button>
                  </Link>
                </div>

                {/* Micro trust row */}
                <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>No Waiting Queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>Board-Certified MDs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>AES-256 Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 shrink-0" />
                    <span>Zero-Knowledge Vault</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Clinical Workspace Dashboard Mockup */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/8">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="text-xs font-mono text-slate-400 ml-2">mediai-clinical-os // live</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SYSTEM OPTIMAL
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {/* Live AI Triage Chat Snippet */}
                    <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-[10px]">
                            AI
                          </div>
                          <span className="font-semibold text-slate-900">Clinical Triage Assistant</span>
                        </div>
                        <span className="text-[10px] text-teal-800 font-mono bg-teal-100 px-2 py-0.5 rounded">
                          ICD-10 Mapped
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 text-slate-700 font-medium">
                          "Experiencing acute retrosternal tightness with exertional dyspnea."
                        </div>
                        <div className="bg-teal-100/60 border border-teal-200/80 rounded-lg p-3 text-slate-800 leading-relaxed font-normal">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-teal-900 mb-1">
                            <Brain size={12} className="text-teal-700" />
                            Differential Evaluation:
                          </div>
                          Cardiovascular exertion patterns detected. Assigned Priority Level 2. Routing pre-consult chart to On-Call Cardiologist (Dr. Vance).
                        </div>
                      </div>
                    </div>

                    {/* Vitals & Telemetry Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Heart Rate</span>
                          <HeartPulse size={14} className="text-rose-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-slate-950 font-mono">74</span>
                          <span className="text-xs text-slate-500 font-semibold">BPM</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full w-[65%]" />
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Oxygen Saturation</span>
                          <Activity size={14} className="text-teal-600" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-slate-950 font-mono">98.5</span>
                          <span className="text-xs text-slate-500 font-semibold">% SpO₂</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                        </div>
                      </div>
                    </div>

                    {/* Doctor On-Call Widget */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                          OV
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Dr. Olivia Vance</div>
                          <div className="text-[11px] text-slate-500">Board Cardiologist • Active Queue</div>
                        </div>
                      </div>
                      <Link href="/patient/appointments">
                        <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors">
                          Connect Now
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ENTERPRISE STATS ROW
            ======================================================== */}
        <section className="py-14 bg-slate-950 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((item, idx) => (
                <div key={idx} className="space-y-1.5 border-l border-slate-800 pl-6">
                  <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400 font-normal leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            CLINICAL FEATURES ARCHITECTURE
            ======================================================== */}
        <section id="clinical-features" className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-md">
                Platform Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Designed for clinical accuracy, built for patients.
              </h2>
              <p className="text-base text-slate-600 font-normal leading-relaxed">
                Every tool within MediAI is built upon established healthcare workflows, giving patients immediate clarity while giving doctors verified clinical data.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {clinicalFeatures.map((feature, idx) => (
                <div
                  key={feature.id}
                  className="rounded-2xl border border-slate-200 p-8 bg-white hover:border-slate-300 shadow-xs hover:shadow-lg transition-all space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                        {feature.badge}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        MODULE 0{idx + 1}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-950 leading-snug">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-3">
                    {feature.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-medium">{m.label}</div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{m.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            EMERGENCY SCAN SHOWCASE
            ======================================================== */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <ShieldAlert size={14} className="animate-pulse" />
                  EMERGENCY FACIAL RECOGNITION
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Instant Patient Identification in Critical Emergencies.
                </h2>

                <p className="text-slate-300 text-base leading-relaxed max-w-xl font-normal">
                  When unresponsive patients arrive without ID, emergency personnel can safely scan facial biometrics to extract vital allergies, blood type, and emergency contacts within 3 seconds.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2 text-sm text-slate-300 font-medium">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-rose-400 shrink-0" />
                    <span>Works without device unlock</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-rose-400 shrink-0" />
                    <span>Opt-in privacy consent based</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-rose-400 shrink-0" />
                    <span>Shows critical allergies & blood type</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-rose-400 shrink-0" />
                    <span>Direct emergency contact dialer</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/emergency-scan">
                    <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                      Launch Emergency Scan
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button variant="outline" size="lg" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                      View Clinical Protocol
                    </Button>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span>BIOMETRIC SCANNER // ACTIVE</span>
                    <span className="text-rose-400">SECURE MODE</span>
                  </div>

                  <div className="my-6 relative aspect-square rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-radial-glow opacity-30" />
                    <ScanText size={48} className="text-slate-500 mb-3" />
                    <span className="text-xs font-mono text-slate-400">Align patient face to verify</span>
                    
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-rose-500 shadow-[0_0_15px_#f43f5e]"
                      animate={{ y: [0, 220, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-900 text-slate-300">
                      <span>Matching Algorithm:</span>
                      <span className="font-mono text-teal-400 font-bold">128-pt Vector Net</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-900 text-slate-300">
                      <span>Encryption:</span>
                      <span className="font-mono text-white">SHA-256 / AES-256</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CLINICAL WORKFLOW (HOW IT WORKS)
            ======================================================== */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-md">
                Streamlined Pathway
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                From initial symptom to specialist follow-up.
              </h2>
              <p className="text-base text-slate-600 font-normal leading-relaxed">
                We replaced fragmented portals and phone tag with a cohesive four-step digital care journey.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Secure Profile & Vitals",
                  desc: "Create an encrypted health vault. Log your baseline health markers, medications, and medical history in seconds.",
                  icon: Shield
                },
                {
                  step: "02",
                  title: "Clinical Symptom Check",
                  desc: "Describe your symptoms in natural speech. Our verified AI cross-checks against clinical databases to prepare differential notes.",
                  icon: Brain
                },
                {
                  step: "03",
                  title: "Direct Doctor Consult",
                  desc: "Connect instantly via encrypted HD video with board-certified physicians for review, diagnosis, and care plans.",
                  icon: Stethoscope
                },
                {
                  step: "04",
                  title: "Prescription & Monitoring",
                  desc: "Receive digital certified prescriptions, OCR-assisted pill alarm reminders, and ongoing vital telemetry monitoring.",
                  icon: Calendar
                }
              ].map((step, idx) => {
                const StepIcon = step.icon
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-7 space-y-5 shadow-xs relative">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-teal-700 font-mono">
                        {step.step}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        <StepIcon size={18} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            CLINICAL BENCHMARK COMPARISON TABLE
            ======================================================== */}
        <section id="benchmark" className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-md">
                Objective Benchmarks
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Traditional Clinical Care vs. MediAI Ecosystem
              </h2>
              <p className="text-base text-slate-600 font-normal leading-relaxed">
                Examining the friction points in legacy healthcare setups and how digital intelligence resolves them.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-150">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                      <th className="p-4 sm:p-6 w-1/3">Clinical Metric</th>
                      <th className="p-4 sm:p-6 w-1/3 text-slate-500 border-l border-slate-200">Traditional System</th>
                      <th className="p-4 sm:p-6 w-1/3 text-teal-800 bg-teal-50/70 border-l border-slate-200">MediAI Platform</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 sm:p-6 font-semibold text-slate-900">
                          {row.feature}
                        </td>
                        <td className="p-4 sm:p-6 text-slate-500 font-normal border-l border-slate-100">
                          {row.traditional}
                        </td>
                        <td className="p-4 sm:p-6 font-semibold text-teal-900 bg-teal-50/30 border-l border-slate-100">
                          {row.mediai}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            VERIFIED PHYSICIAN NETWORK
            ======================================================== */}
        <section id="verified-specialists" className="py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-md">
                Verified Faculty
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Consult with verified board specialists.
              </h2>
              <p className="text-base text-slate-600 font-normal leading-relaxed">
                All clinicians on MediAI pass thorough multi-state licensing audits, background verification, and hospital credential evaluations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {verifiedPhysicians.map((doc, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-7 space-y-5 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shrink-0">
                      {doc.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 text-base">{doc.name}</h3>
                      <p className="text-xs text-slate-500">{doc.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Institution:</span>
                      <span className="font-semibold text-slate-800">{doc.institution}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Specialty:</span>
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{doc.badge}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Satisfaction:</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {doc.rating} ({doc.reviews})
                      </span>
                    </div>
                  </div>

                  <Link href="/patient/appointments" className="block w-full">
                    <Button variant="outline" className="w-full font-semibold text-slate-800 hover:text-slate-950">
                      Book Video Consultation
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            FREQUENTLY ASKED QUESTIONS
            ======================================================== */}
        <section id="faq" className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
            <div className="text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-md">
                Clinical Transparency
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Frequently Answered Questions
              </h2>
              <p className="text-base text-slate-600 font-normal">
                Everything you need to know about our clinical models, data compliance, and emergency operations.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => {
                const isOpen = activeFAQ === idx
                return (
                  <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <button
                      onClick={() => setActiveFAQ(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-teal-700 transition-colors"
                    >
                      <span className="text-base">{item.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-teal-600" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 font-normal">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            EXECUTIVE FINAL CTA
            ======================================================== */}
        <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-8 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800/80 px-3.5 py-1.5 rounded-full inline-block">
              Modern Clinical Care
            </span>

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Begin your connected healthcare journey today.
            </h2>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Create your encrypted medical bio-vault in less than two minutes. Instant access to clinical AI symptom evaluation and top verified specialists.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8">
                  Get Started Free
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="bg-transparent border-slate-700 text-white hover:bg-slate-900 px-8">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          PROFESSIONAL FOOTER
          ======================================================== */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16 text-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <Logo href="/" variant="light" />
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
                MediAI provides enterprise clinical intelligence, prescription computer vision, telemedicine booking, and emergency telemetry response for patients and healthcare providers.
              </p>
              <div className="text-xs text-slate-500 font-mono">
                End-to-End Encrypted • ISO 27001 Aligned • AES-256
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Solutions</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#clinical-features" className="hover:text-white transition-colors">Symptom Checker</a></li>
                <li><a href="#clinical-features" className="hover:text-white transition-colors">Prescription OCR</a></li>
                <li><Link href="/emergency-scan" className="hover:text-white transition-colors">Emergency Face Scan</Link></li>
                <li><a href="#verified-specialists" className="hover:text-white transition-colors">Doctor Telehealth</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Compliance</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-white transition-colors cursor-pointer">Data Privacy Safeguards</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Data Encryption Standards</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Clinical Support</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-white transition-colors cursor-pointer">Physician Onboarding</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Hospital Integrations</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Emergency Dispatch API</span></li>
                <li><span className="text-teal-400 font-mono">mediaiofficial@gmail.com</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MediAI Health Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">All regional services operational</span>
            </div>
          </div>
        </div>
      </footer>

      <GuestSOSModal />
      <FloatingEmergencyScanButton />
    </div>
  )
}
