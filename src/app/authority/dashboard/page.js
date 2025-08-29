"use client"

import { useMemo } from "react"
import Sidebar from "@/components/authority/Sidebar"
import StatCard from "@/components/authority/StatCard"
import { motion } from "framer-motion"
import { Users2, Stethoscope, Activity, BedDouble, AlertTriangle, Gauge, TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, CartesianGrid } from "recharts"

const COLORS = ["#007bff", "#28a745", "#10b981", "#60a5fa", "#34d399", "#f59e0b"]

export default function AuthorityDashboardPage() {
  const doctorBySpecialization = useMemo(() => [
    { name: "Cardiology", value: 20 },
    { name: "Dermatology", value: 15 },
    { name: "Neurology", value: 10 },
    { name: "Orthopedics", value: 18 },
    { name: "Pediatrics", value: 22 },
    { name: "Oncology", value: 15 },
  ], [])

  const patientGrowth = useMemo(() => ([
    { month: "Jan", patients: 420 },
    { month: "Feb", patients: 480 },
    { month: "Mar", patients: 520 },
    { month: "Apr", patients: 610 },
    { month: "May", patients: 700 },
    { month: "Jun", patients: 830 },
  ]), [])

  const patientsPerCity = useMemo(() => ([
    { city: "Bhopal", count: 240 },
    { city: "Indore", count: 210 },
    { city: "Delhi", count: 310 },
    { city: "Mumbai", count: 280 },
  ]), [])

  const diseaseDistribution = useMemo(() => ([
    { disease: "Cardio", value: 22 },
    { disease: "Derm", value: 18 },
    { disease: "Neuro", value: 15 },
    { disease: "Ortho", value: 20 },
    { disease: "Pedia", value: 25 },
  ]), [])

  const departmentsLoad = useMemo(() => ([
    { dept: "Cardiology", patients: 48 },
    { dept: "Dermatology", patients: 33 },
    { dept: "Neurology", patients: 27 },
    { dept: "Orthopedics", patients: 41 },
    { dept: "Pediatrics", patients: 56 },
  ]), [])

  const bedStats = { total: 500, occupied: 372 }
  const occupancy = Math.round((bedStats.occupied / bedStats.total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-green-50">
      <div className="grid lg:grid-cols-[18rem_1fr] min-h-screen">
        <Sidebar />
        <main className="p-4 lg:p-8 space-y-8">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">Authority Dashboard</h1>
              <p className="text-gray-600 mt-1">Smart overview of hospital operations</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-gray-900">
              <StatCard title="Total Patients" value="830" subtitle="↑ 18% vs last month" icon={Users2} color="blue" />
              <StatCard title="Total Doctors" value="120" subtitle="Active 104" icon={Stethoscope} color="green" />
              <StatCard title="Beds Occupied" value={`${bedStats.occupied}/${bedStats.total}`} subtitle={`${occupancy}% occupancy`} icon={BedDouble} color="gray" />
              <StatCard title="Alerts Today" value="6" subtitle="2 critical" icon={AlertTriangle} color="blue" />
            </div>
          </header>

          <section id="doctors" className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-900">Doctors by Specialization</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={doctorBySpecialization} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={3}>
                      {doctorBySpecialization.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200 overflow-auto">
              <h3 className="font-semibold mb-4 text-gray-900">Doctors</h3>
              <div className="min-w-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700">
                      <th className="py-2">Doctor ID</th>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Contact</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { id: "DR-00123", name: "Dr. A Sharma", spec: "Cardiology", contact: "+91-98765-43210", status: "Active" },
                      { id: "DR-00124", name: "Dr. B Mehta", spec: "Dermatology", contact: "+91-98765-12345", status: "On Leave" },
                      { id: "DR-00125", name: "Dr. C Rao", spec: "Neurology", contact: "+91-91234-56789", status: "Active" },
                    ].map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/60 text-gray-900">
                        <td className="py-2 font-mono text-xs">{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.spec}</td>
                        <td>{d.contact}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${d.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="patients" className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200 lg:col-span-2">
              <h3 className="font-semibold mb-4 text-gray-900">Patient Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#007bff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-900">Disease Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={diseaseDistribution} dataKey="value" nameKey="disease" outerRadius={90}>
                      {diseaseDistribution.map((entry, index) => (
                        <Cell key={`cell2-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section id="resources" className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-900">Beds and Occupancy</h3>
              <div className="grid grid-cols-3 gap-4">
                <StatCard title="Total Beds" value={String(bedStats.total)} icon={BedDouble} />
                <StatCard title="Occupied" value={String(bedStats.occupied)} icon={Activity} />
                <StatCard title="Available" value={String(bedStats.total - bedStats.occupied)} icon={Users2} />
              </div>
              <div className="mt-6">
                <div className="text-sm text-gray-800 mb-2">Occupancy Gauge</div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-4 bg-green-500" style={{ width: `${occupancy}%` }} />
                </div>
                <p className="text-sm text-gray-800 mt-2">{occupancy}% occupied</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-900">Departments Load</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentsLoad}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dept" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="patients" fill="#28a745" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section id="analytics" className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold mb-2 text-gray-900">AI Insights</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Dermatology cases increasing this week (+8%)</li>
                <li>Highest Cardiology cases in Delhi</li>
                <li>Predicted patient inflow +12% next month</li>
              </ul>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200 lg:col-span-2">
              <h3 className="font-semibold mb-4 text-gray-900">Patient Inflow Forecast</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...patientGrowth, { month: "Jul", patients: 910 }, { month: "Aug", patients: 980 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#28a745" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="patients" stroke="#007bff" strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section id="settings" className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold mb-4 text-gray-900">Real-Time Alerts</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "High load in Pediatrics", severity: "critical" },
                { title: "ICU beds below 10%", severity: "warning" },
                { title: "Dr. Sharma has 23 cases today", severity: "info" },
              ].map((n, i) => (
                <motion.div key={i} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35, delay: i * 0.05 }} className={`rounded-xl p-4 border ${n.severity === "critical" ? "bg-red-50 border-red-200" : n.severity === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                    <p className="font-medium text-gray-800">{n.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}


