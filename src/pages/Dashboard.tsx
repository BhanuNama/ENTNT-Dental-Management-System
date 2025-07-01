import React from 'react';
import { useData } from '../context/DataContext';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/Card';

export const Dashboard: React.FC = () => {
  const { patients, incidents } = useData();

  // Calculate stats with enhanced revenue tracking
  const totalAppointments = incidents.length;
  const todayAppointments = incidents.filter(inc => isToday(new Date(inc.appointmentDate)));
  const scheduledAppointments = incidents.filter(inc => inc.status === 'Scheduled');
  const completedAppointments = incidents.filter(inc => inc.status === 'Completed');
  
  // Revenue calculations
  const totalRevenue = incidents
    .filter(inc => inc.status === 'Completed' && inc.cost && inc.isPaid)
    .reduce((sum, inc) => sum + (inc.cost || 0), 0);
    
  const pendingPayments = incidents
    .filter(inc => inc.status === 'Completed' && inc.cost && !inc.isPaid)
    .reduce((sum, inc) => sum + (inc.cost || 0), 0);

  // Get upcoming appointments (next 10) - just regular scheduled appointments
  const upcomingAppointments = React.useMemo(() => {
    return incidents
      .filter(i => i.status === 'Scheduled' && new Date(i.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 10);
  }, [incidents]);

  // Calculate dynamic revenue data by month
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const monthRevenue = incidents
        .filter(inc => {
          if (!inc.isPaid || !inc.paidAt || inc.status !== 'Completed') return false;
          const paidDate = new Date(inc.paidAt);
          return paidDate.getFullYear() === currentYear && paidDate.getMonth() === monthIndex;
        })
        .reduce((sum, inc) => sum + (inc.cost || 0), 0);
      
      return {
        month,
        revenue: monthRevenue
      };
    });
  }, [incidents]);

  const statusData = [
    { name: 'Completed', value: completedAppointments.length, color: '#10B981' },
    { name: 'Scheduled', value: scheduledAppointments.length, color: '#06B6D4' },
    { name: 'Cancelled', value: incidents.filter(i => i.status === 'Cancelled').length, color: '#F59E0B' },
    { name: 'In Progress', value: incidents.filter(i => i.status === 'In Progress').length, color: '#8B5CF6' },
  ];

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      subtitle: 'Active patient records',
      icon: Users,
      iconBg: 'bg-blue-500',
      trend: '+12%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: 'From completed treatments',
      icon: DollarSign,
      iconBg: 'bg-green-500',
      trend: '+8.2%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Pending Payments',
      value: `$${pendingPayments.toLocaleString()}`,
      subtitle: 'Unpaid treatments',
      icon: DollarSign,
      iconBg: 'bg-orange-500',
      trend: '-3%',
      trendColor: 'text-red-600'
    },
    {
      title: 'Completed Treatments',
      value: completedAppointments.length,
      subtitle: 'Successfully finished',
      icon: CheckCircle,
      iconBg: 'bg-purple-500',
      trend: '+15%',
      trendColor: 'text-green-600'
    }
  ];

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6 p-1">
      {/* Professional Header */}
      <div className="relative">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Practice Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Professional Dental Management</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                Comprehensive overview of your dental practice performance, patient care metrics, and operational insights.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">System Active</span>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Today's Appointments: {todayAppointments.length}</span>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Active Patients: {patients.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Performance Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 min-w-[280px]">
              <div className="space-y-3">
      <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">Practice Performance</span>
                  <div className="flex text-yellow-500 dark:text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{patients.length}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Patients</p>
                  </div>
        <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAppointments}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Appointments</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">98.5% Patient Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAppointments}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</p>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{todayAppointments.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Schedule</p>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedAppointments.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalRevenue}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue (Paid)</p>
            </div>
          </div>
                </div>
        <div className="stats-card">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
              </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${pendingPayments}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card padding="lg" className="border-emerald-100 dark:border-emerald-900/30">
          <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Overview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue and growth trends</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Revenue Growth</span>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                  +12.5% vs last quarter
                </div>
              </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="revenue" fill="url(#emeraldGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
            </BarChart>
          </ResponsiveContainer>
          </Card>
        </div>

        {/* Appointment Status */}
        <div>
          <Card padding="lg" className="border-emerald-100 dark:border-emerald-900/30">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Status Overview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Appointment distribution</p>
                </div>
              </div>
          </div>
            <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                  outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #06b6d4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
            </PieChart>
          </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{entry.value}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      ({((entry.value / statusData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Professional Appointments and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card padding="lg" className="border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
          <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Schedule</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Patient appointments for today</p>
              </div>
            </div>
            <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium">
              {todayAppointments.length} appointments
            </div>
          </div>
          
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-emerald-100 dark:bg-emerald-900/20 p-4 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</h4>
              <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
          </div>
        ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {todayAppointments.slice(0, 8).map((appointment) => (
                <div key={appointment.id} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {getPatientName(appointment.patientId).split(' ').map(n => n[0]).join('')}
                      </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {getPatientName(appointment.patientId)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.title}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {format(new Date(appointment.appointmentDate), 'h:mm a')}
                    </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        </Card>

      {/* Recent Activity */}
        <Card padding="lg" className="border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
          <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Latest completed treatments</p>
              </div>
            </div>
        </div>
        
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
          {incidents
            .filter(i => i.status === 'Completed')
            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
              .slice(0, 8)
            .map((appointment) => (
                <div key={appointment.id} className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {getPatientName(appointment.patientId).split(' ').map(n => n[0]).join('')}
                      </div>
                  <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {getPatientName(appointment.patientId)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                        Completed
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(appointment.appointmentDate), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            {incidents.filter(i => i.status === 'Completed').length === 0 && (
              <div className="text-center py-12">
                <div className="bg-teal-100 dark:bg-teal-900/20 p-4 rounded-full w-fit mx-auto mb-4">
                  <Activity className="h-8 w-8 text-teal-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Recent Activity</h4>
                <p className="text-gray-500 dark:text-gray-400">Completed treatments will appear here</p>
              </div>
            )}
        </div>
        </Card>
      </div>
    </div>
  );
};