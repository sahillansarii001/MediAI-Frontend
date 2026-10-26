"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Plus, Edit2, Trash2, Eye, Filter, ChevronLeft, ChevronRight, Stethoscope, CheckCircle, XCircle, Building2, ShieldCheck, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function SuperAdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [specFilter, setSpecFilter] = useState("All")
  const [verifFilter, setVerifFilter] = useState("All")
  const [hospitalFilter, setHospitalFilter] = useState("All")

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form State for Admin Editing/Creating Doctor
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", password: "", specialization: "", licenseNumber: "", yearsOfExperience: "", hospitalName: "", clinicAddress: "", verificationStatus: "approved", accountStatus: "active"
  })

  const fetchDoctors = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true)
      const res = await api.get('/admin/doctors')
      if (res.data.success) {
        setDoctors(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err)
      toast.error(typeof err === 'string' ? err : "Failed to load doctor data")
    } finally {
      if (!isPolling) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
    const interval = setInterval(() => fetchDoctors(true), 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const nameMatch = doc.fullName ? doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : false
      const specMatch = doc.specialization ? doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) : false
      const hospMatch = doc.hospitalName ? doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) : false
      const matchesSearch = nameMatch || specMatch || hospMatch

      const matchesSpec = specFilter === "All" || doc.specialization === specFilter
      const matchesHosp = hospitalFilter === "All" || doc.hospitalName === hospitalFilter

      let vStatus = "Pending"
      if (doc.verificationStatus === "approved") vStatus = "Verified"
      else if (doc.verificationStatus === "rejected") vStatus = "Rejected"

      const matchesVerif = verifFilter === "All" || vStatus === verifFilter
      return matchesSearch && matchesSpec && matchesVerif && matchesHosp
    })
  }, [doctors, searchQuery, specFilter, verifFilter, hospitalFilter])

  const specializations = ["All", ...new Set(doctors.map(d => d.specialization).filter(Boolean))]
  const hospitals = ["All", ...new Set(doctors.map(d => d.hospitalName).filter(Boolean))]

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + itemsPerPage)

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1) }
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1) }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, specFilter, verifFilter, hospitalFilter])

  const handleOpenAdd = () => {
    setSelectedDoctor(null)
    setFormData({
      fullName: "", email: "", phone: "", password: "", specialization: "", licenseNumber: "", yearsOfExperience: "", hospitalName: "", clinicAddress: "", verificationStatus: "approved", accountStatus: "active"
    })
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (doctor) => {
    setFormData({
      fullName: doctor.fullName || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      password: "",
      specialization: doctor.specialization || "",
      licenseNumber: doctor.licenseNumber || "",
      yearsOfExperience: doctor.yearsOfExperience || "",
      hospitalName: doctor.hospitalName || "",
      clinicAddress: doctor.clinicAddress || "",
      verificationStatus: doctor.verificationStatus || "pending",
      accountStatus: doctor.accountStatus || "active"
    })
    setSelectedDoctor(doctor)
    setIsFormModalOpen(true)
  }

  const handleOpenView = (doctor) => {
    setSelectedDoctor(doctor)
    setIsViewModalOpen(true)
  }

  const handleOpenDelete = (doctor) => {
    setSelectedDoctor(doctor)
    setIsDeleteModalOpen(true)
  }

  const handleSaveDoctor = async (e) => {
    e.preventDefault()
    try {
      if (selectedDoctor) {
        const updatePayload = { ...formData }
        if (!updatePayload.password) delete updatePayload.password
        await api.put(`/admin/doctors/${selectedDoctor._id}`, updatePayload)
        toast.success("Doctor details updated")
      } else {
        await api.post('/admin/doctors', formData)
        toast.success("Doctor created successfully")
      }
      fetchDoctors()
      setIsFormModalOpen(false)
    } catch (err) {
      console.error("Failed to save doctor:", err)
      const msg = err.response?.data?.message || "Failed to save doctor"
      toast.error(msg)
    }
  }

  const handleDeleteDoctor = async () => {
    if (selectedDoctor) {
      try {
        await api.delete(`/admin/doctors/${selectedDoctor._id}`)
        toast.success("Doctor deleted")
        fetchDoctors()
        setIsDeleteModalOpen(false)
      } catch (err) {
        console.error("Failed to delete doctor:", err)
        toast.error("Failed to delete doctor")
      }
    }
  }

  const handleQuickVerify = async (doctorId, status) => {
    try {
      const res = await api.put(`/admin/doctors/${doctorId}/verify`, { status })
      if (res.data.success) {
        toast.success(`Doctor marked as ${status}`)
        fetchDoctors()
      } else {
        toast.error(res.data.message || "Failed to update verification status")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating verification status")
    }
  }

  const getStatusBadgeVariant = (status) => {
    const s = status ? status.toLowerCase() : ""
    if (s === "active" || s === "approved" || s === "verified") return "success"
    if (s === "pending") return "warning"
    if (s === "suspended" || s === "rejected") return "destructive"
    return "default"
  }

  const getDisplayStatus = (status) => {
    const s = status ? status.toLowerCase() : ""
    if (s === "approved") return "Verified"
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : ""
  }

  const pendingCount = doctors.filter(d => d.verificationStatus === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Doctors</h1>
          </div>
          <p className="text-slate-500 mt-1">Platform-wide registry of medical specialists across all partner hospitals.</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Link href="/super-admin/doctor-verification">
              <Button variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                {pendingCount} Pending Verifications
              </Button>
            </Link>
          )}
          <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <Plus className="w-4 h-4 mr-2" /> Add Doctor
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Doctors</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{doctors.length}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Verified Active</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {doctors.filter(d => d.verificationStatus === 'approved' && d.accountStatus === 'active').length}
          </p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Verification</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospitals Represented</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{hospitals.length - 1}</p>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, hospital, specialty..."
                className="pl-9 text-slate-900 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec === "All" ? "All Specialties" : spec}</option>
                ))}
              </select>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
              >
                {hospitals.map(h => (
                  <option key={h} value={h}>{h === "All" ? "All Hospitals" : h}</option>
                ))}
              </select>
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={verifFilter}
                onChange={(e) => setVerifFilter(e.target.value)}
              >
                <option value="All">All Verifications</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Hospital / Clinic</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Loading doctors...
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No doctors found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDoctors.map(doctor => (
                  <TableRow key={doctor._id}>
                    <TableCell className="font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {doctor.fullName ? doctor.fullName.charAt(0) : "D"}
                        </div>
                        <div>
                          <p>{doctor.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-normal">Exp: {doctor.yearsOfExperience || 0} yrs</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">{doctor.specialization}</TableCell>
                    <TableCell className="text-slate-700">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        {doctor.hospitalName || "Independent"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-slate-800 font-medium">{doctor.email}</span>
                        <span className="text-slate-400">{doctor.phone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doctor.verificationStatus)}>
                        {getDisplayStatus(doctor.verificationStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doctor.accountStatus)}>
                        {getDisplayStatus(doctor.accountStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doctor.verificationStatus === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuickVerify(doctor._id, 'approved')}
                            title="Approve Doctor"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleOpenView(doctor)} title="View Details">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(doctor)} title="Edit Doctor">
                          <Edit2 className="w-4 h-4 text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(doctor)} title="Delete Doctor">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{filteredDoctors.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredDoctors.length)}</span> of <span className="font-medium">{filteredDoctors.length}</span> entries
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
        </CardContent>
      </Card>

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedDoctor ? "Edit Doctor Profile" : "Create Platform Doctor"}
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="text-slate-900" />
            </div>
            {!selectedDoctor && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Initial Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={6} placeholder="Min 6 characters" className="text-slate-900" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-slate-700">Specialization</Label>
              <Input id="specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-slate-700">Medical License Number</Label>
              <Input id="licenseNumber" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience" className="text-slate-700">Years of Experience</Label>
              <Input id="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospitalName" className="text-slate-700">Hospital / Clinic</Label>
              <Input id="hospitalName" value={formData.hospitalName} onChange={e => setFormData({ ...formData, hospitalName: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="clinicAddress" className="text-slate-700">Clinic Address</Label>
              <Input id="clinicAddress" value={formData.clinicAddress} onChange={e => setFormData({ ...formData, clinicAddress: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationStatus" className="text-slate-700">Verification Status</Label>
              <select
                id="verificationStatus"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={formData.verificationStatus}
                onChange={e => setFormData({ ...formData, verificationStatus: e.target.value })}
              >
                <option value="approved">Approved / Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountStatus" className="text-slate-700">Account Status</Label>
              <select
                id="accountStatus"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={formData.accountStatus}
                onChange={e => setFormData({ ...formData, accountStatus: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Doctor</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-900">{selectedDoctor?.fullName}</span>? This will revoke their access across the entire platform.</p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteDoctor}>Delete Doctor</Button>
          </div>
        </div>
      </Modal>

      {/* View Doctor Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Doctor Record Details">
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
                {selectedDoctor.fullName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDoctor.fullName}</h3>
                <p className="text-indigo-600 font-medium">{selectedDoctor.specialization}</p>
                <p className="text-xs text-slate-500">{selectedDoctor.hospitalName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Email</span>
                <p className="text-slate-800 font-medium">{selectedDoctor.email}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Phone</span>
                <p className="text-slate-800 font-medium">{selectedDoctor.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">License Number</span>
                <p className="text-slate-800 font-mono font-medium">{selectedDoctor.licenseNumber}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Experience</span>
                <p className="text-slate-800 font-medium">{selectedDoctor.yearsOfExperience} Years</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Clinic Address</span>
                <p className="text-slate-800 font-medium">{selectedDoctor.clinicAddress}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Verification</span>
                <p><Badge variant={getStatusBadgeVariant(selectedDoctor.verificationStatus)}>{getDisplayStatus(selectedDoctor.verificationStatus)}</Badge></p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Account Status</span>
                <p><Badge variant={getStatusBadgeVariant(selectedDoctor.accountStatus)}>{getDisplayStatus(selectedDoctor.accountStatus)}</Badge></p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
