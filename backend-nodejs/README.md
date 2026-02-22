# VidhiLikhit Matrimonial - Node.js Backend

Modern matrimonial platform backend built with Node.js, Express, MongoDB, and AWS S3.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- AWS Account (for S3)
- Gmail account (for SMTP)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# - MongoDB URI
# - AWS credentials
# - SMTP credentials
# - JWT secret
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8000`

## 📦 Environment Variables

Create a `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/vidhilikhit_matrimonial

# JWT
JWT_SECRET=your-32-char-secret-key
JWT_EXPIRE=24h

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name

# Email (Gmail SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/refresh-token` - Refresh access token

### Profiles (Coming Soon)
- `POST /api/profiles` - Create profile
- `GET /api/profiles/my-profile` - Get own profile
- `PUT /api/profiles/:id` - Update profile
- `GET /api/profiles/public` - Browse public profiles

### Admin (Coming Soon)
- `GET /api/admin/profiles` - List all profiles
- `PUT /api/admin/profiles/:id/publish` - Publish profile
- `GET /api/admin/payments` - Payment requests
- `POST /api/admin/subscriptions/generate-token` - Generate access token

## 🏗️ Project Structure

```
backend-nodejs/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── controllers/     # Route controllers
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic services
│   └── app.js           # Express app
├── package.json
└── .env
```

## 🔐 Admin Account

Default admin credentials (change in production):
- Username: `vasudev`
- Email: `vasudev@vidhilikhit.com`
- Password: `Vasudev@123`

## 📝 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🔧 Development

```bash
# Run with nodemon (auto-reload)
npm run dev

# Run linter
npm run lint
```

## 🚢 Deployment

1. Set up MongoDB (MongoDB Atlas recommended)
2. Configure AWS S3 bucket
3. Set environment variables
4. Deploy to your hosting platform (Heroku, AWS, DigitalOcean, etc.)

```bash
# Build and start
npm start
```

## 📄 License

MIT
