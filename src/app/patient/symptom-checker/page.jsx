"use client";

import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/shared/ChatWindow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, Plus, AlertCircle, Stethoscope, Calendar, MessageSquare, 
  History, Trash2, Sparkles, ShieldAlert, CheckCircle2, ChevronRight, 
  Pill, Clock, Star, PhoneCall, AlertTriangle, ArrowRight, UserCheck,
  FileText, Zap, HelpCircle, Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import api from "@/lib/api";
import { Modal } from "@/components/ui/modal";

export default function SymptomChecker() {
  const initialMessages = [
    {
      sender: "ai",
      content: "Hello! I am your MediAI Clinical Triage Assistant. Please describe what you are experiencing, including how long you've felt this way and how severe it is. I will evaluate your symptoms against medical protocols and provide an instant risk assessment.",
      options: [
        "Severe throbbing headache with nausea",
        "Persistent chest tightness and shortness of breath",
        "High fever with dry cough and body chills",
        "Sharp abdominal pain after eating"
      ]
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState("");
  const [showChoiceButtons, setShowChoiceButtons] = useState(false);
  const [showDoctorCards, setShowDoctorCards] = useState(false);
  const [continueMode, setContinueMode] = useState(false);
  const [isFindingDoctors, setIsFindingDoctors] = useState(false);
  const [fetchedDoctors, setFetchedDoctors] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadKey, setUploadKey] = useState(0);

  // Chat History States
  const [sessionId, setSessionId] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    setSessionId(Date.now().toString());
    const savedHistory = localStorage.getItem("ai_symptom_sessions");
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 && sessionId) {
      setChatHistory(prev => {
        const existingSessionIndex = prev.findIndex(s => s.id === sessionId);
        const firstUserMessage = messages.find(m => m.sender === 'user')?.content || "Symptom check";
        const title = firstUserMessage.length > 40 ? firstUserMessage.substring(0, 40) + "..." : firstUserMessage;

        const updatedSession = {
          id: sessionId,
          title,
          date: new Date().toISOString(),
          messages,
          analysisData,
          showAnalysis,
          continueMode,
          showChoiceButtons
        };

        let newHistory;
        if (existingSessionIndex >= 0) {
          newHistory = [...prev];
          newHistory[existingSessionIndex] = updatedSession;
        } else {
          newHistory = [updatedSession, ...prev];
        }

        localStorage.setItem("ai_symptom_sessions", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [messages, analysisData, showAnalysis, continueMode, showChoiceButtons, sessionId]);

  const loadSession = (session) => {
    setMessages(session.messages);
    setAnalysisData(session.analysisData);
    setShowAnalysis(session.showAnalysis);
    setContinueMode(session.continueMode);
    setShowChoiceButtons(session.showChoiceButtons);
    setSessionId(session.id);
    setIsHistoryOpen(false);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    setChatHistory(prev => {
      const newHistory = prev.filter(s => s.id !== id);
      localStorage.setItem("ai_symptom_sessions", JSON.stringify(newHistory));
      return newHistory;
    });
    if (sessionId === id) {
      startNewChat();
    }
  };

  const handleConsultDoctor = async (buttonText = "I'd like to consult a doctor", forcedSpecialization = null) => {
    setShowChoiceButtons(false);
    setMessages(prev => [...prev, { sender: "user", content: buttonText }]);
    setIsFindingDoctors(true);
    try {
      const spec = forcedSpecialization || analysisData?.recommendedSpecialization || 'General Physician';
      const res = await api.get(`/doctors?specialization=${spec}`);
      if (res.data.success) {
        setFetchedDoctors(res.data.data);
        setShowDoctorCards(true);
        setMessages(prev => [...prev, { 
          sender: "ai", 
          content: `Matching complete. Found ${res.data.data.length} credentialed ${spec} specialist(s) on-call. Review their clinical qualifications in the diagnostic panel to consult directly.` 
        }]);
      } else {
        throw new Error(res.data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setMessages(prev => [...prev, { sender: "ai", content: "Unable to retrieve on-duty physicians right now. Please try again or head to the Doctor Directory." }]);
    } finally {
      setIsFindingDoctors(false);
    }
  };

  const handleSendMessage = async (content, imageFile) => {
    setError("");
    const lowerContent = content.toLowerCase();
    const triggerWords = ["consult", "doctor", "appointment", "find a doctor", "book"];
    const hasTriggerWord = (lowerContent.includes("consult") && lowerContent.includes("doctor")) || 
                           lowerContent.includes("book appointment") || 
                           lowerContent.includes("find a doctor");
    if (hasTriggerWord && analysisData?.recommendedSpecialization) {
      handleConsultDoctor(content);
      return;
    }

    setIsTyping(true);
    let imageUrl = uploadedImageUrl;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      try {
        const uploadRes = await api.post(`/ai/upload-symptom-image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (uploadRes.data.success) {
          imageUrl = uploadRes.data.data.url;
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        console.error("Upload Error:", err);
        setError("Clinical image upload failed. Please try again.");
        setIsTyping(false);
        return;
      }
    }

    setUploadedImageUrl(null);
    setUploadKey(prev => prev + 1);

    const userMsg = imageUrl
      ? { sender: "user", content, imageUrl }
      : { sender: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const previousMessages = messages.map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

    try {
      const res = await api.post('/ai/symptom-check', {
        symptoms: content,
        previousMessages,
        mode: continueMode ? 'continue_ai' : 'assess',
        ...(imageUrl ? { imageUrl } : {})
      });

      if (res.data.success && res.data.data) {
        const aiResponse = res.data.data;
        if (continueMode) {
          if (aiResponse.urgentDoctorNeeded) {
            const urgentMsg = aiResponse.emergencyWarning
              ? `⚠️ ${aiResponse.emergencyWarning}`
              : "⚠️ Your symptoms indicate potentially acute condition progression. Seek urgent physician attention immediately.";
            setMessages(prev => [...prev, { sender: "ai", content: urgentMsg }]);
            if (aiResponse.recommendedSpecialization) {
              setAnalysisData(prev => ({ ...prev, recommendedSpecialization: aiResponse.recommendedSpecialization }));
              handleConsultDoctor("I need urgent medical care", aiResponse.recommendedSpecialization);
            }
          } else {
            setMessages(prev => [...prev, { sender: "ai", content: aiResponse.followUpQuestion || "I am analyzing your follow-up inquiry. Feel free to ask more details about your recovery, care guidelines, or triggers." }]);
          }
          return;
        }

        const isAssessmentComplete = (aiResponse.isAssessmentReady === true || (!aiResponse.followUpQuestion && aiResponse.possibleCondition)) && (aiResponse.possibleCondition && aiResponse.riskLevel);

        if (!isAssessmentComplete && aiResponse.followUpQuestion) {
          setMessages(prev => [...prev, { sender: "ai", content: aiResponse.followUpQuestion }]);
        } else if (isAssessmentComplete) {
          setAnalysisData(aiResponse);
          setShowAnalysis(true);
          const choiceMsg = aiResponse.riskLevel === 'High' || aiResponse.riskLevel === 'Critical'
            ? `Clinical assessment complete. Symptoms reflect a possible ${aiResponse.riskLevel} risk condition. The detailed diagnostic report is now available in your clinical review panel.\n\nWould you like to connect with a verified specialist now, or continue asking questions?`
            : `Initial clinical assessment complete. Review the diagnostic breakdown in your side panel.\n\nWould you like to connect with an on-duty specialist or continue with AI guidance?`;
          setMessages(prev => [...prev, { sender: "ai", content: choiceMsg }]);
          setShowChoiceButtons(true);
        } else {
          setMessages(prev => [...prev, { sender: "ai", content: aiResponse.followUpQuestion || "Could you specify the exact duration and if the symptoms are accompanied by fever, dizziness, or sharp pain?" }]);
        }
      } else {
        throw new Error("Invalid AI triage response");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessages(prev => [...prev, { sender: "ai", content: `Error during triage: ${errorMessage}. Please check your connection or retry.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleContinueAI = () => {
    setShowChoiceButtons(false);
    setContinueMode(true);
    setShowDoctorCards(false);
    const isHighRisk = analysisData?.riskLevel === 'High' || analysisData?.riskLevel === 'Critical';
    const continueMsg = isHighRisk
      ? "Understood. Continuing in guided AI advisory mode. Keep in mind: because your assessment indicated elevated risk, do not hesitate to contact emergency care or see a physician if symptoms worsen.\n\nWhat other questions or concerns can I answer for you?"
      : "Continuing with AI health advisory. You can ask for OTC home-care tips, warning signs to watch for, or advice on recovery routines.\n\nWhat would you like to explore next?";
    setMessages(prev => [...prev,
      { sender: "user", content: "Continue with AI guidance" },
      { sender: "ai", content: continueMsg }
    ]);
  };

  const startNewChat = () => {
    setMessages(initialMessages);
    setShowAnalysis(false);
    setAnalysisData(null);
    setError("");
    setShowChoiceButtons(false);
    setShowDoctorCards(false);
    setContinueMode(false);
    setIsFindingDoctors(false);
    setFetchedDoctors([]);
    setUploadedImageUrl(null);
    setUploadKey(prev => prev + 1);
    setSessionId(Date.now().toString());
  };

  const getRiskBadgeStyles = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-200 ring-1 ring-red-500/20';
      case 'moderate':
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-200 ring-1 ring-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 ring-1 ring-emerald-500/20';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Modern Clinical Header Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl border border-teal-800/40">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              AI Clinical Triage • Multi-Model Engine (Groq & Gemini)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Intelligent Symptom Checker
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Describe your symptoms naturally or upload lab/clinical images. Our medical triage system analyzes symptom markers, calculates risk scores, and routes you to on-duty specialists.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-xs h-10 px-4 rounded-xl transition-all"
            >
              <History className="h-4 w-4 mr-1.5 text-teal-400" /> Triage History
            </Button>
            <Button
              size="sm"
              onClick={startNewChat}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all"
            >
              <Plus className="h-4 w-4 mr-1.5" /> New Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[620px] lg:h-[calc(100vh-16rem)]">
        {/* Left Column: Interactive Chat Interface */}
        <div className={`flex flex-col h-140 lg:h-full transition-all duration-300 ${showAnalysis || showDoctorCards ? 'w-full lg:w-7/12 xl:w-7/12' : 'w-full'}`}>
          {error && (
            <div className="mb-3 p-3.5 bg-red-50 text-red-800 text-xs rounded-2xl border border-red-200 flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex-1 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <ChatWindow
              title="Medical Symptom Dialogue"
              subtitle="Confidential, end-to-end clinical AI consultation"
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              disabled={showChoiceButtons || isTyping}
              placeholder="Describe your symptoms (e.g. sharp headache for 2 days, mild dizziness)..."
            />
          </div>

          {/* Action Choice Strip */}
          {showChoiceButtons && (
            <div className="mt-4 p-4 rounded-2xl bg-white border border-teal-200/80 shadow-md shadow-teal-500/5 flex flex-wrap gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <Button
                className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl gap-2 shadow-md shadow-teal-600/20 min-w-36 transition-all"
                onClick={() => handleConsultDoctor("Find Verified Doctors")}
              >
                <Stethoscope className="h-4 w-4" /> Find Doctors
              </Button>
              <Button
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl gap-2 shadow-md shadow-indigo-600/20 min-w-36 transition-all"
                onClick={() => handleConsultDoctor("Book Clinical Appointment")}
              >
                <Calendar className="h-4 w-4" /> Book Appointment
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl gap-2 min-w-36 transition-all"
                onClick={handleContinueAI}
              >
                <MessageSquare className="h-4 w-4 text-teal-600" /> Continue with AI
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Intelligence & Specialist Roster Panel */}
        {(showAnalysis || showDoctorCards) && (
          <div className="w-full lg:w-5/12 xl:w-5/12 h-full overflow-y-auto space-y-4 animate-in slide-in-from-right fade-in pb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* View 1: Clinical Assessment Report */}
            {showAnalysis && analysisData && !showDoctorCards && (
              <div className="space-y-4">
                {/* Risk Level Banner */}
                <div className={`p-5 rounded-3xl border shadow-sm transition-all ${
                  analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical'
                    ? 'bg-red-50/80 border-red-200 text-red-950'
                    : analysisData.riskLevel === 'Moderate' || analysisData.riskLevel === 'Medium'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-2xl shrink-0 ${
                      analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : analysisData.riskLevel === 'Moderate' || analysisData.riskLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider">Clinical Triage Score</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${getRiskBadgeStyles(analysisData.riskLevel)}`}>
                          {analysisData.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90 pt-1">
                        Preliminary automated triage. Not a substitute for formal clinical laboratory analysis.
                      </p>
                      {analysisData.emergencyWarning && (
                        <div className="mt-3 p-3 bg-red-100/90 border border-red-300 rounded-xl text-red-900 text-xs font-bold flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 shrink-0 text-red-700" />
                          <span>{analysisData.emergencyWarning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Diagnostic Findings Card */}
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-teal-600" />
                      Diagnostic Breakdown
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400">ICD-10 Aligned</span>
                  </div>

                  {/* Possible Condition */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Identified Condition
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-semibold text-sm leading-relaxed">
                      {analysisData.possibleCondition || "Condition analysis in progress"}
                    </div>
                  </div>

                  {/* Recommended Specialist */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Recommended Specialist
                    </span>
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-teal-950">
                          {analysisData.recommendedSpecialization || "General Medicine"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleConsultDoctor("Find Verified Doctors")}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3 rounded-lg font-bold shadow-xs"
                      >
                        View Specialists <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Prevention & Home Care Advice */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Clinical Care Guidelines
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {analysisData.preventionAdvice || "Maintain rest, stay hydrated, and monitor temperature."}
                    </div>
                  </div>

                  {/* OTC Prescriptions & Suggestions */}
                  {analysisData.suggestedPrescriptions && analysisData.suggestedPrescriptions.length > 0 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5 text-teal-600" />
                        Over-The-Counter (OTC) Considerations
                      </span>
                      <div className="space-y-2.5">
                        {analysisData.suggestedPrescriptions.map((rx, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{rx.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                OTC
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] font-medium">{rx.dosage} • {rx.duration}</p>
                            {rx.notes && <p className="text-slate-500 text-[11px] italic mt-0.5">{rx.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      onClick={() => handleConsultDoctor("Consult a Doctor")}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-teal-600/20"
                    >
                      <Stethoscope className="w-4 h-4 mr-2" /> Match With On-Call Doctors
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: On-Call Doctors Directory */}
            {showDoctorCards && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Matched Specialists</h3>
                      <p className="text-xs text-slate-500">Verified physicians ready for consultation</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
                    onClick={() => { setShowDoctorCards(false); setShowAnalysis(true); }}
                  >
                    View Report
                  </Button>
                </div>

                {fetchedDoctors.length === 0 && !isFindingDoctors && (
                  <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                    <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No specialists found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching all specialties or book a General Physician consultation.</p>
                  </div>
                )}

                {fetchedDoctors.map(doctor => (
                  <div 
                    key={doctor._id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all shadow-xs space-y-4"
                  >
                    <div className="flex gap-3.5">
                      <img
                        src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0D9488&color=fff`}
                        alt={doctor.fullName}
                        className="w-13 h-13 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm truncate">Dr. {doctor.fullName}</h4>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                            ★ {doctor.rating || '4.8'}
                          </span>
                        </div>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">{doctor.specialization}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {doctor.experience ? `${doctor.experience} yrs clinical exp` : "Registered specialist"} • {doctor.hospitalName || "MediAI Clinical Hub"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">Consultation Fee</span>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{doctor.consultationFee || 299}
                      </span>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <Link href={`/patient/doctors/${doctor._id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-9 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50">
                          Profile
                        </Button>
                      </Link>
                      <Link href={`/patient/chat/${doctor._id}`} className="flex-1">
                        <Button className="w-full h-9 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs">
                          Start Consult
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Clinical Assessment History">
        {chatHistory.length === 0 ? (
          <div className="text-center py-10">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No triage sessions logged yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Completed assessments and symptom checkups will be saved here.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {chatHistory.map(session => (
              <div
                key={session.id}
                onClick={() => loadSession(session)}
                className={`p-4 rounded-2xl border cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-between gap-4 ${
                  session.id === sessionId ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{session.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {new Date(session.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                  title="Delete assessment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
