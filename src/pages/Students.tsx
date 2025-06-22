import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, Mail, User, BookOpen, Users, Edit, Plus, X, Save, Upload } from 'lucide-react';
import ImportStudentsModal from '../components/ImportStudentsModal';
import StudentAbsenteeHours from '../components/StudentAbsenteeHours';
import { APIService } from '../utils/api';
import { LocalDBService } from '../utils/localdb';
import type { Student, Field } from '../types';

// Demo data for fallback
const getDemoStudentsData = (): Student[] => [
  {
    id: '1',
    name: 'Alice Johnson',
    matricule: 'CS200/001',
    field: 'Computer Science',
    level: 'Level 200',
    parentPhone: '+1234567890',
    parentName: 'John Johnson',
    parentEmail: 'john.johnson@email.com',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Bob Smith',
    matricule: 'SE200/002',
    field: 'Software Engineering',
    level: 'Level 200',
    parentPhone: '+1234567891',
    parentName: 'Mary Smith',
    parentEmail: 'mary.smith@email.com',
    photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Carol Davis',
    matricule: 'IT100/003',
    field: 'Information Technology',
    level: 'Level 100',
    parentPhone: '+1234567892',
    parentName: 'Robert Davis',
    parentEmail: 'robert.davis@email.com',
    photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'David Wilson',
    matricule: 'CYB200/004',
    field: 'Cybersecurity',
    level: 'Level 200',
    parentPhone: '+1234567893',
    parentName: 'Linda Wilson',
    parentEmail: 'linda.wilson@email.com',
    photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '5',
    name: 'Emma Brown',
    matricule: 'DS100/005',
    field: 'Data Science',
    level: 'Level 100',
    parentPhone: '+1234567894',
    parentName: 'Michael Brown',
    parentEmail: 'michael.brown@email.com',
    photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

const getDemoFieldsData = (): Field[] => [
  { id: '1', name: 'Computer Science', code: 'CS', totalStudents: 320, levels: ['Level 100', 'Level 200'] },
  { id: '2', name: 'Software Engineering', code: 'SE', totalStudents: 280, levels: ['Level 100', 'Level 200'] },
  { id: '3', name: 'Information Technology', code: 'IT', totalStudents: 250, levels: ['Level 100', 'Level 200'] },
  { id: '4', name: 'Cybersecurity', code: 'CYB', totalStudents: 180, levels: ['Level 100', 'Level 200'] },
  { id: '5', name: 'Data Science', code: 'DS', totalStudents: 220, levels: ['Level 100', 'Level 200'] }
];

interface FilterState {
  field: string;
  level: string;
  search: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    field: '',
    level: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAbsenteeHours, setShowAbsenteeHours] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    matricule: '',
    field: '',
    level: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    photo: ''
  });

  useEffect(() => {
    loadStudentsData();
    loadFieldsData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, filters]);

  const loadStudentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      let studentsData;
      try {
        studentsData = await APIService.getStudents();
      } catch (apiError) {
        studentsData = LocalDBService.getCachedData('rollcall_cached_students');
        
        if (!studentsData || studentsData.length === 0) {
          console.log('Using demo students data as fallback');
          studentsData = getDemoStudentsData();
        }
      }

      setStudents(studentsData || []);
      LocalDBService.cacheData('rollcall_cached_students', studentsData);

    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students data.');
    } finally {
      setLoading(false);
    }
  };

  const loadFieldsData = async () => {
    try {
      let fieldsData;
      try {
        fieldsData = await APIService.getFields();
      } catch (apiError) {
        fieldsData = LocalDBService.getCachedData('rollcall_cached_fields');
        
        if (!fieldsData || fieldsData.length === 0) {
          console.log('Using demo fields data as fallback');
          fieldsData = getDemoFieldsData();
        }
      }

      setFields(fieldsData || []);
      LocalDBService.cacheData('rollcall_cached_fields', fieldsData);

    } catch (error) {
      console.error('Failed to load fields:', error);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (filters.field) {
      filtered = filtered.filter(student => student.field === filters.field);
    }

    if (filters.level) {
      filtered = filtered.filter(student => student.level === filters.level);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.matricule.toLowerCase().includes(searchTerm) ||
        student.parentName.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      field: '',
      level: '',
      search: '',
    });
  };

  const handleCallParent = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber).catch(console.error);
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailParent = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleAddStudent = () => {
    setShowAddForm(true);
    setEditingStudent(null);
    setFormData({
      name: '',
      matricule: '',
      field: '',
      level: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      photo: ''
    });
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowAddForm(true);
    setFormData({
      name: student.name,
      matricule: student.matricule,
      field: student.field,
      level: student.level,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      photo: student.photo || ''
    });
  };

  const handleSaveStudent = async () => {
    if (!formData.name || !formData.matricule || !formData.field || !formData.level || !formData.parentName || !formData.parentPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    const existingStudent = students.find(student => 
      student.matricule === formData.matricule && 
      student.id !== editingStudent?.id
    );

    if (existingStudent) {
      setError('A student with this matricule already exists.');
      return;
    }

    try {
      const studentData = {
        ...formData,
        id: editingStudent?.id || Date.now().toString()
      };

      if (editingStudent) {
        setStudents(prev => prev.map(student => 
          student.id === editingStudent.id ? studentData : student
        ));
      } else {
        setStudents(prev => [...prev, studentData]);
      }

      try {
        if (editingStudent) {
          await APIService.updateStudent(studentData);
        } else {
          await APIService.addStudent(studentData);
        }
      } catch (apiError) {
        console.log('API save failed, data saved locally');
      }

      setShowAddForm(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        matricule: '',
        field: '',
        level: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        photo: ''
      });
      setError(null);

    } catch (error) {
      console.error('Failed to save student:', error);
      setError('Failed to save student data.');
    }
  };

  const handleImportStudents = (importedStudents: any[]) => {
    setStudents(prev => [...prev, ...importedStudents]);
    setShowImportModal(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      matricule: '',
      field: '',
      level: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      photo: ''
    });
    setError(null);
  };

  const getFieldStats = () => {
    return fields.map(field => {
      const fieldStudents = students.filter(student => student.field === field.name);
      return {
        ...field,
        actualStudents: fieldStudents.length,
        levels: ['Level 100', 'Level 200'].map(level => ({
          name: level,
          count: fieldStudents.filter(student => student.level === level).length
        }))
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-black">Loading students...</p>
        </div>
      </div>
    );
  }

  if (showAbsenteeHours) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Student Absentee Hours</h1>
          <button
            onClick={() => setShowAbsenteeHours(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Students
          </button>
        </div>
        <StudentAbsenteeHours students={students} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Student Management
            </h1>
            <p className="text-blue-100 mt-1">
              Manage student information and parent contacts
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowAbsenteeHours(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Absentee Hours</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            
            <button 
              onClick={handleAddStudent}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Field Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFieldStats().map((field) => (
          <div key={field.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-black hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-black">
                  {field.name}
                </h3>
                <p className="text-sm text-black">
                  {field.code}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {field.actualStudents}
                </div>
                <div className="text-sm text-black">
                  students
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {field.levels.map((level) => (
                <div key={level.name} className="flex items-center justify-between text-sm">
                  <span className="text-black">{level.name}</span>
                  <span className="font-semibold text-black">{level.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Add/Edit Student Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-black">
          <h3 className="text-xl font-bold text-black mb-6">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Matricule *
              </label>
              <input
                type="text"
                value={formData.matricule}
                onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                placeholder="e.g., CS200/001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Field *
              </label>
              <select
                value={formData.field}
                onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value, level: '' }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
              >
                <option value="">Select Field</option>
                {fields.map(field => (
                  <option key={field.id} value={field.name}>{field.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                disabled={!formData.field}
              >
                <option value="">Select Level</option>
                <option value="Level 100">Level 100</option>
                <option value="Level 200">Level 200</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Parent Name *
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                placeholder="Enter parent name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Parent Phone *
              </label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Parent Email
              </label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, parentEmail: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                placeholder="parent@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Photo URL
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={handleSaveStudent}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              <span>Save Student</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 text-black bg-white border-2 border-black hover:bg-black hover:text-white rounded-lg transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-black">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
          <input
            type="text"
            placeholder="Search students by name, matricule, or parent name..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t-2 border-black pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Field
                </label>
                <select
                  value={filters.field}
                  onChange={(e) => handleFilterChange('field', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                >
                  <option value="">All Fields</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.name}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
                >
                  <option value="">All Levels</option>
                  <option value="Level 100">Level 100</option>
                  <option value="Level 200">Level 200</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-black bg-white border-2 border-black hover:bg-black hover:text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
              <span className="text-sm text-black">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-black hover:shadow-xl transition-shadow">
            <div className="flex items-start space-x-4">
              <img
                src={student.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      {student.name}
                    </h3>
                    <p className="text-sm text-black">
                      {student.matricule}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleEditStudent(student)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-black">
                    <BookOpen className="w-4 h-4" />
                    <span>{student.field}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-black">
                    <Users className="w-4 h-4" />
                    <span>{student.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="mt-6 pt-4 border-t-2 border-black">
              <h4 className="text-sm font-semibold text-black mb-3">
                Parent Contact
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-black" />
                  <span className="text-black font-medium">{student.parentName}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-black" />
                    <span className="text-black">{student.parentPhone}</span>
                  </div>
                  <button
                    onClick={() => handleCallParent(student.parentPhone)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Call Parent"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
                
                {student.parentEmail && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-black" />
                      <span className="text-black truncate">{student.parentEmail}</span>
                    </div>
                    <button
                      onClick={() => handleEmailParent(student.parentEmail!)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Email Parent"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-black mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">
            No students found
          </h3>
          <p className="text-black">
            {filters.search || filters.field || filters.level
              ? 'Try adjusting your search criteria or filters.'
              : 'No students have been added yet.'}
          </p>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportStudentsModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportStudents}
          availableFields={fields.map(f => f.name)}
        />
      )}
    </div>
  );
}