# How to Run Backend and Frontend

## Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB running)
- All dependencies installed (`npm install` in both folders)

## Step 1: Install Dependencies (if not done)

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Start Backend Server

Open a terminal and run:
```bash
cd backend
npm start
```

The backend should start on **http://localhost:5001**

You should see:
- `MongoDB Connected: ...`
- `Server running on port 5001`

## Step 3: Start Frontend Server

Open a **NEW** terminal (keep backend running) and run:
```bash
cd frontend
npm run dev
```

The frontend should start on **http://localhost:8080**

## Troubleshooting

### Backend won't start
1. Check if MongoDB connection string is correct in `backend/.env`
2. Make sure `MONGO_URI` and `JWT_SECRET` are set
3. Check if port 5001 is already in use

### Frontend can't connect to backend
1. Make sure backend is running first
2. Check `frontend/.env` has `VITE_API_URL=http://localhost:5001/api`
3. Restart frontend after changing .env file

### MongoDB Connection Error
- If using MongoDB Atlas, make sure:
  - Your IP is whitelisted in Atlas
  - Database name is included in connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
  - Password doesn't have special characters (or they're URL encoded)

## Quick Start (Both Servers)

### Windows PowerShell (2 terminals)
**Terminal 1:**
```powershell
cd backend; npm start
```

**Terminal 2:**
```powershell
cd frontend; npm run dev
```

### Windows CMD (2 terminals)
**Terminal 1:**
```cmd
cd backend && npm start
```

**Terminal 2:**
```cmd
cd frontend && npm run dev
```

## Ports
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:8080
- **API Base URL**: http://localhost:5001/api

