import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Sui client configuration
const network = process.env.SUI_NETWORK || 'testnet';
const suiClient = new SuiClient({ url: getFullnodeUrl(network) });

// Package ID (will be set after deployment)
const PACKAGE_ID = process.env.SUI_PACKAGE_ID || '0x0';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001';

const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY;

let keypair;

if (SUI_PRIVATE_KEY) {
  try {
    // Check if the key is in Bech32 format (suiprivkey1...)
    if (SUI_PRIVATE_KEY.startsWith('suiprivkey')) {
      keypair = Ed25519Keypair.fromSecretKey(SUI_PRIVATE_KEY);
    } else {
      // Assume it's a Base64 encoded key
      const privateKeyBytes = fromB64(SUI_PRIVATE_KEY);
      keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(1)); // Slice off the scheme byte
    }
    console.log(`✅ Using keypair for address: ${keypair.getPublicKey().toSuiAddress()}`);
  } catch (error) {
    console.error('❌ Failed to parse SUI_PRIVATE_KEY. Using demo keypair as fallback.', error.message);
    keypair = new Ed25519Keypair(); // Fallback to demo keypair
    console.log('⚠️   Using demo keypair (not for production!)');
    console.log(`📝 Demo Address: ${keypair.getPublicKey().toSuiAddress()}`);
  }
} else {
  keypair = new Ed25519Keypair();
  console.log('⚠️   Using demo keypair (not for production!)');
  console.log(`📝 Demo Address: ${keypair.getPublicKey().toSuiAddress()}`);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ChainMuse Sui Backend',
    network: network,
    packageId: PACKAGE_ID,
    address: keypair.getPublicKey().toSuiAddress(),
  });
});

// Get address info
app.get('/address', async (req, res) => {
  try {
    const address = keypair.getPublicKey().toSuiAddress();
    const balance = await suiClient.getBalance({ owner: address });
    
    res.json({
      address: address,
      balance: balance.totalBalance,
      network: network,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request testnet SUI tokens (faucet)
app.post('/faucet', async (req, res) => {
  try {
    const address = keypair.getPublicKey().toSuiAddress();
    
    if (network !== 'testnet' && network !== 'devnet') {
      return res.status(400).json({ error: 'Faucet only available on testnet/devnet' });
    }
    
    console.log('💰 Requesting faucet for:', address);
    
    // Call Sui faucet
    const faucetURL = network === 'testnet' 
      ? 'https://faucet.testnet.sui.io/v1/gas'
      : 'https://faucet.devnet.sui.io/v1/gas';
    
    const response = await fetch(faucetURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });
    
    const data = await response.json();
    
    res.json({
      success: true,
      message: 'Faucet request sent',
      data: data,
      address: address,
    });
  } catch (error) {
    console.error('Faucet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create root story node (combines AI generation + mint)
app.post('/create-root-story', async (req, res) => {
  try {
    const { prompt, title } = req.body;
    
    if (!prompt || !title) {
      return res.status(400).json({ error: 'prompt and title are required' });
    }
    
    console.log(`🌱 Creating root story node: "${title}"`);
    
    // Step 1: Generate AI content and get CID
    console.log('🤖 Calling AI service...');
    const aiResponse = await fetch(`${AI_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, title, parentCid: null }),
    });
    
    if (!aiResponse.ok) {
      throw new Error('AI service error');
    }
    
    const aiData = await aiResponse.json();
    const cid = aiData.cid;
    console.log(`✅ AI generated content, CID: ${cid}`);
    
    // Step 2: Mint on Sui blockchain
    console.log('⛓️  Minting on Sui...');
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::story::create_root_node`,
      arguments: [
        tx.pure.string(cid),
        tx.pure.string(title),
      ],
    });
    
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    
    console.log('✅ Transaction successful:', result.digest);
    
    // Extract created object ID
    const createdObject = result.objectChanges?.find(
      (obj) => obj.type === 'created' && obj.objectType.includes('StoryNode')
    );
    
    res.json({
      success: true,
      transactionDigest: result.digest,
      objectId: createdObject?.objectId,
      cid: cid,
      content: aiData.content,
      title: title,
      explorer: `https://suiscan.xyz/${network}/tx/${result.digest}`,
    });
    
  } catch (error) {
    console.error('❌ Error creating root story:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create child story node (branch from existing node)
app.post('/create-child-story', async (req, res) => {
  try {
    const { prompt, title, parentAddress, parentCid } = req.body;
    
    if (!prompt || !title || !parentAddress) {
      return res.status(400).json({ 
        error: 'prompt, title, and parentAddress are required' 
      });
    }
    
    console.log(`🌿 Creating child story node: "${title}"`);
    
    // Step 1: Generate AI content with parent context
    console.log('🤖 Calling AI service with parent context...');
    const aiResponse = await fetch(`${AI_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, title, parentCid }),
    });
    
    if (!aiResponse.ok) {
      throw new Error('AI service error');
    }
    
    const aiData = await aiResponse.json();
    const cid = aiData.cid;
    console.log(`✅ AI generated content, CID: ${cid}`);
    
    // Step 2: Mint on Sui blockchain
    console.log('⛓️  Minting on Sui...');
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::story::create_child_node`,
      arguments: [
        tx.pure.address(parentAddress),
        tx.pure.string(cid),
        tx.pure.string(title),
      ],
    });
    
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    
    console.log('✅ Transaction successful:', result.digest);
    
    // Extract created object ID
    const createdObject = result.objectChanges?.find(
      (obj) => obj.type === 'created' && obj.objectType.includes('StoryNode')
    );
    
    res.json({
      success: true,
      transactionDigest: result.digest,
      objectId: createdObject?.objectId,
      cid: cid,
      content: aiData.content,
      title: title,
      parentAddress: parentAddress,
      explorer: `https://suiscan.xyz/${network}/tx/${result.digest}`,
    });
    
  } catch (error) {
    console.error('❌ Error creating child story:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get story node details
app.get('/story/:objectId', async (req, res) => {
  try {
    const { objectId } = req.params;
    
    const object = await suiClient.getObject({
      id: objectId,
      options: { showContent: true, showOwner: true },
    });
    
    res.json(object);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all owned story nodes
app.get('/stories', async (req, res) => {
  try {
    const address = keypair.getPublicKey().toSuiAddress();
    
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::story::StoryNode`,
      },
      options: { showContent: true },
    });
    
    res.json({
      address: address,
      stories: objects.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n⛓️  ChainMuse Sui Backend started!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('\n📍 Configuration:');
  console.log(`   Network: ${network}`);
  console.log(`   Package ID: ${PACKAGE_ID === '0x0' ? '⚠️  Not deployed yet' : PACKAGE_ID}`);
  console.log(`   Address: ${keypair.getPublicKey().toSuiAddress()}`);
  console.log(`   AI Service: ${AI_SERVICE_URL}`);
  console.log('\n');
});

export default app;

