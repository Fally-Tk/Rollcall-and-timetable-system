# Rollcall & Timetable Management System

A comprehensive Progressive Web Application (PWA) for university discipline masters to manage student attendance, timetables, and generate reports.

## Features

### 🎯 Core Functionality
- **Real-time Rollcall Management**: Take attendance for current sessions with automatic session removal after completion
- **Smart Timetable Management**: Create and manage weekly schedules with conflict detection
- **Student Management**: Complete CRUD operations for student records with import/export capabilities
- **Field Management**: Manage academic fields and departments with full CRUD operations
- **Comprehensive Reporting**: Generate detailed absentee reports with parent contact integration

### 📊 Analytics & Insights
- **Interactive Dashboard**: Visual charts showing field performance and attendance trends
- **Absentee Hours Tracking**: Monitor student absence patterns grouped by field
- **Performance Metrics**: Real-time statistics and attendance rates
- **Alert System**: Identify fields requiring immediate attention

### 🔄 Synchronization & Offline Support
- **Automatic Sync**: Background synchronization when online
- **Offline Functionality**: Continue working without internet connection
- **Queue Management**: Pending records sync automatically when connection is restored
- **Manual Sync**: Force synchronization with real-time status updates

### 📱 Progressive Web App Features
- **One-Click Installation**: Direct installation to desktop/mobile home screen
- **Responsive Design**: Optimized for all device sizes
- **Dark/Light Mode**: Attractive theme switching with improved readability
- **Offline Caching**: Essential data cached for offline access

## Installation & Deployment

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd rollcall-timetable-pwa

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### PWA Installation
The app can be installed directly from the browser:

1. **Chrome/Edge**: Click the install icon in the address bar or use the in-app install prompt
2. **Firefox**: Menu → "Install this site as an app"
3. **Safari**: Share button → "Add to Home Screen"
4. **Mobile**: Use the install prompt that appears after a few seconds

## Backend Integration

### API Endpoints
The application is designed to connect to a PHP backend with the following endpoints:

#### Session Management
- `GET /api/get_current_sessions.php` - Fetch active sessions
- `POST /api/submit_attendance.php` - Submit attendance records

#### Student Management
- `GET /api/get_students.php` - Fetch all students
- `POST /api/add_student.php` - Add new student
- `POST /api/update_student.php` - Update student information
- `POST /api/delete_student.php` - Delete student

#### Field Management
- `GET /api/get_fields.php` - Fetch all fields
- `POST /api/add_field.php` - Add new field
- `POST /api/update_field.php` - Update field information
- `POST /api/delete_field.php` - Delete field

#### Timetable Management
- `GET /api/get_timetable.php` - Fetch timetable entries
- `POST /api/add_timetable_entry.php` - Add timetable entry
- `POST /api/update_timetable_entry.php` - Update timetable entry
- `POST /api/delete_timetable_entry.php` - Delete timetable entry

#### Reports & Analytics
- `GET /api/get_dashboard_stats.php` - Dashboard statistics
- `GET /api/get_absentee_report.php` - Absentee reports with filters

### Database Schema
The application expects a MySQL database with the following tables:
- `fields` - Academic fields/departments
- `students` - Student information and parent contacts
- `courses` - Course information
- `timetable` - Weekly schedule entries
- `sessions` - Active rollcall sessions
- `attendance` - Attendance records
- `admin_users` - System administrators

## Synchronization System

### How It Works
1. **Online Mode**: All operations sync immediately with the backend
2. **Offline Mode**: Data is stored locally and queued for synchronization
3. **Background Sync**: Automatic sync attempts every 2 minutes when online
4. **Manual Sync**: Users can force synchronization via the settings page
5. **Conflict Resolution**: Last-write-wins strategy for data conflicts

### Sync Status Indicators
- **Green**: All data synchronized
- **Yellow**: Sync in progress
- **Red**: Pending records waiting for sync
- **Gray**: Offline mode

### Data Persistence
- **LocalStorage**: User preferences and cache
- **IndexedDB**: Attendance queue and offline data
- **Service Worker**: Background sync and caching

## Key Features Explained

### Automatic Session Removal
After completing attendance for a session, it's automatically removed from the current sessions list, preventing duplicate entries and ensuring data integrity.

### Absentee Management
- **Grouped Display**: Absentees are grouped by field and course for better organization
- **Detailed View**: Click "View Student Info" to see individual student details and parent contacts
- **Communication Tools**: Direct calling and SMS functionality for parent contact

### Smart Filtering
- **Popup Filters**: Clean, accessible filter interfaces on all pages
- **Real-time Search**: Instant filtering as you type
- **Persistent State**: Filter preferences maintained across sessions

### Enhanced Dark Mode
- **Improved Contrast**: Better text readability in dark mode
- **Consistent Theming**: Unified color scheme across all components
- **Accessibility**: WCAG compliant color combinations

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Charts**: Chart.js with React integration
- **PWA**: Vite PWA plugin with Workbox
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Backend**: PHP with MySQL (separate repository)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with PWA support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or feature requests, please open an issue in the repository or contact the development team.