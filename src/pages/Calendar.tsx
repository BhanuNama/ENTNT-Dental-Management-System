import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, TrendingUp, Activity, MapPin, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Calendar: React.FC = () => {
  const { incidents, patients } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date: Date) => {
    return incidents.filter(incident => {
      const appointmentDate = new Date(incident.appointmentDate);
      return appointmentDate.toDateString() === date.toDateString() && incident.status === 'Scheduled';
    });
  };

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown';
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  // Generate calendar grid with proper week starts
  const generateCalendarDays = () => {
    const startDate = new Date(monthStart);
    const dayOfWeek = startDate.getDay();
    
    // Add empty cells for days before month starts
    const calendarDays = [];
    for (let i = 0; i < dayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    daysInMonth.forEach(day => {
      calendarDays.push(day);
    });
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  // Calculate stats
  const monthlyAppointments = incidents.filter(incident => {
    const appointmentDate = new Date(incident.appointmentDate);
    return appointmentDate >= monthStart && 
           appointmentDate <= monthEnd && 
           incident.status === 'Scheduled';
  });

  const todayAppointments = getAppointmentsForDate(new Date());

  // Get upcoming appointments - just regular scheduled appointments
  const upcomingAppointments = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return incidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        return appointmentDate > today && incident.status === 'Scheduled';
      })
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 10);
  }, [incidents]);

  return (
    <div className="space-y-6 p-1">
      {/* Header Section */}
      <Card variant="glass" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Calendar & Schedule
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage your appointment schedule
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-white/20 dark:border-gray-700/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                {""}
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 px-4">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                icon={<ChevronRight className="h-4 w-4" />}
              >
                {""}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{monthlyAppointments.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayAppointments.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{upcomingAppointments.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2" padding="lg">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-3" />;
              }

              const currentDay = day as Date;
              const dayAppointments = getAppointmentsForDate(currentDay);
              const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
              const isCurrentDay = isToday(currentDay);

              return (
                <button
                  key={currentDay.getTime()}
                  onClick={() => setSelectedDate(currentDay)}
                  className={`group p-3 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                    isSelected
                      ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                      : isCurrentDay
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className={`text-sm font-bold mb-1 ${
                    isSelected 
                      ? 'text-white' 
                      : isCurrentDay 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {format(currentDay, 'd')}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((appointment, idx) => (
                        <div key={idx} className={`text-xs px-1.5 py-0.5 rounded-md truncate ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        }`}>
                          {appointment.title}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className={`text-xs ${
                          isSelected ? 'text-white/80' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Date Details */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedDate ? format(selectedDate, 'EEEE') : 'Click on a date to view appointments'}
              </p>
            </div>
          </div>

          {!selectedDate ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Click on a calendar date to view scheduled appointments
              </p>
            </div>
          ) : selectedDateAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No appointments scheduled for this date
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{appointment.title}</h4>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{appointment.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(appointment.appointmentDate), 'h:mm a')}</span>
                    </div>
                    {appointment.cost && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${appointment.cost}</span>
                      </div>
                    )}
                  </div>
                  {appointment.comments && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Notes:</strong> {appointment.comments}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Appointments Bento */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming This Month</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Next scheduled appointments</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
            {monthlyAppointments.length} total
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyAppointments
            .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
            .slice(0, 6)
            .map((appointment) => (
              <Card key={appointment.id} variant="subtle" hover className="group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {appointment.title}
                    </h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg font-medium">
                      {format(new Date(appointment.appointmentDate), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 text-green-500" />
                    <span>{getPatientName(appointment.patientId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(appointment.appointmentDate), 'h:mm a')}</span>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {monthlyAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No appointments scheduled for this month
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};