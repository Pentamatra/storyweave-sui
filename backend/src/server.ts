// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { generateStoryContent, getAvailableModels } from './services/aiService';
import { uploadJsonToIpfs, fetchFromIpfs } from './services/ipfsService';
import { mintRootStoryNode, mintChildStoryNode, getAdminAddress, isSuiConfigured } from './services/suiService';
import { fetchAllStoryNodes, fetchStoryEvents, getBlockchainStats } from './services/queryService';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 4000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    services: {
      sui: isSuiConfigured() ? 'configured' : 'mock mode',
      openrouter: process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured',
      ipfs: process.env.PINATA_JWT ? 'configured' : 'mock mode',
    },
    adminAddress: getAdminAddress(),
  });
});

// Get available AI models
app.get('/models', async (req, res) => {
  try {
    const models = await getAvailableModels();
    res.status(200).json({ models });
  } catch (error) {
    console.error('❌ Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get blockchain statistics
app.get('/blockchain/stats', async (req, res) => {
  try {
    const stats = await getBlockchainStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error fetching blockchain stats:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain stats' });
  }
});

// Get all story nodes from blockchain
app.get('/blockchain/stories', async (req, res) => {
  try {
    const nodes = await fetchAllStoryNodes();
    res.status(200).json({ stories: nodes });
  } catch (error) {
    console.error('❌ Error fetching story nodes:', error);
    res.status(500).json({ error: 'Failed to fetch story nodes' });
  }
});

// Get story events from blockchain
app.get('/blockchain/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const events = await fetchStoryEvents(limit);
    res.status(200).json({ events });
  } catch (error) {
    console.error('❌ Error fetching story events:', error);
    res.status(500).json({ error: 'Failed to fetch story events' });
  }
});

/**
 * Main endpoint to create a new root story node.
 * 1. Generates story content via OpenRouter AI.
 * 2. Uploads content to IPFS.
 * 3. Mints an NFT on the Sui blockchain.
 */
app.post('/create-root-story', async (req, res) => {
  const { prompt, title, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    console.log('--- Starting New Root Story Creation ---');

    // 1. Generate story content from AI
    const storyContent = await generateStoryContent(prompt, undefined, model);

    // 2. Prepare metadata and upload to IPFS
    const metadata = {
      name: title,
      description: storyContent.substring(0, 100) + '...',
      content: storyContent,
      type: 'root',
      parent: null,
      timestamp: Date.now(),
      model: model || 'mistralai/mistral-7b-instruct',
    };
    const ipfsCid = await uploadJsonToIpfs(metadata);

    // 3. Mint the StoryNode NFT on Sui
    const mintResult = await mintRootStoryNode(title, ipfsCid);

    console.log('--- Successfully Created New Root Story ---');

    res.status(200).json({
      message: 'Root story created successfully!',
      title,
      content: storyContent,
      ipfsCid,
      transactionDigest: mintResult.digest,
      objectId: mintResult.objectId,
      creator: mintResult.creator,
      metadata,
    });
  } catch (error) {
    console.error('❌ An error occurred in the create-root-story flow:', error);
    res.status(500).json({ 
      error: 'Failed to create root story.', 
      details: (error as Error).message 
    });
  }
});

/**
 * Endpoint to create a new child story node (branch from existing story).
 * 1. Fetches parent content from IPFS.
 * 2. Generates story content via OpenRouter AI with parent context.
 * 3. Uploads content to IPFS.
 * 4. Mints an NFT on the Sui blockchain.
 */
app.post('/create-child-story', async (req, res) => {
  const { prompt, title, parentIpfsCid, parentObjectId, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  if (!parentIpfsCid) {
    return res.status(400).json({ error: 'Parent IPFS CID is required.' });
  }

  if (!parentObjectId) {
    return res.status(400).json({ error: 'Parent Object ID is required.' });
  }

  try {
    console.log('--- Starting New Child Story Creation ---');

    // 1. Fetch parent content from IPFS for context
    let parentContent = '';
    try {
      const parentData = await fetchFromIpfs(parentIpfsCid);
      const parentMetadata = JSON.parse(parentData);
      parentContent = parentMetadata.content || '';
    } catch (error) {
      console.warn('⚠️ Could not fetch parent content, proceeding without context');
    }

    // 2. Generate story content from AI with parent context
    const storyContent = await generateStoryContent(prompt, parentContent, model);

    // 3. Prepare metadata and upload to IPFS
    const metadata = {
      name: title,
      description: storyContent.substring(0, 100) + '...',
      content: storyContent,
      type: 'child',
      parent: parentObjectId,
      parentIpfsCid,
      timestamp: Date.now(),
      model: model || 'mistralai/mistral-7b-instruct',
    };
    const ipfsCid = await uploadJsonToIpfs(metadata);

    // 4. Mint the StoryNode NFT on Sui
    const mintResult = await mintChildStoryNode(title, ipfsCid, parentObjectId);

    console.log('--- Successfully Created New Child Story ---');

    res.status(200).json({
      message: 'Child story created successfully!',
      title,
      content: storyContent,
      ipfsCid,
      transactionDigest: mintResult.digest,
      objectId: mintResult.objectId,
      creator: mintResult.creator,
      parentObjectId,
      metadata,
    });
  } catch (error) {
    console.error('❌ An error occurred in the create-child-story flow:', error);
    res.status(500).json({ 
      error: 'Failed to create child story.', 
      details: (error as Error).message 
    });
  }
});

// Fetch content from IPFS
app.get('/content/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const content = await fetchFromIpfs(cid);
    res.status(200).json({ content });
  } catch (error) {
    console.error('❌ Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ChainMuse Backend server is running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Available models: http://localhost:${PORT}/models`);
});