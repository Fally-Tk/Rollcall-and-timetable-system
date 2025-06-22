import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Users, MapPin, Phone, MessageCircle, Filter } from 'lucide-react';
import { APIService } from '../utils/api';
import { LocalDBService } from '../utils/localdb';
import { SyncService } from '../utils/sync';
import type { Session, Student, AttendanceRecord, AbsenteeRecord } from '../types';

// Demo data for fallback
const getDemoSessionData = (): Session[] => {
  const now = new Date();
  const currentHour = now.getHours();
  
  return [
    {
      id: 'session-1',
      courseTitle: 'Database Systems',
      courseCode: 'CS201',
      fieldName: 'Computer Science',
      level: 'Level 200',
      room: 'Lab 101',
      startTime: `${currentHour}:00`,
      endTime: `${currentHour + 2}:00`,
      day: 'Monday',
      lecturer: 'Dr. Smith',
      students: [
        {
          id: 'student-1',
          name: 'Alice Johnson',
          matricule: 'CS200/001',
          field: 'Computer Science',
          level: 'Level 200',
          parentPhone: '+1234567890',
          parentName: 'John Johnson',
          parentEmail: 'john.johnson@email.com',
          photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        },
        {
          id: 'student-2',
          name: 'Bob Smith',
          matricule: 'CS200/002',
          field: 'Computer Science',
          level: 'Level 200',
          parentPhone: '+1234567891',
          parentName: 'Mary Smith',
          parentEmail: 'mary.smith@email.com',
          photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        },
        {
          id: 'student-3',
          name: 'Carol Davis',
          matricule: 'CS200/003',
          field: 'Computer Science',
          level: 'Level 200',
          parentPhone: '+1234567892',
          parentName: 'Robert Davis',
          parentEmail: 'robert.davis@email.com',
          photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        }
      ]
    },
    {
      id: 'session-2',
      courseTitle: 'Software Engineering Principles',
      courseCode: 'SE201',
      fieldName: 'Software Engineering',
      level: 'Level 200',
      room: 'Room 205',
      startTime: `${currentHour}:00`,
      endTime: `${currentHour + 2}:00`,
      day: 'Monday',
      lecturer: 'Prof. Wilson',
      students: [
        {
          id: 'student-4',
          name: 'David Wilson',
          matricule: 'SE200/001',
          field: 'Software Engineering',
          level: 'Level 200',
          parentPhone: '+1234567893',
          parentName: 'Linda Wilson',
          parentEmail: 'linda.wilson@email.com',
          photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        },
        {
          id: 'student-5',
          name: 'Emma Brown',
          matricule: 'SE200/002',
          field: 'Software Engineering',
          level: 'Level 200',
          parentPhone: '+1234567894',
          parentName: 'Michael Brown',
          parentEmail: 'michael.brown@email.com',
          photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        }
      ]
    },
    // Common course example - same course for multiple fields
    {
      id: 'session-3',
      courseTitle: 'Mathematics for Engineers',
      courseCode: 'MATH101',
      fieldName: 'Computer Science,Software Engineering', // Combined fields
      level: 'Level 100',
      room: 'Amphitheater A',
      startTime: `${currentHour}:00`,
      endTime: `${currentHour + 2}:00`,
      day: 'Monday',
      lecturer: 'Prof. Mathematics',
      students: [
        {
          id: 'student-6',
          name: 'Frank Miller',
          matricule: 'CS100/001',
          field: 'Computer Science',
          level: 'Level 100',
          parentPhone: '+1234567895',
          parentName: 'Susan Miller',
          parentEmail: 'susan.miller@email.com',
          photo: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        },
        {
          id: 'student-7',
          name: 'Grace Lee',
          matricule: 'SE100/001',
          field: 'Software Engineering',
          level: 'Level 100',
          parentPhone: '+1234567896',
          parentName: 'James Lee',
          parentEmail: 'james.lee@email.com',
          photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          isPresent: undefined
        }
      ]
    }
  ];
};

