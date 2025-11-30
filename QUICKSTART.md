# 🚀 Quick Start Guide

Get the Marketing & Finance Module running in 5 minutes!

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` and set your MongoDB connection:
```env
MONGO_URI=mongodb://localhost:27017/marketing-finance
PORT=5000
```

## Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Step 4: Start MongoDB

Make sure MongoDB is running locally:

**Windows:**
```powershell
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
# OR
mongod
```

**Verify MongoDB is running:**
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- You should see your databases

## Step 5: Seed Sample Data

```bash
cd ../backend
npm run seed
```

Expected output:
```
✅ Database seeded successfully!
   - 6 campaigns
   - 32 transactions
   - 5 invoices
```

## Step 6: Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
```

## Step 7: Start Frontend (New Terminal)

```bash
cd ../frontend
npm run dev
```

Expected output:
```
  VITE ready in 300 ms
  ➜  Local:   http://localhost:3000/
```

## Step 8: Open Browser

Navigate to: **http://localhost:3000**

You should see the dashboard with charts and data!

---

## 🎉 You're Ready!

Explore the application:
- ✅ **Dashboard** - View financial overview and charts
- ✅ **Marketing** - Manage campaigns
- ✅ **Income** - Track income
- ✅ **Expenses** - Track expenses
- ✅ **Invoices** - Create and manage invoices
- ✅ **Reports** - Generate reports and export data

---

## ⚠️ Troubleshooting

### MongoDB not connecting?
Make sure MongoDB is running:
```bash
mongod
```

### Port 5000 already in use?
Change the port in `backend/.env`:
```env
PORT=5001
```

### Frontend not loading?
Check that backend is running on port 5000 (check the terminal output).

### Need help?
Read the full README.md for detailed documentation.

---

**Enjoy using the Marketing & Finance Module! **
