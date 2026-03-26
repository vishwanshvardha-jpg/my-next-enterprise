"use client"

import { use } from "react"
import { GuestAppShell } from "components/GuestOnboarding/GuestAppShell"

// Next.js 15: params is a Promise — unwrap with React.use()
export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  return <GuestAppShell token={token} />
}
