# Learning Management System - Frontend

A modern, responsive React.js frontend for a comprehensive Learning Management System (LMS) supporting both students and teachers.

## Features

### 🔐 Authentication & Authorization
- **User Registration**: Role-based signup (Student/Teacher)
- **Secure Login**: JWT token-based authentication
- **Protected Routes**: Role-specific access control
- **Session Management**: Persistent login with localStorage
- **Quick Login**: Demo mode with instant access buttons

### 👨‍🏫 Teacher Features
- **Course Management**: Create, edit, and manage unlimited courses
- **Assignment System**: Create assignments with due dates and point values
- **Submission Review**: View and grade student submissions
- **Grading System**: Provide detailed feedback and numerical grades
- **Student Tracking**: Monitor enrollment and student progress
- **File Management**: Upload and share course materials (PDFs, videos, etc.)
- **Discussion Forums**: Moderate course-specific discussions
- **Real-time Notifications**: Get notified of new submissions and activities

### 👨‍🎓 Student Features
- **Course Discovery**: Browse and enroll in available courses
- **Assignment Submission**: Submit work with file attachments
- **Grade Tracking**: View grades, feedback, and academic progress
- **Course Materials**: Access and download shared resources
- **Discussion Participation**: Engage in course forums and peer discussions
- **Progress Dashboard**: Track completion status and performance
- **Notification Center**: Stay updated on assignments, grades, and announcements

### 🎨 Advanced UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Interactive Animations**: Smooth transitions and hover effects
- **Loading States**: Beautiful spinners and skeleton screens
- **Real-time Updates**: Live notifications and status changes
- **Modern Design**: Clean, professional interface with gradient accents
- **Accessibility**: Screen reader friendly and keyboard navigation

### 🚀 Interactive Features
- **File Upload System**: Drag-and-drop file uploads with progress indicators
- **Discussion Forums**: Real-time messaging with likes and replies
- **Notification Center**: Sliding panel with categorized notifications
- **Search & Filter**: Advanced filtering for courses and assignments
- **Progress Tracking**: Visual progress bars and completion indicators
- **Quick Actions**: One-click enrollment, submission, and grading

## Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks and functional components
- **React Router v6** - Client-side routing with protected routes
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful, consistent icon library
- **CSS3** - Custom styling with CSS Grid, Flexbox, and animations
- **LocalStorage** - Client-side data persistence for demo mode

### Backend Ready
- **Node.js + Express.js** - RESTful API server
- **MongoDB + Mongoose** - Document database with ODM
- **JWT Authentication** - Secure token-based auth
- **File Upload Support** - Multer integration ready
- **CORS Enabled** - Cross-origin resource sharing configured

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
REACT_APP_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Login and Registration
│   ├── Dashboard/      # Main dashboard
│   ├── Courses/        # Course management
│   ├── Assignments/    # Assignment features
│   ├── Grades/         # Grade tracking
│   └── Layout/         # Navigation and layout
├── contexts/
│   └── AuthContext.js  # Authentication state
├── App.js              # Main app component
└── App.css             # Global styles
```

## Available Scripts

### `npm start`
Runs the app in development mode on [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner

## API Integration

The frontend connects to the backend API with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Courses**: `/api/courses/*`
- **Assignments**: `/api/assignments/*`
- **Grades**: `/api/grades/*`
- **Submissions**: `/api/submissions/*`

## User Roles

### Teacher
- Full course management
- Assignment creation and grading
- Student progress tracking
- Submission review

### Student
- Course enrollment
- Assignment submission
- Grade viewing
- Progress tracking

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Build the project
2. Upload the `build` folder
3. Configure environment variables
4. Set up redirects for SPA routing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
