const API_BASE_URL = '/api';

export class APIService {
  private static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 5000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async getCurrentSessions() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/get_current_sessions.php`);
      if (!response.ok) throw new Error('Failed to fetch current sessions');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - getCurrentSessions:', error);
      throw error;
    }
  }

  static async getTimetable() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/get_timetable.php`);
      if (!response.ok) throw new Error('Failed to fetch timetable');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - getTimetable:', error);
      throw error;
    }
  }

  static async submitAttendance(attendanceData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/submit_attendance.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      if (!response.ok) throw new Error('Failed to submit attendance');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - submitAttendance:', error);
      throw error;
    }
  }

  static async getAbsenteeReport(filters: any) {
    try {
      const params = new URLSearchParams(filters);
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/get_absentee_report.php?${params}`
      );
      if (!response.ok) throw new Error('Failed to fetch absentee report');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - getAbsenteeReport:', error);
      throw error;
    }
  }

  static async getDashboardStats() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/get_dashboard_stats.php`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - getDashboardStats:', error);
      throw error;
    }
  }

  static async getStudents() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/get_students.php`);
      if (!response.ok) throw new Error('Failed to fetch students');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - getStudents:', error);
      throw error;
    }
  }

  static async getFields() {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/get_fields.php`);
      if (!response.ok) throw new Error('Failed to fetch fields');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - getFields:', error);
      throw error;
    }
  }

  static async addStudent(studentData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/add_student.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to add student');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - addStudent:', error);
      throw error;
    }
  }

  static async updateStudent(studentData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/update_student.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to update student');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - updateStudent:', error);
      throw error;
    }
  }

  static async addField(fieldData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/add_field.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });
      if (!response.ok) throw new Error('Failed to add field');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - addField:', error);
      throw error;
    }
  }

  static async updateField(fieldData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/update_field.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });
      if (!response.ok) throw new Error('Failed to update field');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - updateField:', error);
      throw error;
    }
  }

  static async deleteField(fieldId: string) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/delete_field.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: fieldId }),
      });
      if (!response.ok) throw new Error('Failed to delete field');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - deleteField:', error);
      throw error;
    }
  }

  static async addTimetableEntry(entryData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/add_timetable_entry.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      if (!response.ok) throw new Error('Failed to add timetable entry');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - addTimetableEntry:', error);
      throw error;
    }
  }

  static async updateTimetableEntry(entryData: any) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/update_timetable_entry.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      if (!response.ok) throw new Error('Failed to update timetable entry');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - updateTimetableEntry:', error);
      throw error;
    }
  }

  static async deleteTimetableEntry(entryId: string) {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/delete_timetable_entry.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: entryId }),
      });
      if (!response.ok) throw new Error('Failed to delete timetable entry');
      
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Invalid JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API Error - deleteTimetableEntry:', error);
      throw error;
    }
  }
}