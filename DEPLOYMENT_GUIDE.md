# Complete Run & Deployment Guide — Personal Cloud File Manager

A step-by-step production setup and deployment manual for **CloudVault Drive**.

---

## 1. System Requirements & Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas Cluster (recommended for cloud) or local MongoDB instance (v6.0+)
- **Cloudinary**: Free or paid Cloudinary account for media asset storage
- **Git**: For version control & deployment

---

## 2. Environment Variables (.env)

All configuration variables use strict `process.env.VARIABLE || ''` fallback patterns. Supports storing passwords in **plaintext** (`NORMAL_USER_PASSWORD`, `ADMIN_PASSWORD`) OR **bcrypt hashes** (`NORMAL_USER_PASSWORD_HASH`, `ADMIN_PASSWORD_HASH`).

Create a `.env` file in the root folder (`e:\project\file manager\.env`):

```env
# Server & Client Ports
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/cloud_file_manager

# Cloudinary Credentials (Supports CLOUD_NAME or CLOUDINARY_CLOUD_NAME)
CLOUD_NAME=djlwr1lp5
CLOUD_API_KEY=476423574255386
CLOUD_API_SECRET=m1oyEgHeTGbk3kT32eV8AxS3YAw

# JWT Authentication Secrets
JWT_SECRET=BansiAaru1510
JWT_REFRESH_SECRET=AaruBansi1510

# Passwords (Supports Plaintext OR Bcrypt Hashes)
NORMAL_USER_PASSWORD=ab2211
NORMAL_USER_PASSWORD_HASH=$2a$10$2YVy9r708/3Kxbn6HSO7sO2MOiLg22egCac1ey44SaovLcKYMVTte

ADMIN_PASSWORD=Bansi7874.,&1510
ADMIN_PASSWORD_HASH=$2a$10$1ElCsQ4akgLpwZQT3KnmC.Z2kHsqTayiVfpPktXHBmiRqZtJ3fzi.

# Limits
MAX_FILE_SIZE_MB=100
TOTAL_STORAGE_LIMIT_GB=100
```

---

## 3. How to Run Locally in Development Mode

### Step 1: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Run Development Servers
```bash
# Terminal 1: Run Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Run Frontend Vite Client (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 4. Building for Production

### Step 1: Compile Frontend Production Assets
```bash
cd frontend
npm run build
```

### Step 2: Run Integration Tests
```bash
cd backend
npm test
```
