'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  getDate,
  isToday
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Users,
  Car,
  UserCheck,
  AlertTriangle
} from 'lucide-react'

export function PlanningCalendar({ 
  missions, 
  vehicles, 
  drivers, 
  selectedDate, 
  viewMode, 
  onDateChange, 
  onMissionClick,
  canManage 
}) {
  const navigateDate = (direction) => {
    if (viewMode === 'week') {
      onDateChange(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1))
    } else {
      onDateChange(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1))
    }
  }

  const getDateRange = () => {
    if (viewMode === 'week') {
      return {
        start: startOfWeek(selectedDate, { locale: fr }),
        end: endOfWeek(selectedDate, { locale: fr })
      }
    } else {
      return {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate)
      }
    }
  }

  const getMissionsForDate = (date) => {
    return missions.filter(mission => 
      isSameDay(new Date(mission.departure_date), date)
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || colors.pending
  }

  const truncateText = (text, maxLength = 20) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm')
  }

  // Week view
  if (viewMode === 'week') {
    const { start, end } = getDateRange()
    const days = eachDayOfInterval({ start, end })

    return (
      <div className="p-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            Semaine du {format(start, 'dd', { locale: fr })} au {format(end, 'dd MMMM yyyy', { locale: fr })}
          </h3>
          <Button variant="outline" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-4">
          {days.map((day) => {
            const dayMissions = getMissionsForDate(day)
            const isSelectedDay = isSameDay(day, selectedDate)
            const isTodayDay = isToday(day)

            return (
              <div key={day.toISOString()} className="min-h-[200px]">
                {/* Day Header */}
                <div className={`p-2 text-center rounded-t-lg border-b ${
                  isTodayDay 
                    ? 'bg-blue-100 border-blue-200 text-blue-900'
                    : isSelectedDay
                    ? 'bg-gray-100 border-gray-200'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="text-sm font-medium">
                    {format(day, 'EEEE', { locale: fr })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isTodayDay ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'dd')}
                  </div>
                </div>

                {/* Missions */}
                <div className="space-y-2 p-2 min-h-[160px] bg-gray-50 rounded-b-lg border-l border-r border-b border-gray-200">
                  {dayMissions.map((mission) => (
                    <Card
                      key={mission.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        canManage ? 'hover:scale-105' : ''
                      } ${getStatusColor(mission.status)}`}
                      onClick={() => onMissionClick && onMissionClick(mission)}
                    >
                      <CardContent className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {mission.mission_number}
                            </span>
                            <Clock className="h-3 w-3" />
                          </div>
                          
                          <div className="text-xs font-medium">
                            {formatTime(mission.departure_date)}
                          </div>
                          
                          <div className="text-xs">
                            {truncateText(mission.title, 15)}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {mission.passenger_count}
                            </div>
                            
                            <div className="flex space-x-1">
                              {mission.vehicle ? (
                                <Car className="h-3 w-3 text-blue-600" />
                              ) : (
                                <Car className="h-3 w-3 text-orange-500" />
                              )}
                              {mission.driver ? (
                                <UserCheck className="h-3 w-3 text-green-600" />
                              ) : (
                                <UserCheck className="h-3 w-3 text-orange-500" />
                              )}
                            </div>
                          </div>

                          {(!mission.driver || !mission.vehicle) && (
                            <div className="flex items-center text-xs text-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Non assigné
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {dayMissions.length === 0 && (
                    <div className="text-center text-gray-400 text-xs py-8">
                      Aucune mission
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Month view
  const { start, end } = getDateRange()
  const weeks = eachWeekOfInterval({ start, end }, { locale: fr })

  return (
    <div className="p-4">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-semibold">
          {format(selectedDate, 'MMMM yyyy', { locale: fr })}
        </h3>
        <Button variant="outline" onClick={() => navigateDate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((weekStart) => {
          const weekDays = eachDayOfInterval({
            start: weekStart,
            end: addDays(weekStart, 6)
          })

          return weekDays.map((day) => {
            const dayMissions = getMissionsForDate(day)
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
            const isTodayDay = isToday(day)
            const isSelectedDay = isSameDay(day, selectedDate)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border rounded-lg p-1 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${
                  isTodayDay ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                } ${
                  isSelectedDay ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium p-1 ${
                  isTodayDay ? 'text-blue-600' : 
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {getDate(day)}
                </div>

                {/* Missions */}
                <div className="space-y-1">
                  {dayMissions.slice(0, 2).map((mission) => (
                    <Card
                      key={mission.id}
                      className={`cursor-pointer text-xs p-1 ${
                        canManage ? 'hover:shadow-sm' : ''
                      } ${getStatusColor(mission.status)}`}
                      onClick={() => onMissionClick && onMissionClick(mission)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {formatTime(mission.departure_date)}
                        </span>
                        <div className="flex space-x-1">
                          {!mission.vehicle && <Car className="h-2 w-2 text-orange-500" />}
                          {!mission.driver && <UserCheck className="h-2 w-2 text-orange-500" />}
                        </div>
                      </div>
                      <div className="truncate text-gray-600">
                        {truncateText(mission.title, 12)}
                      </div>
                    </Card>
                  ))}

                  {dayMissions.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayMissions.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}