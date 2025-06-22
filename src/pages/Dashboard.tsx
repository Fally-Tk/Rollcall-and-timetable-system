import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, AlertTriangle, TrendingUp, Calendar, ClipboardList, FileText, ArrowRight } from 'lucide-react';
import { APIService } from '../utils/api';
import { LocalDBService } from '../utils/localdb';
import type { DashboardStats, FieldStats, TopAbsenteeField } from '../types';

// Demo data for fallback
const getDemoDashboardData = (): DashboardStats => ({
  totalStudents: 1250,
  totalFields: 8,
  todayAbsentees: 45,
  weeklyAbsentees: 180,
  monthlyAbsentees: 520,
  fieldStats: [
    {
      fieldId: '1',
      fieldName: 'Computer Science',
      totalStudents: 320,
      presentToday: 285,
      absentToday: 35,
      attendanceRate: 89.1
    },
    {
      fieldId: '2',
      fieldName: 'Software Engineering',
      totalStudents: 280,
      presentToday: 265,
      absentToday: 15,
      attendanceRate: 94.6
    },
    {
      fieldId: '3',
      fieldName: 'Information Technology',
      totalStudents: 250,
      presentToday: 230,
      absentToday: 20,
      attendanceRate: 92.0
    },
    {
      fieldId: '4',
      fieldName: 'Cybersecurity',
      totalStudents: 180,
      presentToday: 165,
      absentToday: 15,
      attendanceRate: 91.7
    },
    {
      fieldId: '5',
      fieldName: 'Data Science',
      totalStudents: 220,
      presentToday: 200,
      absentToday: 20,
      attendanceRate: 90.9
    }
  ],
  topAbsenteeFields: [
    {
      fieldName: 'Computer Science',
      absenteeCount: 35,
      totalStudents: 320,
      absenteeRate: 10.9
    },
    {
      fieldName: 'Data Science',
      absenteeCount: 20,
      totalStudents: 220,
      absenteeRate: 9.1
    },
    {
      fieldName: 'Information Technology',
      absenteeCount: 20,
      totalStudents: 250,
      absenteeRate: 8.0
    }
  ]
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      let dashboardData;
      try {
        dashboardData = await APIService.getDashboardStats();
      } catch (apiError) {
        // Fallback to cached data
        dashboardData = LocalDBService.getCachedData('rollcall_cached_dashboard');
        
        if (!dashboardData) {
          console.log('Using demo data as fallback');
          dashboardData = getDemoDashboardData();
        }
      }

      setStats(dashboardData);
      
      // Cache the data
      LocalDBService.cacheData('rollcall_cached_dashboard', dashboardData);

    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Dashboard
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error || 'Failed to load dashboard data'}
        </p>
        <button
          onClick={loadDashboardStats}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Rollcall Manager
        </h1>
        <p className="text-blue-100 text-lg">
          Monitor attendance, manage students, and track performance across all fields
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fields</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalFields}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Absentees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayAbsentees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Absentees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.weeklyAbsentees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Absentees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.monthlyAbsentees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/rollcall')}
            className="group flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-lg font-semibold">Start Rollcall</div>
              <div className="text-blue-100">Take attendance for current sessions</div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/timetable')}
            className="group flex items-center space-x-4 p-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-lg font-semibold">Manage Timetable</div>
              <div className="text-green-100">Update weekly schedules</div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/students')}
            className="group flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-lg font-semibold">Manage Students</div>
              <div className="text-purple-100">Add and edit student information</div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Field Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Field Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Field Performance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today's attendance by field</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {stats.fieldStats.map((field) => (
                <div key={field.fieldId} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {field.fieldName}
                    </span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      field.attendanceRate >= 95 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      field.attendanceRate >= 90 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      field.attendanceRate >= 85 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {field.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        field.attendanceRate >= 95 ? 'bg-green-500' :
                        field.attendanceRate >= 90 ? 'bg-blue-500' :
                        field.attendanceRate >= 85 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${field.attendanceRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Present: {field.presentToday}</span>
                    <span>Absent: {field.absentToday}</span>
                    <span>Total: {field.totalStudents}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Absentee Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fields Requiring Attention</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Highest absentee rates today</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topAbsenteeFields.map((field, index) => (
                <div key={field.fieldName} className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-red-500 text-white' :
                    index === 1 ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {field.fieldName}
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        {field.absenteeRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {field.absenteeCount} of {field.totalStudents} students absent
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Detailed Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}