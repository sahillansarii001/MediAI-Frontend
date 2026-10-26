"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Plus, Edit2, Trash2, Eye, Users, UserCheck, UserX, UserPlus, Activity, Clock, ShieldAlert, ChevronLeft, ChevronRight, HeartPulse } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function SuperAdminPatients() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)
  const [userEmergencies, setUserEmergencies] = useState([])
  const [isEmergenciesLoading, setIsEmergenciesLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "password123", confirmPassword: "password123", mustChangePassword: false, phone: "", age: "", sex: "male", bloodGroup: "", allergies: "", currentMedications: "", previousDiseaseHistory: "", familyDiseaseHistory: "", emergencyContact: "", accountStatus: "active"
  })

  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true)
      const res = await api.get('/admin/users')
      if (res.data.success) {
        setUsers(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      toast.error(typeof error === 'string' ? error : "Failed to load patient list")
    } finally {
      if (!isPolling) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(() => fetchUsers(true), 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const nameMatch = user.fullName ? user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : false
      const emailMatch = user.email ? user.email.toLowerCase().includes(searchQuery.toLowerCase()) : false
      const phoneMatch = user.phone ? user.phone.includes(searchQuery) : false
      const matchesSearch = nameMatch || emailMatch || phoneMatch

      const status = user.accountStatus === 'suspended' ? 'Suspended' : (user.isActive === false ? 'Pending' : 'Active')
      const matchesStatus = statusFilter === "All" || status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, searchQuery, statusFilter])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1) }
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1) }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const stats = {
    total: users.length,
    active: users.filter(u => u.accountStatus !== "suspended" && u.isActive !== false).length,
    suspended: users.filter(u => u.accountStatus === "suspended").length,
    newThisMonth: users.filter(u => new Date(u.createdAt) > new Date(new Date().setDate(1))).length
  }

  const handleOpenAdd = () => {
    setFormData({
      fullName: "", email: "", password: "password123", confirmPassword: "password123", mustChangePassword: true, phone: "", age: "", sex: "male",
      bloodGroup: "", allergies: "", currentMedications: "",
      previousDiseaseHistory: "", familyDiseaseHistory: "",
      emergencyContact: "", accountStatus: "active"
    })
    setSelectedUser(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      phone: user.phone || "",
      age: user.age || "",
      sex: user.sex || "male",
      bloodGroup: user.bloodGroup || "",
      allergies: Array.isArray(user.allergies) ? user.allergies.join(", ") : (user.allergies || ""),
      currentMedications: Array.isArray(user.currentMedications) ? user.currentMedications.join(", ") : (user.currentMedications || ""),
      previousDiseaseHistory: Array.isArray(user.previousDiseaseHistory) ? user.previousDiseaseHistory.join(", ") : (user.previousDiseaseHistory || ""),
      familyDiseaseHistory: Array.isArray(user.familyDiseaseHistory) ? user.familyDiseaseHistory.join(", ") : (user.familyDiseaseHistory || ""),
      emergencyContact: user.emergencyContact || "",
      accountStatus: user.accountStatus || "active",
      mustChangePassword: false
    })
    setIsFormModalOpen(true)
  }

  const handleOpenView = async (user) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
    setIsEmergenciesLoading(true)
    try {
      const res = await api.get(`/admin/users/${user._id}/emergencies`)
      if (res.data.success) {
        setUserEmergencies(res.data.data)
      }
    } catch {
      setUserEmergencies([])
    } finally {
      setIsEmergenciesLoading(false)
    }
  }

  const handleOpenDelete = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(",").map(s => s.trim()) : [],
        currentMedications: formData.currentMedications ? formData.currentMedications.split(",").map(s => s.trim()) : [],
        previousDiseaseHistory: formData.previousDiseaseHistory ? formData.previousDiseaseHistory.split(",").map(s => s.trim()) : [],
        familyDiseaseHistory: formData.familyDiseaseHistory ? formData.familyDiseaseHistory.split(",").map(s => s.trim()) : []
      }

      if (selectedUser) {
        if (!payload.password) {
          delete payload.password
          delete payload.confirmPassword
        }
        await api.put(`/admin/users/${selectedUser._id}`, payload)
        toast.success("Patient details updated")
      } else {
        await api.post('/admin/users', payload)
        toast.success("Patient created successfully")
      }
      setIsFormModalOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save patient")
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      await api.delete(`/admin/users/${selectedUser._id}`)
      toast.success("Patient deleted")
      setIsDeleteModalOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete patient")
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.accountStatus === 'suspended' ? 'active' : 'suspended'
      await api.put(`/admin/users/${user._id}`, { accountStatus: newStatus })
      toast.success(`Patient account ${newStatus === 'active' ? 'activated' : 'suspended'}`)
      fetchUsers()
    } catch (err) {
      toast.error("Failed to update account status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Patients</h1>
          </div>
          <p className="text-slate-500 mt-1">Platform-wide patient health profiles, records, and emergency alerts oversight.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
          <Plus className="w-4 h-4 mr-2" /> Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.active}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Suspended</p>
          <p className="text-2xl font-extrabold text-red-700 mt-1">{stats.suspended}</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Registered This Month</p>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{stats.newThisMonth}</p>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient name, email, or phone..."
                className="pl-9 text-slate-900 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map(user => (
                  <TableRow key={user._id}>
                    <TableCell className="font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {user.fullName ? user.fullName.charAt(0) : "P"}
                        </div>
                        <div>
                          <p>{user.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-normal">Registered {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-slate-800 font-medium">{user.email}</span>
                        <span className="text-slate-400">{user.phone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 text-xs">
                      {user.age ? `${user.age} yrs` : 'N/A'}, {user.sex ? user.sex.toUpperCase() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {user.bloodGroup || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.accountStatus === 'suspended' ? 'destructive' : 'success'}>
                        {user.accountStatus === 'suspended' ? 'Suspended' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenView(user)} title="View Details & Health">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)} title="Edit Patient">
                          <Edit2 className="w-4 h-4 text-indigo-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          title={user.accountStatus === 'suspended' ? 'Activate' : 'Suspend'}
                          className={user.accountStatus === 'suspended' ? 'text-emerald-600' : 'text-amber-600'}
                        >
                          {user.accountStatus === 'suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(user)} title="Delete Patient">
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
              Showing <span className="font-medium">{filteredUsers.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> entries
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedUser ? "Edit Patient" : "Add Patient"}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            {!selectedUser && (
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <select className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Input placeholder="e.g. O+, A-, B+" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Allergies (comma separated)</Label>
              <Input value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Current Medications (comma separated)</Label>
              <Input value={formData.currentMedications} onChange={e => setFormData({...formData, currentMedications: e.target.value})} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Account Status</Label>
              <select className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={formData.accountStatus} onChange={e => setFormData({...formData, accountStatus: e.target.value})}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to permanently delete patient <span className="font-bold text-slate-900">{selectedUser?.fullName}</span>? This action cannot be reversed.</p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Patient Record & Health Summary">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                {selectedUser.fullName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUser.fullName}</h3>
                <p className="text-slate-500 text-xs">{selectedUser.email} • {selectedUser.phone || 'No phone'}</p>
                <Badge variant={selectedUser.accountStatus === 'suspended' ? 'destructive' : 'success'} className="mt-1">
                  {selectedUser.accountStatus === 'suspended' ? 'Suspended' : 'Active'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><span className="font-semibold text-slate-500 uppercase">Age / Sex:</span> {selectedUser.age || 'N/A'} yrs / {selectedUser.sex || 'N/A'}</div>
              <div><span className="font-semibold text-slate-500 uppercase">Blood Group:</span> {selectedUser.bloodGroup || 'N/A'}</div>
              <div><span className="font-semibold text-slate-500 uppercase">Emergency Contact:</span> {selectedUser.emergencyContact || 'N/A'}</div>
              <div><span className="font-semibold text-slate-500 uppercase">Registered:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-500 uppercase">Allergies:</span> {Array.isArray(selectedUser.allergies) ? selectedUser.allergies.join(", ") : (selectedUser.allergies || 'None recorded')}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-500 uppercase">Current Medications:</span> {Array.isArray(selectedUser.currentMedications) ? selectedUser.currentMedications.join(", ") : (selectedUser.currentMedications || 'None recorded')}</div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
