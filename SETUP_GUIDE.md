# Quick Setup Guide

## Prerequisites
✅ Node.js 18+ installed
✅ MongoDB installed and running
✅ AWS account with S3 bucket (for file uploads)
✅ Gmail account for SMTP (or other email service)

## Step 1: Backend Setup

```bash
# Navigate to backend directory
cd d:\vid\backend-nodejs

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# Edit .env with your MongoDB URI, AWS credentials, and SMTP settings

# Start the server
npm run dev
```

Backend will start on `http://localhost:8000`

## Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd d:\vid\frontend-react

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will start on `http://localhost:5173`

## Step 3: Test the Application

1. **Open browser** → `http://localhost:5173`
2. **Register** → Click "Get Started" → Fill form → Verify OTP (check console for OTP in development)
3. **Login** → Use your credentials
4. **Explore** → Navigate through the app

## Environment Configuration

### Backend `.env`
```env
PORT=8000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vidhilikhit_matrimonial

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=24h

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=vidhilikhit-matrimonial-prod

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Admin
ADMIN_USERNAME=vasudev
ADMIN_EMAIL=vasudev@vidhilikhit.com
ADMIN_PASSWORD=Vasudev@123
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api
```

## Default Admin Credentials
- Username: `vasudev`
- Email: `vasudev@vidhilikhit.com`
- Password: `Vasudev@123`

## Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or if using MongoDB service
net start MongoDB
```

### Port Already in Use
```bash
# Backend - change PORT in .env
PORT=8001

# Frontend - change port in vite.config.js
server: { port: 5174 }
```

### Gmail SMTP Not Working
1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password (not your Gmail password) in .env

## Development Tools

### View MongoDB Data
```bash
# Open MongoDB shell
mongosh

# Switch to database
use vidhilikhit_matrimonial

# View collections
show collections

# View users
db.users.find().pretty()
```

### API Testing
- Backend API docs will be available at: `http://localhost:8000/api/docs` (to be implemented)
- Use Postman or curl to test endpoints
- Health check: `http://localhost:8000/api/health`

## Next Steps

1. ✅ Backend is running with authentication
2. ✅ Frontend is running with login/register
3. 🔧 Implement remaining features:
   - Profile management
   - Admin dashboard
   - Subscription system
   - PDF generation
4. 🔧 Migrate data from old system
5. 🚀 Deploy to production

## File Structure Created

```
d:\vid\
├── backend-nodejs/          # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database, AWS, environment
│   │   ├── models/         # 7 MongoDB models
│   │   ├── controllers/    # Auth controller
│   │  ├── routes/          # Auth routes
│   │   ├── middleware/     # Auth, admin, upload, errors
│   │   ├── services/       # Email, tokens
│   │   └── app.js         # Express app
│   ├── package.json
│   └── .env.example
│
├── frontend-react/          # React/Vite frontend
│   ├── src/
│   │   ├── pages/          # Home, Login, Register, NotFound
│   │   ├── redux/          # Store + auth slice
│   │   ├── routes/         # React Router config
│   │   ├── services/       # API client, auth service
│   │   ├── styles/         # Tailwind CSS
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/                 # OLD Python/FastAPI (keep for reference)
└── frontend/                # OLD Next.js (keep for reference)
```

## Support

For issues or questions:
1. Check the README files in each directory
2. Review the migration_status.md for progress
3. Check implementation_plan.md for architecture details

Happy coding! 🚀
