# Render Production & Local Deployment Guide — CloudVault Drive

A complete step-by-step production deployment manual for hosting **CloudVault Drive** on **Render.com** (and local environments).

---

## 1. Environment Variable Reference (`.env`)

All sensitive environment variables use strictly driven fallbacks `process.env.VARIABLE || ''`. Zero credentials or passwords are hardcoded in source files.

Create a `.env` file in the root directory (or set environment variables on your Render dashboard):

```env
# Server & Port Settings
PORT=5050
NODE_ENV=production
CLIENT_URL=https://your-cloudvault-frontend.onrender.com

# Database Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster_name>.mongodb.net/cloud_file_manager?retryWrites=true&w=majority

# Cloudinary Media Storage Credentials
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# JWT Secrets (Generate high-entropy random strings)
JWT_SECRET=your_jwt_secret_min_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_characters

# Passwords (Supports Plaintext OR Bcrypt Hashes)
NORMAL_USER_PASSWORD=your_normal_user_password
NORMAL_USER_PASSWORD_HASH=$2a$10$your_generated_bcrypt_hash_for_normal_user

ADMIN_PASSWORD=your_admin_password
ADMIN_PASSWORD_HASH=$2a$10$your_generated_bcrypt_hash_for_admin_user

# Storage & Upload Limits
MAX_FILE_SIZE_MB=100
TOTAL_STORAGE_LIMIT_GB=100
```

---

## 2. Generating Password Hashes

To generate a secure bcrypt password hash for your `.env` variables:

```bash
cd backend
npm run hash "YourDesiredPassword"
```

Copy the printed hash into `NORMAL_USER_PASSWORD_HASH` or `ADMIN_PASSWORD_HASH`.

---

## 3. Step-by-Step Render.com Production Deployment

### Step 3.1: Prepare External Cloud Services

1. **MongoDB Atlas (Database)**:
   - Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Go to **Database Access** -> Add new database user (e.g. `cloudvault_user`).
   - Go to **Network Access** -> Click **Add IP Address** -> Select **Allow Access From Anywhere (`0.0.0.0/0`)** (Required for Render dynamic IPs).
   - Get connection string (`mongodb+srv://...`) and replace `<db_user>` and `<db_password>`.

2. **Cloudinary (File Storage)**:
   - Sign up at [Cloudinary](https://cloudinary.com/).
   - From your Dashboard, copy **Cloud Name**, **API Key**, and **API Secret**.

---

### Step 3.2: Deploy Backend Web Service on Render

1. Log into [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure Backend Web Service options:
   - **Name**: `cloudvault-backend`
   - **Region**: Choose closest to your users (e.g. Oregon/Frankfurt/Singapore).
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Expand **Environment Variables** section and add:

| Key | Example / Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (or leave default assigned by Render) |
| `CLIENT_URL` | `https://cloudvault-frontend.onrender.com` (Your frontend URL) |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/cloud_file_manager` |
| `CLOUD_NAME` | `your_cloudinary_cloud_name` |
| `CLOUD_API_KEY` | `your_cloudinary_api_key` |
| `CLOUD_API_SECRET` | `your_cloudinary_api_secret` |
| `JWT_SECRET` | `super_secret_jwt_key_string_32chars` |
| `NORMAL_USER_PASSWORD` | `your_normal_user_password` (or use `NORMAL_USER_PASSWORD_HASH`) |
| `ADMIN_PASSWORD` | `your_admin_password` (or use `ADMIN_PASSWORD_HASH`) |

5. Click **Create Web Service**.
6. Render will build and deploy your backend. Note down your Backend URL (e.g., `https://cloudvault-backend.onrender.com`).
7. Test the health endpoint: `https://cloudvault-backend.onrender.com/api/health`.

---

### Step 3.3: Deploy Frontend Static Site on Render

1. On Render Dashboard, click **New +** -> **Static Site**.
2. Connect your Git repository.
3. Configure Frontend Static Site options:
   - **Name**: `cloudvault-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL` = `https://cloudvault-backend.onrender.com/api`
5. Configure **Redirects / Rewrites** (Essential for Single-Page React App Routing):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 4. Local Development Setup

### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Local `.env`
Create `.env` in root directory:
```bash
cp .env.example .env
```
Fill in your local passwords, Cloudinary keys, and MongoDB Atlas URI.

### Step 3: Start Local Servers
```bash
# Terminal 1: Backend API (Port 5050)
cd backend
npm run dev

# Terminal 2: Frontend Vite (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173`.

---

## 5. Verification & Health Check

After deployment, verify that all backend services and cloud links are active:

```bash
curl https://cloudvault-backend.onrender.com/api/health
```

Expected JSON output:
```json
{
  "success": true,
  "server": "ok",
  "database": "connected",
  "cloudinary": "configured",
  "environment": "production"
}
```
