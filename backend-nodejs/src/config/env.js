require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vidhilikhit_matrimonial',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/vidhilikhit_matrimonial_test',
    options: {
      retryWrites: true,
      w: 'majority'
    }
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expire: process.env.JWT_EXPIRE || '24h',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  
  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'vidhilikhit-matrimonial-prod'
  },
  
  // Email (SMTP)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  },
  
  // Application
  app: {
    name: process.env.APP_NAME || 'VidhiLikhit Matrimonial',
    version: process.env.APP_VERSION || '2.0.0',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  
  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',') 
      : ['http://localhost:5173', 'http://localhost:3000']
  },
  
  // Admin
  admin: {
    username: process.env.ADMIN_USERNAME || 'vasudev',
    email: process.env.ADMIN_EMAIL || 'vasudev@vidhilikhit.com',
    password: process.env.ADMIN_PASSWORD || 'Vasudev@123'
  },
  
  // File upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',') 
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  }
};
