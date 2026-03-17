# VidhiLikhit Matrimonial - React Frontend

Modern matrimonial platform frontend built with React 19, Vite, Redux Toolkit, React Router, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

## 📦 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Yup** - Validation
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 🎨 Design System

### Color Palette

**Primary (Indigo):**
- 50-900 scale from light to dark
- Main: `#6366f1`

**Secondary (Pink):**
- 50-900 scale
- Main: `#ec4899`

**Accent (Amber):**
- 50-900 scale
- Main: `#f59e0b`

### Dark Mode
Fully supported with Tailwind's `dark:` variant

### Components
- Modern card-based layouts
- Glassmorphism effects
- Smooth animations
- Responsive design

## 📁 Project Structure

```
frontend-react/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts
│   ├── components/      # Reusable components
│   │   ├── common/      # Buttons, Inputs, Cards, etc.
│   │   ├── auth/        # Auth-related components
│   │   └── profile/     # Profile components
│   ├── pages/           # Route pages
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profiles.jsx
│   │   └── NotFound.jsx
│   ├── redux/           # Redux store & slices
│   │   ├── store.js
│   │   └── slices/
│   │       └── authSlice.js
│   ├── routes/          # React Router setup
│   │   └── AppRouter.jsx
│   ├── services/        # API services
│   │   ├── api.js
│   │   └── authService.js
│   ├── styles/          # Global styles
│   │   └── index.css
│   └── main.jsx         # App entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔐 Authentication Flow

1. **Register** → Enter details → Verify OTP → Account created
2. **Login** → Get JWT token → Stored in localStorage
3. **Protected Routes** → Check token → Redirect if not authenticated
4. **Admin Routes** → Check admin flag → Redirect if not admin

## 🛠️ Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 🌐 Environment Variables

Create `.env` file in root:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📱 Pages

### Public Pages
- `/` - Home page with hero and features
- `/login` - User login
- `/register` - User registration + OTP verification

### Protected Pages (To be implemented)
- `/profiles` - Browse profiles
- `/my-profile` - View/edit own profile
- `/membership` - Subscription management
- `/unlock-profile` - Unlock profiles with token

### Admin Pages (To be implemented)
- `/admin/dashboard` - Analytics
- `/admin/profiles` - Manage all profiles
- `/admin/payments` - Payment requests
- `/admin/tokens` - Generate subscription tokens

## 🎯 Features

- ✅ Modern glassmorphism UI
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Authentication (login/register/OTP)
- ✅ Redux state management
- ✅ Protected routes
- ✅ Toast notifications
- ⏳ Profile management (coming soon)
- ⏳ Admin dashboard (coming soon)
- ⏳ Subscription flow (coming soon)

## 🚢 Deployment

```bash
# Build for production
npm run build

# Output will be in dist/ folder
# Deploy dist/ to any static hosting (Vercel, Netlify, etc.)
```

## 📄 License

MIT
