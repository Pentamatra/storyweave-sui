# 🚀 ChainMuse - Complete Setup Guide

## ✅ Pre-Flight Checklist

Before starting, make sure you have:

- [ ] Node.js v18+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Sui CLI installed (`sui --version`)
- [ ] Git installed (`git --version`)
- [ ] A code editor (VSCode recommended)

---

## 📦 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Navigate to backend
cd backend
npm install

# Navigate to frontend
cd ../frontend
npm install
```

**Expected Output:** No errors, all packages installed successfully.

---

### Step 2: Create Environment Files

#### 2.1 Backend `.env`

Create `backend/.env`:

```bash
cd backend
cat > .env << 'EOF'
BACKEND_PORT=4000

# Leave empty for mock mode testing
OPENROUTER_API_KEY=
OPENROUTER_REFERRER=https://chainmuse.app
OPENROUTER_APP_NAME=ChainMuse

# Leave empty for mock mode testing
PINATA_JWT=

# Sui Configuration (update after deploying contract)
SUI_NETWORK=testnet
SUI_PACKAGE_ID=0x0
SUI_ADMIN_SECRET_KEY=
EOF
```

#### 2.2 Frontend `.env.local`

Create `frontend/.env.local`:

```bash
cd ../frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUI_NETWORK=testnet
EOF
```

---

### Step 3: Test Backend (Mock Mode)

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 ChainMuse Backend server is running at http://localhost:4000
📊 Health check: http://localhost:4000/health
🤖 Available models: http://localhost:4000/models
⚠️ OPENROUTER_API_KEY is not set. Using mock AI service for testing.
⚠️ PINATA_JWT is not set. Using mock IPFS service for testing.
```

Test health endpoint:
```bash
curl http://localhost:4000/health
```

---

### Step 4: Test Frontend

**In a new terminal:**

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open: http://localhost:3000

You should see the ChainMuse homepage!

---

### Step 5: Deploy Move Contract (Optional)

**⚠️ Only if you want real blockchain interaction**

#### 5.1 Get Sui Testnet Tokens

```bash
# Check your address
sui client active-address

# Request testnet SUI
# Go to: https://discord.gg/sui
# In #testnet-faucet channel, type: !faucet <your-address>
```

#### 5.2 Deploy Contract

```bash
cd move
sui client publish --gas-budget 100000000
```

#### 5.3 Update Backend `.env`

Copy the **Package ID** from the output and update:

```env
SUI_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
```

#### 5.4 Get Private Key

```bash
# Export your private key
sui keytool export --key-identity <your-address>
```

Update in `backend/.env`:
```env
SUI_ADMIN_SECRET_KEY=your_hex_private_key
```

---

### Step 6: Get API Keys (Optional)

**⚠️ Only if you want real AI and IPFS**

#### 6.1 OpenRouter API Key

1. Go to: https://openrouter.ai/keys
2. Sign up / Log in
3. Create a new API key
4. Copy and paste into `backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

#### 6.2 Pinata JWT

1. Go to: https://app.pinata.cloud/developers/api-keys
2. Sign up / Log in
3. Create a new API key
4. Copy the JWT and paste into `backend/.env`:

```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 7: Start Everything

#### Option A: Using Start Script (WSL/Linux)

```bash
cd /path/to/chainmuse
chmod +x start-all.sh stop-all.sh
./start-all.sh
```

#### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🎯 Testing the Application

### Test 1: Create a Root Story

1. Open: http://localhost:3000
2. Click **"+ Create Story"**
3. Enter:
   - Title: `The Lost Kingdom`
   - Prompt: `Begin an epic fantasy adventure in a mysterious realm`
4. Click **"Generate & Mint"**
5. Wait for the story to appear (mock mode is instant!)

### Test 2: Branch a Story

1. Click on the story card you just created
2. Click **"Branch from this Story"**
3. Enter:
   - Title: `The Dark Cave`
   - Prompt: `The hero discovers a dark cave with ancient markings`
4. Click **"Generate & Mint"**
5. Switch to **Graph View** to see the branch!

---

## 🐛 Common Issues

### Issue: "Port 4000 already in use"

**Solution:**
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port in backend/.env
BACKEND_PORT=4001
```

### Issue: "Cannot find module 'axios'"

**Solution:**
```bash
cd backend
npm install axios
```

### Issue: "window is not defined"

**Solution:** Already fixed with `dynamic` import in `page.tsx`

### Issue: Start script won't run in WSL

**Solution:**
```bash
dos2unix start-all.sh stop-all.sh
chmod +x start-all.sh stop-all.sh
```

---

## 📊 Service Status Check

Run this to check all services:

```bash
# Check backend
curl http://localhost:4000/health

# Expected output:
{
  "status": "ok",
  "services": {
    "sui": "mock mode",
    "openrouter": "not configured",
    "ipfs": "mock mode"
  }
}
```

---

## 🎓 Next Steps

1. ✅ **Test in Mock Mode** - Everything works without API keys
2. ✅ **Get API Keys** - For real AI and IPFS
3. ✅ **Deploy Contract** - For real blockchain interaction
4. ✅ **Customize** - Modify the UI, add features
5. ✅ **Deploy** - Use Vercel for frontend, Railway for backend

---

## 🏆 You're Ready!

Your ChainMuse application is now fully set up and ready to demo!

**Next:** Check out the main [README.md](./README.md) for usage instructions and API documentation.

---

**Need help?** Review the error messages carefully - they usually tell you exactly what's missing!

