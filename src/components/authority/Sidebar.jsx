"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users2, Stethoscope, Building2, Settings, LayoutDashboard, Activity } from "lucide-react"

const navItems = [
  { href: "/authority/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/authority/dashboard#doctors", label: "Doctors", icon: Stethoscope },
  { href: "/authority/dashboard#patients", label: "Patients", icon: Users2 },
  { href: "/authority/dashboard#resources", label: "Hospital Resources", icon: Building2 },
  { href: "/authority/dashboard#analytics", label: "Analytics", icon: BarChart3 },
  { href: "/authority/dashboard#settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="h-full w-72 bg-white/60 backdrop-blur-xl border-r border-gray-200 p-4 hidden lg:flex flex-col">
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Smart Hospital</p>
          <p className="font-semibold">Control Tower</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith("/authority/dashboard") && item.href.includes("dashboard")
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition hover:bg-blue-50 ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}>
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto text-xs text-gray-500 px-2">v1.0 • Authority</div>
    </aside>
  )
}