export default function Rollcall() {
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [absentees, setAbsentees] = useState<AbsenteeRecord[]>([]);
  const [showAbsentees, setShowAbsentees] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string>('');

  useEffect(() => {
    loadAvailableSessions();
  }, []);

  const loadAvailableSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let sessionData;
      try {
        sessionData = await APIService.getCurrentSessions();
      } catch (apiError) {
        sessionData = LocalDBService.getCachedData('rollcall_cached_sessions');
        
        if (!sessionData || sessionData.length === 0) {
          console.log('Using demo data as fallback');
          sessionData = getDemoSessionData();
        }
      }

      setAvailableSessions(sessionData || []);
      
      // Cache the session data
      LocalDBService.cacheData('rollcall_cached_sessions', sessionData);

    } catch (error) {
      console.error('Failed to load available sessions:', error);
      setError('Failed to load available sessions. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setStudents(session.students.map(student => ({ ...student, isPresent: undefined })));
    setShowAbsentees(false);
    setAbsentees([]);
  };

  const handleToggleStudentPresence = (studentId: string, isPresent: boolean) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, isPresent }
        : student
    ));
  };

  const generateSMSMessage = (studentName: string, parentName: string, fieldName: string, courseTitle: string, timeSlot: string) => {
    return `Hello ${parentName},

Greetings from IME Business and Engineering School.

We would like to inform you that your child ${studentName} from ${fieldName} was absent from ${courseTitle} class today at ${timeSlot}.

Please ensure regular attendance for better academic performance.

Best regards,
IME Discipline Master`;
  };

  const handleSubmitAttendance = async () => {
    if (!selectedSession) return;

    const attendanceRecords = students
      .filter(student => student.isPresent !== undefined)
      .map(student => ({
        sessionId: selectedSession.id,
        studentId: student.id,
        isPresent: student.isPresent!,
        timestamp: new Date().toISOString(),
        synced: false,
      }));

    if (attendanceRecords.length === 0) {
      setError('Please mark attendance for at least one student.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Try to submit directly to API first
      if (navigator.onLine) {
        try {
          for (const record of attendanceRecords) {
            await APIService.submitAttendance({
              session_id: record.sessionId,
              student_id: record.studentId,
              is_present: record.isPresent,
              timestamp: record.timestamp,
            });
          }
          setSuccessMessage('Attendance submitted successfully!');
        } catch (apiError) {
          attendanceRecords.forEach(record => {
            LocalDBService.saveAttendanceToQueue(record);
          });
          setSuccessMessage('Attendance saved offline. Will sync when connection is restored.');
        }
      } else {
        attendanceRecords.forEach(record => {
          LocalDBService.saveAttendanceToQueue(record);
        });
        setSuccessMessage('Attendance saved offline. Will sync when connection is restored.');
      }

      // Generate absentee list
      const absentStudents = students.filter(student => student.isPresent === false);
      const absenteeRecords: AbsenteeRecord[] = absentStudents.map(student => ({
        id: `${selectedSession.id}-${student.id}`,
        studentName: student.name,
        matricule: student.matricule,
        fieldName: student.field,
        level: student.level,
        courseTitle: selectedSession.courseTitle,
        courseCode: selectedSession.courseCode,
        parentPhone: student.parentPhone,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        date: new Date().toISOString(),
        sessionId: selectedSession.id,
      }));

      setAbsentees(absenteeRecords);
      setShowAbsentees(true);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Failed to submit attendance:', error);
      setError('Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallParent = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber).catch(console.error);
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSendSMS = (phoneNumber: string, studentName: string, parentName: string, fieldName: string) => {
    if (!selectedSession) return;
    
    const message = generateSMSMessage(
      studentName, 
      parentName, 
      fieldName, 
      selectedSession.courseTitle, 
      `${selectedSession.startTime} - ${selectedSession.endTime}`
    );
    
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `sms:${phoneNumber}?body=${encodedMessage}`;
  };

  // Get unique fields from available sessions
  const getAvailableFields = () => {
    const fields = [...new Set(availableSessions.flatMap(session => 
      session.fieldName.includes(',') 
        ? session.fieldName.split(',').map(f => f.trim())
        : [session.fieldName]
    ))];
    return fields;
  };

  // Filter sessions by selected field
  const getFilteredSessions = () => {
    if (!selectedField) return availableSessions;
    return availableSessions.filter(session => 
      session.fieldName.includes(selectedField)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading available sessions...</p>
        </div>
      </div>
    );
  }

  if (error && availableSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Sessions
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <button
          onClick={loadAvailableSessions}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show absentee list after attendance submission
  if (showAbsentees && absentees.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Absentee List - {selectedSession?.courseTitle}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {absentees.length} students absent from {selectedSession?.fieldName} - {selectedSession?.level}
            </p>
          </div>
          <button
            onClick={() => setShowAbsentees(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Sessions
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Field & Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Parent Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {absentees.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.studentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.matricule}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.fieldName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {record.level}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.parentName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {record.parentPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleCallParent(record.parentPhone)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="Call Parent"
                        >
                          <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleSendSMS(record.parentPhone, record.studentName, record.parentName, record.fieldName)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                          title="Send SMS"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const markedCount = students.filter(s => s.isPresent !== undefined).length;
  const presentCount = students.filter(s => s.isPresent === true).length;
  const absentCount = students.filter(s => s.isPresent === false).length;
  const filteredSessions = getFilteredSessions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rollcall Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Select a session to take attendance
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Field Filter */}
      {!selectedSession && availableSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Field:
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Fields</option>
              {getAvailableFields().map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
            {selectedField && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredSessions.length} sessions for {selectedField}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Available Sessions */}
      {!selectedSession && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Current Sessions ({filteredSessions.length})
          </h3>
          {filteredSessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {selectedField 
                  ? `No active sessions for ${selectedField} at this time.`
                  : 'No active sessions at this time.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {session.courseTitle}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.courseCode}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                      Active
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{session.fieldName} - {session.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{session.room}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {session.students.length} students
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Take Attendance →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Session Attendance */}
      {selectedSession && (
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedSession.courseTitle} ({selectedSession.courseCode})
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedSession.fieldName} - {selectedSession.level} • {selectedSession.room}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                ← Back to Sessions
              </button>
            </div>

            {/* Attendance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {students.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {presentCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Present</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {absentCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Absent</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {students.length - markedCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Unmarked</div>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Mark Attendance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => (
                <div key={student.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={student.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {student.matricule}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {student.field}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleStudentPresence(student.id, true)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        student.isPresent === true
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleToggleStudentPresence(student.id, false)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        student.isPresent === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmitAttendance}
              disabled={submitting || markedCount === 0}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              <span>
                {submitting 
                  ? 'Submitting...' 
                  : `Submit Attendance (${markedCount}/${students.length})`
                }
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}