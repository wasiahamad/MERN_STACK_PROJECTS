# Video Conferencing Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) video conferencing application with real-time communication powered by WebRTC and Socket.IO.

## 🌐 Live Demo

**[View Live Application](https://mern-stack-projects-1-ubii.onrender.com)**

## 🚀 Features

### Backend Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Meeting Management**: Create, update, and delete video meetings
- **Real-time Communication**: WebRTC signaling and Socket.IO integration
- **Meeting Controls**:
  - Lock/unlock meetings for security
  - Assign co-hosts for meeting management
  - Participant role management (host, co-host, participant)
- **Profile Management**: Update user profile and avatar
- **Meeting Scheduling**: Schedule meetings with specific date and duration
- **Unique Meeting Codes**: Auto-generated secure meeting codes

### Frontend Features
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Shadcn/UI Components**: Professional and accessible UI components
- **Video Grid**: Dynamic participant video layout
- **Meeting Chat**: Real-time text messaging during meetings
- **Meeting Controls**: Mute/unmute, video on/off, screen sharing
- **Responsive Design**: Works on desktop and mobile devices

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user and get JWT token | No |
| GET | `/me` | Get current user profile | Yes |
| PATCH | `/me` | Update current user profile | Yes |

### Meeting Routes (`/api/meetings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all meetings for current user | Yes |
| POST | `/` | Create a new meeting | Yes |
| GET | `/code/:meetingCode` | Get meeting by meeting code | Yes |
| GET | `/:id` | Get meeting by ID | Yes |
| PATCH | `/:id` | Update meeting details | Yes |
| DELETE | `/:id` | Delete a meeting | Yes |
| POST | `/:id/lock` | Lock a meeting (prevent new joins) | Yes |
| POST | `/:id/unlock` | Unlock a meeting | Yes |
| POST | `/:id/assign-cohost` | Assign co-host to a meeting | Yes |

## 🔄 Workflow

### User Registration & Login
1. User registers with username, email, and password
2. Password is hashed using bcrypt
3. JWT token is generated and returned
4. Token is stored in client for authentication

### Creating a Meeting
1. Authenticated user sends meeting details (title, date, duration)
2. Server generates a unique meeting code
3. Meeting is saved to MongoDB with host information
4. Meeting link is returned to user

### Joining a Meeting
1. User navigates to meeting page with meeting code
2. Frontend establishes Socket.IO connection
3. WebRTC peer connections are established
4. User's video/audio streams are shared with other participants
5. Real-time signaling handled via Socket.IO

### Meeting Controls
1. Host/co-host can lock meeting to prevent new participants
2. Host can assign co-hosts for better meeting management
3. Participants can toggle video/audio, share screen
4. Real-time chat for text communication

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm

### Clone the Repository
```bash
git clone https://github.com/wasiahamad/MERN_STACK_PROJECTS
cd Video_Conferencing
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
.env
```

Add the following environment variables to `.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
touch .env
```

Add the following environment variable to `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

```bash
# Start the frontend development server
npm run dev
```

### Access the Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **React Query** - Data fetching
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Video/audio streaming

## 📁 Project Structure

```
Video_Conferencing/
├── backend/
│   ├── config/
│   │   └── Db.js                  # Database configuration
│   ├── controller/
│   │   ├── Meeting.controller.js  # Meeting logic
│   │   ├── User.controller.js     # User logic
│   │   └── SonnetManager.js       # Socket.IO manager
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── model/
│   │   ├── Meeting.model.js       # Meeting schema
│   │   └── User.model.js          # User schema
│   ├── routes/
│   │   ├── Meeting.route.js       # Meeting routes
│   │   └── User.route.js          # User routes
│   ├── index.js                   # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── MeetingChat.tsx
    │   │   ├── MeetingControls.tsx
    │   │   ├── MeetingParticipants.tsx
    │   │   ├── VideoGrid.tsx
    │   │   └── ui/               # Shadcn/UI components
    │   ├── hooks/
    │   │   ├── use-auth.ts
    │   │   ├── use-meetings.ts
    │   │   └── use-webrtc.ts
    │   ├── pages/
    │   │   ├── Auth.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Home.tsx
    │   │   └── Meeting.tsx
    │   ├── lib/
    │   │   ├── queryClient.ts
    │   │   └── utils.ts
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Md Wasi Ahmad**

## 🐛 Known Issues

- None at the moment

## 📞 Support

For support, email mdwwasia98@gmail.com or open an issue on GitHub.
