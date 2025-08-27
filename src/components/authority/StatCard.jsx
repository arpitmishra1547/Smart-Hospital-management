"use client"

import { motion } from "framer-motion"

export default function StatCard({ title, value, subtitle, icon, color = "blue" }) {
  const Icon = icon
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    gray: "bg-gray-50 text-gray-700",
  }[color]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-gray-200 hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-800">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-700 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  )
}


