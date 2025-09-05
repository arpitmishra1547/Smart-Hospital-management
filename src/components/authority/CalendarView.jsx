"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CalendarView({ 
  schedules = [], 
  onDateChange, 
  onScheduleClick, 
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule 
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState("week") // week, month

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getWeekDays = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    
    return week
  }

  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.filter(schedule => schedule.date === dateStr)
  }

  const getSchedulesForWeek = (weekDays) => {
    const weekSchedules = {}
    weekDays.forEach(day => {
      const dateStr = day.toISOString().split('T')[0]
      weekSchedules[dateStr] = schedules.filter(schedule => schedule.date === dateStr)
    })
    return weekSchedules
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const weekDays = getWeekDays(currentDate)
  const weekSchedules = getSchedulesForWeek(weekDays)

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-gray-900">Schedule Calendar</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setView("week")}
              variant={view === "week" ? "default" : "outline"}
              size="sm"
            >
              Week
            </Button>
            <Button
              onClick={() => setView("month")}
              variant={view === "month" ? "default" : "outline"}
              size="sm"
            >
              Month
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => view === "week" ? navigateWeek(-1) : navigateMonth(-1)}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {view === "week" 
              ? `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }
          </span>
          <Button
            onClick={() => view === "week" ? navigateWeek(1) : navigateMonth(1)}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          {weekDays.map((day, index) => {
            const daySchedules = weekSchedules[day.toISOString().split('T')[0]] || []
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all ${
                  isToday(day) 
                    ? 'bg-blue-50 border-blue-200' 
                    : isSelected(day)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedDate(day)
                  onDateChange?.(day)
                }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday(day) ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => (
                    <motion.div
                      key={schedule.scheduleId}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded p-1 text-xs border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={(e) => {
                        e.stopPropagation()
                        onScheduleClick?.(schedule)
                      }}
                    >
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(schedule.startTime)}</span>
                      </div>
                      <div className="font-medium text-gray-900 truncate">
                        {typeof schedule.doctorName === 'string' ? schedule.doctorName : 'Unknown Doctor'}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>Room {schedule.roomNumber || 'N/A'}</span>
                      </div>
                    </motion.div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{daySchedules.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          {getDaysInMonth(currentDate).map((day, index) => {
            if (!day) {
              return <div key={index} className="h-16"></div>
            }
            
            const daySchedules = getSchedulesForDate(day)
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`h-16 p-1 border rounded cursor-pointer transition-all ${
                  isToday(day) 
                    ? 'bg-blue-50 border-blue-200' 
                    : isSelected(day)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedDate(day)
                  onDateChange?.(day)
                }}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isToday(day) ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {daySchedules.slice(0, 2).map((schedule) => (
                    <div
                      key={schedule.scheduleId}
                      className="bg-white rounded px-1 py-0.5 text-xs border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={(e) => {
                        e.stopPropagation()
                        onScheduleClick?.(schedule)
                      }}
                    >
                      <div className="truncate font-medium text-gray-900">
                        {typeof schedule.doctorName === 'string' ? schedule.doctorName : 'Unknown Doctor'}
                      </div>
                      <div className="text-gray-500">
                        {formatTime(schedule.startTime)}
                      </div>
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{daySchedules.length - 2}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Schedule Details Panel */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Schedules for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <Button
              onClick={() => onAddSchedule?.(selectedDate)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Schedule
            </Button>
          </div>
          
          <div className="space-y-3">
            {getSchedulesForDate(selectedDate).map((schedule) => (
              <Card key={schedule.scheduleId} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{typeof schedule.doctorName === 'string' ? schedule.doctorName : 'Unknown Doctor'}</span>
                        <span className="text-sm text-gray-500">- {typeof schedule.departmentName === 'string' ? schedule.departmentName : 'Unknown Department'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Room {schedule.roomNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                        </div>
                      </div>
                      {schedule.isRecurring && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Recurring Schedule</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onEditSchedule?.(schedule)}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteSchedule?.(schedule)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getSchedulesForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No schedules for this date</p>
                <Button
                  onClick={() => onAddSchedule?.(selectedDate)}
                  size="sm"
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Schedule
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
