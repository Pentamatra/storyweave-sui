# 🎭 ChainMuse

**AI-Powered Branching Narrative NFTs on Sui Blockchain**

ChainMuse is a **blockchain-native** storytelling platform where every story is a Sui NFT, every branch is an on-chain relationship, and every creation is cryptographically verified. Users create collaborative, branching narratives using AI, storing content on IPFS, and minting each story node as an NFT on the Sui blockchain.

## 🏆 **Why This Is a Real Blockchain Project**

- ✅ **Every story is a Sui NFT** - Not just metadata, actual on-chain objects
- ✅ **Parent-child graph lives on blockchain** - Verifiable narrative structure  
- ✅ **On-chain event emission** - Real-time story creation feed
- ✅ **Wallet integration** - Users sign transactions and own their stories
- ✅ **On-chain queries** - UI powered by direct blockchain data
- ✅ **Transaction verification** - Every story links to SuiScan explorer
- ✅ **Immutable content hashing** - IPFS CID stored on-chain
- ✅ **Gas fees & real transactions** - Not a mock, actual Sui testnet

**📖 See [BLOCKCHAIN_FEATURES.md](./BLOCKCHAIN_FEATURES.md) for deep dive**

---

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───▶ │   Backend   │ ───▶ │  OpenRouter │
│  (Next.js)  │      │  (Node.js)  │      │     (AI)    │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ├───▶ IPFS (Pinata)
                            │     (Storage)
                            │
                            └───▶ Sui Blockchain
                                  (Move Contract)
```

### Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, TypeScript
- **AI:** OpenRouter API (Mistral, Llama, Claude)
- **Storage:** IPFS via Pinata
- **Blockchain:** Sui Move Smart Contract

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ installed
- Sui CLI installed ([guide](https://docs.sui.io/guides/developer/getting-started/sui-install))
- Git installed

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd chainmuse

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend `.env`

Create `backend/.env` with:

```env
# Backend Port
BACKEND_PORT=4000

# OpenRouter API (Get from: https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_key_here
OPENROUTER_REFERRER=https://chainmuse.app
OPENROUTER_APP_NAME=ChainMuse

# Pinata IPFS (Get from: https://app.pinata.cloud/developers/api-keys)
PINATA_JWT=your_jwt_here

# Sui Blockchain
SUI_NETWORK=testnet
SUI_PACKAGE_ID=0x0  # Update after deploying contract
SUI_ADMIN_SECRET_KEY=your_private_key_hex
```

#### Frontend `.env.local`

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUI_NETWORK=testnet
```

### 3. Deploy Move Contract

```bash
cd move
sui client publish --gas-budget 100000000
```

**Copy the Package ID** from the output and update `SUI_PACKAGE_ID` in `backend/.env`.

### 4. Run Services

#### Option A: Using Start Scripts (Recommended)

```bash
# From project root (in WSL or Linux)
./start-all.sh
```

#### Option B: Manual Start

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Open Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Flow

### Creating a Root Story

1. Click **"+ Create Story"** button
2. Enter a **Title** and **Prompt** (e.g., "A wizard discovers a lost spell")
3. Click **"Generate & Mint"**
4. Wait for:
   - ✅ AI generates story content
   - ✅ Content uploaded to IPFS
   - ✅ NFT minted on Sui blockchain
5. View your story in the **Grid** or **Graph** view

### Branching from a Story

1. Click on any story card
2. Click **"Branch from this Story"**
3. Enter your continuation prompt
4. Generate & Mint
5. Your new story node is linked to the parent!

---

## 🧩 Project Structure

```
chainmuse/
├── move/                          # Sui Move Smart Contract
│   ├── sources/story.move         # StoryNode NFT contract
│   └── Move.toml                  # Package configuration
│
├── backend/                       # Node.js Backend
│   ├── src/
│   │   ├── services/
│   │   │   ├── aiService.ts       # OpenRouter integration
│   │   │   ├── ipfsService.ts     # Pinata IPFS integration
│   │   │   └── suiService.ts      # Sui blockchain calls
│   │   └── server.ts              # Express API server
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx               # Main application page
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   └── StoryGraph.tsx         # Interactive story graph
│   ├── types/
│   │   └── story.ts               # TypeScript interfaces
│   └── package.json
│
├── start-all.sh                   # Start all services
├── stop-all.sh                    # Stop all services
└── README.md                      # This file
```

