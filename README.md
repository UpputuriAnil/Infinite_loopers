# Infinite Loopers

A modern Learning Management System for educators and students.

##  Quick Setup

### 1. Clone
```bash
git clone https://github.com/UpputuriAnil/Infinite_loopers.git
cd infinite-loopers-main
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
Create `.env` files:

**Backend** (`mybackend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/infinite-loopers
JWT_SECRET=your-jwt-secret
PORT=3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3000
```

### 4. Run Applications
Open two terminals:

```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

## 🌐 Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api

## 📁 Project Structure
```
├── frontend/     # React.js application
├── mybackend/    # Node.js API server
└── package.json  # Root scripts
```

## Tech Stack
- **Frontend**: React.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: JWT

## Languages & Frameworks

### Frontend
- **Language**: JavaScript (ES6+)
- **Framework**: React.js 19
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: CSS3 with animations

### Backend
- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Validation**: Express Validator

### Development Tools
- **Package Manager**: npm
- **Environment**: dotenv
- **Security**: bcryptjs, CORS
- **Development**: nodemon

---

*Built for modern education*
