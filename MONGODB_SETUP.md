# MongoDB Configuration Guide
Local MongoDB Installation (Windows)

### Step 1: Download MongoDB

### Step 2: Install MongoDB

### Step 3: Verify Installation

### Step 4: Start MongoDB Service
MongoDB should auto-start as a service. To verify:

```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB
```

If not running:
```powershell
# Start MongoDB service
net start MongoDB
```

### Step 5: Configure Backend
1. Open `backend/.env`
2. Set MongoDB connection:
   ```env
   MONGO_URI=mongodb://localhost:27017/marketing-finance
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

### Step 6: Test Connection
```bash
cd backend
npm run seed
```

Expected output:
```
✅ MongoDB Connected: localhost
🗑️  Clearing existing data...
📝 Inserting campaigns...
📝 Inserting transactions...
📝 Inserting invoices...
✅ Database seeded successfully!
```
### MongoDB Compass (GUI)
Use MongoDB Compass to visually inspect your data:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Click "Connect"
4. You'll see `marketing-finance` database with 3 collections:
   - `campaigns`
   - `transactions`
   - `invoices`

---

## Quick Commands

### Seed Database
```bash
cd backend
npm run seed
```

### Start Backend
```bash
cd backend
npm run dev
```

### Test API
Open browser: `http://localhost:5000/api/health`

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-11-29T..."
}
```

---

