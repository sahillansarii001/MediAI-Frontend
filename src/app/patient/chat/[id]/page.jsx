"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function PatientChatDynamicRedirect() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (params?.id) {
      router.replace(`/patient/chat?doctorId=${params.id}`)
    } else {
      router.replace(`/patient/chat`)
    }
  }, [params, router])

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
    </div>
  )
}
