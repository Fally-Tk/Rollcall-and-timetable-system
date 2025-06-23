import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, AlertTriangle, TrendingUp, Calendar, ClipboardList, FileText, ArrowRight } from 'lucide-react';
import { APIService } from '../utils/api';
import { LocalDBService } from '../utils/localdb';
import type { DashboardStats, FieldStats, TopAbsenteeField } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

      const dashboardData = await APIService.getDashboardStats();
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

  // Chart data for field performance
  const fieldPerformanceData = {
    labels: stats.fieldStats.map(field => field.fieldName),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: stats.fieldStats.map(field => field.attendanceRate),
        backgroundColor: stats.fieldStats.map(field => 
          field.attendanceRate >= 95 ? '#10B981' :
          field.attendanceRate >= 90 ? '#3B82F6' :
          field.attendanceRate >= 85 ? '#F59E0B' : '#EF4444'
        ),
        borderColor: stats.fieldStats.map(field => 
          field.attendanceRate >= 95 ? '#059669' :
          field.attendanceRate >= 90 ? '#2563EB' :
          field.attendanceRate >= 85 ? '#D97706' : '#DC2626'
        ),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Field Performance - Attendance Rates',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  // Doughnut chart for overall attendance
  const attendanceOverviewData = {
    labels: ['Present Today', 'Absent Today'],
    datasets: [
      {
        data: [
          stats.fieldStats.reduce((sum, field) => sum + field.presentToday, 0),
          stats.todayAbsentees
        ],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Field Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <Bar data={fieldPerformanceData} options={chartOptions} />
        </div>

        {/* Attendance Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
            Today's Attendance Overview
          </h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <Doughnut 
                data={attendanceOverviewData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fields Requiring Attention */}
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
  );
}