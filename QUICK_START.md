# 🚀 Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Navigate to Frontend Directory
```bash
cd frontend
```

### 2️⃣ Install Dependencies (if not already done)
```bash
npm install
```

### 3️⃣ Start Development Server
```bash
npm run dev
```

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5173**

## 🔑 Demo Login Credentials

### Admin Access
- **Email**: `admin@garden.com`
- **Password**: `admin123`

### Worker Access
- **Email**: `worker@garden.com`
- **Password**: `worker123`

### Client Access (No Login Required)
- **URL**: `http://localhost:5173/client/test-token-123`

## 🎯 What to Test

### As Admin:
1. View dashboard with statistics and charts
2. Manage clients, workers, tasks
3. View invoices and inventory
4. Switch languages (English, Arabic, Bengali)

### As Worker:
1. View assigned tasks
2. Filter tasks by status
3. Upload before/after photos
4. Start and finish tasks

### As Client:
1. View task details
2. See before/after photos
3. Download invoice
4. Submit feedback with rating

## 🌍 Language Switching

Click the language selector in the top-right corner to switch between:
- 🇬🇧 English (LTR)
- 🇸🇦 Arabic (RTL)
- 🇧🇩 Bengali (LTR)

## 📱 Responsive Testing

Resize your browser to test:
- 📱 Mobile view (< 768px)
- 📱 Tablet view (768px - 1024px)
- 💻 Desktop view (> 1024px)

## 🔧 Troubleshooting

### Port Already in Use?
```bash
# Kill the process using port 5173
# Then restart the dev server
npm run dev
```

### Dependencies Issue?
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Build Errors?
```bash
# Check for syntax errors
npm run build
```

## 📚 More Information

- **Full Documentation**: See `FRONTEND_README.md`
- **Testing Guide**: See `TEST_INSTRUCTIONS.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`

## 🎉 You're All Set!

The application is ready to use with mock data. To connect to a real backend, update the `.env` file with your API URL.

---

**Happy Coding! 🌿**

