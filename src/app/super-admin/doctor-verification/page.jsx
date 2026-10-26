"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, XCircle, MapPin, ChevronLeft, ChevronRight, ShieldCheck, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function SuperAdminDoctorVerification() {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPendingDoctors = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true)
      const res = await api.get('/admin/doctors/pending')
      if (res.data.success) {
        setPendingDoctors(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch pending doctors:", err)
    } finally {
      if (!isPolling) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingDoctors()
    const interval = setInterval(() => fetchPendingDoctors(true), 10000)
    return () => clearInterval(interval)
  }, [])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(pendingDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDoctors = pendingDoctors.slice(startIndex, startIndex + itemsPerPage)

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1) }
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1) }

  const handleVerify = async (doctorId, status) => {
    try {
      let rejectionReason = ''

      if (status === 'rejected') {
        rejectionReason = prompt('Please provide a reason for rejection:')
        if (!rejectionReason) {
          alert('Rejection reason is required.')
          return
        }
      }

      const confirmMessage = status === 'approved'
        ? 'Are you sure you want to approve this doctor? Their credentials will be verified across the platform.'
        : `Are you sure you want to reject this doctor?\nReason: ${rejectionReason}`

      if (!confirm(confirmMessage)) {
        return
      }

      const payload = { status }
      if (status === 'rejected') {
        payload.rejectionReason = rejectionReason
      }

      const response = await api.put(`/admin/doctors/${doctorId}/verify`, payload)
      if (response.data.success) {
        toast.success(`Doctor ${status === 'approved' ? 'approved' : 'rejected'} successfully!`)
        fetchPendingDoctors()
      } else {
        toast.error(response.data.message || 'Verification update failed')
      }
    } catch (err) {
      console.error(`Failed to ${status} doctor:`, err)
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred'
      toast.error(`Failed to ${status} doctor: ${errorMessage}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Verification Command</h1>
          </div>
          <p className="text-slate-500 mt-1">Review, inspect credentials, and grant platform practice approval to doctors registered by hospitals.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
          <AlertCircle className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-800">
            {pendingDoctors.length} {pendingDoctors.length === 1 ? 'Doctor' : 'Doctors'} Awaiting Verification
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : pendingDoctors.length === 0 ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="p-12 text-center">
              <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700">All caught up!</h3>
              <p className="text-sm text-slate-500 mt-1">No doctor profiles are currently pending credential verification.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paginatedDoctors.map(doc => (
              <Card key={doc._id} className="border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{doc.fullName}</h3>
                          <p className="text-teal-600 font-semibold">{doc.specialization}</p>
                        </div>
                        <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending Admin Verification
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-900">Experience:</span> {doc.yearsOfExperience} Years</p>
                        <p><span className="font-semibold text-slate-900">License No:</span> {doc.licenseNumber}</p>
                        <p><span className="font-semibold text-slate-900">Email:</span> {doc.email}</p>
                        <p><span className="font-semibold text-slate-900">Phone:</span> {doc.phone || 'N/A'}</p>
                        <p className="sm:col-span-2 flex items-center gap-1 text-slate-700 mt-1">
                          <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold">Affiliated Hospital:</span> {doc.hospitalName} {doc.clinicAddress ? `(${doc.clinicAddress})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4">
                      {doc.degreeCertificate ? (
                        <a href={doc.degreeCertificate.startsWith("http") ? doc.degreeCertificate : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${doc.degreeCertificate}`} target="_blank" rel="noreferrer" className="flex-1 min-w-30 p-3 sm:p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                          <FileText className="h-7 w-7 text-indigo-500 mb-1.5" />
                          <span className="text-xs sm:text-sm font-semibold text-slate-700">View Degree</span>
                        </a>
                      ) : (
                        <div className="flex-1 min-w-30 p-3 sm:p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center opacity-50 bg-slate-50">
                          <FileText className="h-7 w-7 text-slate-400 mb-1.5" />
                          <span className="text-xs sm:text-sm font-medium text-slate-500">No Degree Doc</span>
                        </div>
                      )}

                      {doc.governmentId ? (
                        <a href={doc.governmentId.startsWith("http") ? doc.governmentId : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${doc.governmentId}`} target="_blank" rel="noreferrer" className="flex-1 min-w-30 p-3 sm:p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                          <FileText className="h-7 w-7 text-indigo-500 mb-1.5" />
                          <span className="text-xs sm:text-sm font-semibold text-slate-700">View Gov ID</span>
                        </a>
                      ) : (
                        <div className="flex-1 min-w-30 p-3 sm:p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center opacity-50 bg-slate-50">
                          <FileText className="h-7 w-7 text-slate-400 mb-1.5" />
                          <span className="text-xs sm:text-sm font-medium text-slate-500">No Gov ID</span>
                        </div>
                      )}

                      {doc.medicalLicenseProof ? (
                        <a href={doc.medicalLicenseProof.startsWith("http") ? doc.medicalLicenseProof : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${doc.medicalLicenseProof}`} target="_blank" rel="noreferrer" className="flex-1 min-w-30 p-3 sm:p-4 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                          <FileText className="h-7 w-7 text-indigo-500 mb-1.5" />
                          <span className="text-xs sm:text-sm font-semibold text-slate-700">View License</span>
                        </a>
                      ) : null}
                    </div>

                    <div className="flex lg:flex-col justify-center gap-2 lg:border-l border-slate-100 lg:pl-6 min-w-36">
                      <Button onClick={() => handleVerify(doc._id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-xs">
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => handleVerify(doc._id, 'rejected')} variant="danger" className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50 gap-2 font-semibold">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination Controls */}
            {pendingDoctors.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 mt-4 bg-white rounded-xl">
                <div className="text-sm text-slate-500">
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, pendingDoctors.length)}</span> of <span className="font-medium">{pendingDoctors.length}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
