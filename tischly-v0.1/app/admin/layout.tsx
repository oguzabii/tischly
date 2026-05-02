import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tischly Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0F0E0E]">{children}</div>
}
