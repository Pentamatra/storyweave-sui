// backend/src/services/suiService.ts
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration check
const requiredEnvVars = ['SUI_NETWORK', 'SUI_PACKAGE_ID', 'SUI_ADMIN_SECRET_KEY'];
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.warn(`⚠️ ${v} is not set in environment variables. Using mock mode.`);
  }
}

const SUI_NETWORK = (process.env.SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') || 'testnet';
const SUI_PACKAGE_ID = process.env.SUI_PACKAGE_ID || '0x0';
const SUI_ADMIN_SECRET_KEY = process.env.SUI_ADMIN_SECRET_KEY || '';

// Initialize Sui client and signer
let client: SuiClient | null = null;
let keypair: Ed25519Keypair | null = null;
let adminAddress: string = '';

if (SUI_ADMIN_SECRET_KEY && SUI_ADMIN_SECRET_KEY.length > 0) {
  try {
    client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });
    
    // Support both bech32 (suiprivkey1...) and hex formats
    if (SUI_ADMIN_SECRET_KEY.startsWith('suiprivkey')) {
      // Bech32 format - use decodeSuiPrivateKey
      keypair = Ed25519Keypair.fromSecretKey(SUI_ADMIN_SECRET_KEY);
    } else {
      // Hex format
      keypair = Ed25519Keypair.fromSecretKey(Buffer.from(SUI_ADMIN_SECRET_KEY, 'hex'));
    }
    
    adminAddress = keypair.getPublicKey().toSuiAddress();
    console.log(`🔑 Sui Admin Address: ${adminAddress}`);
  } catch (error) {
    console.error('❌ Error initializing Sui client:', error);
    console.log('⚠️ Falling back to mock mode');
    client = null;
    keypair = null;
    adminAddress = '';
  }
} else {
  console.log('⚠️ SUI_ADMIN_SECRET_KEY not set. Running in mock mode.');
}

/**
 * Mints a new root StoryNode NFT on the Sui blockchain.
 * @param title The title of the story.
 * @param ipfsCid The IPFS CID of the story content.
 * @returns The transaction digest.
 */
export async function mintRootStoryNode(title: string, ipfsCid: string): Promise<{ digest: string; objectId: string; creator: string }> {
  console.log(`⛓️ Minting Root StoryNode on Sui... Title: ${title}, CID: ${ipfsCid}`);

  // If not properly configured, return mock data
  if (!SUI_ADMIN_SECRET_KEY || !client || !keypair) {
    console.log('⚠️ Using mock transaction data for testing');
    return {
      digest: `0x${Math.random().toString(16).substring(2, 66)}`,
      objectId: `0x${Math.random().toString(16).substring(2, 66)}`,
      creator: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };
  }

  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::story::create_root_story`,
      arguments: [
        // title: vector<u8>
        tx.pure.string(title),
        // ipfs_cid: vector<u8>
        tx.pure.string(ipfsCid),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    const digest = result.digest;
    
    // Extract the created object ID
    let objectId = '';
    if (result.objectChanges) {
      const created = result.objectChanges.find((change: any) => change.type === 'created');
      if (created && 'objectId' in created) {
        objectId = created.objectId;
      }
    }
    
    console.log(`✅ Successfully minted Root StoryNode. Digest: ${digest}, Object ID: ${objectId}`);
    return { digest, objectId, creator: adminAddress };
  } catch (error) {
    console.error('❌ Error minting Root StoryNode on Sui:', error);
    throw new Error('Failed to mint Root StoryNode.');
  }
}

/**
 * Mints a new child StoryNode NFT on the Sui blockchain.
 * @param title The title of the story.
 * @param ipfsCid The IPFS CID of the story content.
 * @param parentId The Object ID of the parent StoryNode.
 * @returns The transaction digest.
 */
export async function mintChildStoryNode(
  title: string, 
  ipfsCid: string, 
  parentId: string
): Promise<{ digest: string; objectId: string; creator: string }> {
  console.log(`⛓️ Minting Child StoryNode on Sui... Title: ${title}, CID: ${ipfsCid}, Parent: ${parentId}`);

  // If not properly configured, return mock data
  if (!SUI_ADMIN_SECRET_KEY || !client || !keypair) {
    console.log('⚠️ Using mock transaction data for testing');
    return {
      digest: `0x${Math.random().toString(16).substring(2, 66)}`,
      objectId: `0x${Math.random().toString(16).substring(2, 66)}`,
      creator: '0x0000000000000000000000000000000000000000000000000000000000000000'
    };
  }

  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::story::create_child_story`,
      arguments: [
        // title: vector<u8>
        tx.pure.string(title),
        // ipfs_cid: vector<u8>
        tx.pure.string(ipfsCid),
        // parent_id: ID
        tx.pure.address(parentId),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    const digest = result.digest;
    
    // Extract the created object ID
    let objectId = '';
    if (result.objectChanges) {
      const created = result.objectChanges.find((change: any) => change.type === 'created');
      if (created && 'objectId' in created) {
        objectId = created.objectId;
      }
    }
    
    console.log(`✅ Successfully minted Child StoryNode. Digest: ${digest}, Object ID: ${objectId}`);
    return { digest, objectId, creator: adminAddress };
  } catch (error) {
    console.error('❌ Error minting Child StoryNode on Sui:', error);
    throw new Error('Failed to mint Child StoryNode.');
  }
}

/**
 * Gets the admin address for display purposes.
 * @returns The admin address or a mock address.
 */
export function getAdminAddress(): string {
  return adminAddress || '0x0000000000000000000000000000000000000000000000000000000000000000';
}

/**
 * Checks if the Sui service is properly configured.
 * @returns True if properly configured, false otherwise.
 */
export function isSuiConfigured(): boolean {
  return !!(SUI_ADMIN_SECRET_KEY && client && keypair);
}