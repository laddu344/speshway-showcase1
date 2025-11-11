# Backend-Frontend Connection Fix

## ✅ What Was Fixed

### 1. **CORS Configuration (Backend)**
- ✅ Updated CORS to explicitly allow frontend origins:
  - `http://localhost:8080` (Vite default)
  - `http://localhost:3000` (alternative)
  - `http://127.0.0.1:8080` and `http://127.0.0.1:3000`
- ✅ Enabled credentials support (`credentials: true`)
- ✅ Added proper HTTP methods (GET, POST, PUT, DELETE, OPTIONS, PATCH)
- ✅ Configured allowed headers (Content-Type, Authorization, etc.)
- ✅ Added preflight request handling

### 2. **Frontend API Configuration**
- ✅ Added `withCredentials: true` to match backend CORS settings
- ✅ Added request timeout (10 seconds)
- ✅ Improved error handling with better logging
- ✅ Created frontend `.env` file with `VITE_API_URL`

### 3. **Backend Improvements**
- ✅ Added health check endpoints (`/` and `/api/health`)
- ✅ Added `express.urlencoded` for form data support
- ✅ Better error handling

### 4. **Environment Files**
- ✅ Backend `.env` with all required variables
- ✅ Frontend `.env` with API URL configuration
- ✅ Generated secure JWT_SECRET

## 🚀 How to Test Connection

### Step 1: Start Backend
```powershell
cd backend
npm start
```

**Expected Output:**
```
MongoDB Connected: cluster0-shard-00-00.8odmk7l.mongodb.net
Server running on port 5001
```

### Step 2: Test Backend Health
Open browser or use curl:
```
http://localhost:5001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Backend API is healthy",
  "timestamp": "2024-...",
  "database": "connected"
}
```

### Step 3: Start Frontend
```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### Step 4: Test Connection from Frontend
1. Open browser console (F12)
2. Navigate to http://localhost:8080
3. Check console for any CORS or connection errors
4. Try accessing a page that makes API calls (like Contact or Portfolio)

## 🔍 Troubleshooting

### Backend Not Starting
1. **MongoDB Connection Error:**
   - Check `MONGO_URI` in `backend/.env`
   - Verify MongoDB Atlas IP whitelist includes your IP
   - Check if password has special characters (should be URL encoded)

2. **Port Already in Use:**
   - Change `PORT` in `backend/.env` to a different port (e.g., 5002)
   - Update `VITE_API_URL` in `frontend/.env` to match

3. **Missing Environment Variables:**
   - Ensure `backend/.env` has: `MONGO_URI`, `JWT_SECRET`, `PORT`
   - Ensure `frontend/.env` has: `VITE_API_URL`

### Frontend Can't Connect to Backend

1. **CORS Error:**
   - Check browser console for CORS errors
   - Verify backend is running
   - Check that frontend URL matches CORS allowed origins

2. **Network Error:**
   - Verify backend is running on correct port
   - Check `VITE_API_URL` in `frontend/.env` matches backend port
   - Try accessing `http://localhost:5001/api/health` directly in browser

3. **404 Errors:**
   - Verify API routes are correct
   - Check backend routes are properly registered

### Common Issues

**Issue:** "Network Error" in browser console
- **Solution:** Backend is not running. Start backend first.

**Issue:** CORS policy error
- **Solution:** Backend CORS is configured. Make sure backend is running and restart frontend.

**Issue:** "Cannot GET /api/..."
- **Solution:** Check route paths in backend. Routes should start with `/api/...`

**Issue:** 401 Unauthorized
- **Solution:** This is normal for protected routes. You need to login first.

## 📝 Current Configuration

### Backend
- **Port:** 5001
- **CORS Origins:** localhost:8080, localhost:3000
- **API Base:** `/api`
- **Health Check:** `http://localhost:5001/api/health`

### Frontend
- **Port:** 8080
- **API URL:** `http://localhost:5001/api`
- **Environment:** Development

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] MongoDB connects successfully
- [ ] Backend health check returns OK (`/api/health`)
- [ ] Frontend starts without errors
- [ ] Frontend can access backend API
- [ ] No CORS errors in browser console
- [ ] API calls work from frontend pages

## 🎯 Next Steps

1. Start both servers (backend first, then frontend)
2. Test the connection using the health check endpoint
3. Try logging in through the admin panel
4. Test API calls from different pages (Contact, Portfolio, etc.)

If you still have issues, check:
- Browser console for errors
- Backend terminal for error messages
- Network tab in browser DevTools to see request/response details