---

## 🔧 API Endpoints

### Backend (Port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/models` | List available AI models |
| POST | `/create-root-story` | Create a new root story |
| POST | `/create-child-story` | Branch from existing story |
| GET | `/content/:cid` | Fetch content from IPFS |

### Example Request

```bash
curl -X POST http://localhost:4000/create-root-story \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Lost Kingdom",
    "prompt": "Begin an epic fantasy adventure",
    "model": "mistralai/mistral-7b-instruct"
  }'
```

---

## 🎨 Features

### ✨ Core Features

- ✅ **AI Story Generation** - Multiple AI models via OpenRouter
- ✅ **Decentralized Storage** - IPFS via Pinata
- ✅ **Blockchain Provenance** - Every story is an NFT on Sui
- ✅ **Branching Narratives** - Create unlimited story branches
- ✅ **Interactive Visualization** - Force-directed graph view
- ✅ **Mock Mode** - Test without API keys

### 🎯 Advanced Features

- **Event Emission** - Move contract emits `StoryNodeCreated` events
- **Parent-Child Linking** - On-chain relationship tracking
- **Metadata Storage** - Full story content on IPFS
- **Responsive Design** - Works on mobile, tablet, desktop

---

## 🧪 Testing & Development

### Mock Mode (No API Keys Required)

The application can run in **mock mode** for testing:

1. Don't set `OPENROUTER_API_KEY` → Uses mock AI responses
2. Don't set `PINATA_JWT` → Uses mock IPFS CIDs
3. Don't set `SUI_PACKAGE_ID` → Uses mock transaction digests

All features work, but nothing is actually stored/minted.

### Health Check

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "services": {
    "sui": "configured",
    "openrouter": "configured",
    "ipfs": "mock mode"
  },
  "adminAddress": "0x..."
}
```

---

## 🐛 Troubleshooting

### Backend won't start

1. Check Node.js version: `node -v` (needs v18+)
2. Reinstall dependencies: `cd backend && npm install`
3. Check if port 4000 is available
4. Review `.env` file format

### Frontend shows errors

1. Clear Next.js cache: `cd frontend && rm -rf .next`
2. Reinstall: `npm install`
3. Check if backend is running on port 4000
4. Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

### Move contract won't deploy

1. Check Sui CLI: `sui --version`
2. Check active address: `sui client active-address`
3. Check balance: `sui client gas`
4. Request testnet tokens: [Sui Faucet](https://discord.gg/sui)

### Script won't run in WSL

```bash
# Fix line endings
dos2unix start-all.sh stop-all.sh

# Fix permissions
chmod +x start-all.sh stop-all.sh

# Run
./start-all.sh
```

---

## 📚 Resources

- [Sui Documentation](https://docs.sui.io/)
- [Move Language Book](https://move-book.com/)
- [OpenRouter API](https://openrouter.ai/docs)
- [Pinata IPFS](https://docs.pinata.cloud/)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🎯 Demo Script (90 seconds)

**For Hackathon Presentation:**

1. **[0-20s] Intro**
   - "ChainMuse: AI + Blockchain + IPFS for collaborative storytelling"
   - Show homepage with grid/graph toggle

2. **[20-60s] Live Demo**
   - Click "Create Story"
   - Enter: "A space explorer finds an ancient alien artifact"
   - Click "Generate & Mint"
   - Watch the 3-step process (AI → IPFS → Sui)
   - Show the new story card appears

3. **[60-80s] Branch Demo**
   - Click on the new story
   - Click "Branch from this Story"
   - Enter: "The artifact awakens and reveals a message"
   - Generate & watch the branch being created
   - Switch to Graph view → show the tree

4. **[80-90s] Close**
   - "Every story is verifiable, composable, and owned"
   - Show IPFS CID & Transaction Digest
   - "Built on Sui for infinite scalability"

---

## 🤝 Contributing

This is a hackathon project. Feel free to:

- Fork and improve
- Submit issues
- Create pull requests
- Use as a learning resource

---

## 📄 License

MIT License - Free to use and modify

---

## 🏆 Built For

**[Your Hackathon Name]**

Demonstrating the power of:
- ✅ AI + Blockchain integration
- ✅ On-chain provenance
- ✅ Composable narratives
- ✅ Decentralized storage

---

**Made with 💜 by ChainMuse Team**
