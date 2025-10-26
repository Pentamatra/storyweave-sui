// backend/src/services/queryService.ts
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUI_NETWORK = (process.env.SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') || 'testnet';
const SUI_PACKAGE_ID = process.env.SUI_PACKAGE_ID || '0x0';

let client: SuiClient | null = null;

if (SUI_PACKAGE_ID && SUI_PACKAGE_ID !== '0x0') {
  try {
    client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });
    console.log(`🔍 Sui Query Service initialized on ${SUI_NETWORK}`);
  } catch (error) {
    console.error('❌ Failed to initialize Sui query client:', error);
  }
} else {
  console.log('⚠️ SUI_PACKAGE_ID not set. Query service in mock mode.');
}

/**
 * Fetches all StoryNode objects from the blockchain
 * @returns Array of story nodes with their on-chain data
 */
export async function fetchAllStoryNodes(): Promise<any[]> {
  if (!client || SUI_PACKAGE_ID === '0x0') {
    console.log('⚠️ Query service not configured, returning empty array');
    return [];
  }

  try {
    // Query all objects of type StoryNode
    const response = await client.getOwnedObjects({
      filter: {
        StructType: `${SUI_PACKAGE_ID}::story::StoryNode`
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      }
    });

    console.log(`✅ Fetched ${response.data.length} story nodes from blockchain`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching story nodes:', error);
    return [];
  }
}

/**
 * Fetches events emitted by the story contract
 * @returns Array of StoryNodeCreated events
 */
export async function fetchStoryEvents(limit: number = 50): Promise<any[]> {
  if (!client || SUI_PACKAGE_ID === '0x0') {
    console.log('⚠️ Query service not configured, returning empty array');
    return [];
  }

  try {
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${SUI_PACKAGE_ID}::story::StoryNodeCreated`
      },
      limit,
      order: 'descending'
    });

    console.log(`✅ Fetched ${events.data.length} story events from blockchain`);
    return events.data;
  } catch (error) {
    console.error('❌ Error fetching story events:', error);
    return [];
  }
}

/**
 * Fetches a specific story node by its object ID
 * @param objectId The object ID of the story node
 * @returns The story node object
 */
export async function fetchStoryNodeById(objectId: string): Promise<any> {
  if (!client) {
    throw new Error('Query service not configured');
  }

  try {
    const object = await client.getObject({
      id: objectId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      }
    });

    console.log(`✅ Fetched story node: ${objectId}`);
    return object;
  } catch (error) {
    console.error(`❌ Error fetching story node ${objectId}:`, error);
    throw error;
  }
}

/**
 * Gets blockchain statistics
 * @returns Stats about the story network
 */
export async function getBlockchainStats(): Promise<{
  totalStories: number;
  totalBranches: number;
  network: string;
  packageId: string;
}> {
  const events = await fetchStoryEvents(1000);
  const rootStories = events.filter((e: any) => !e.parsedJson?.parent_id);
  const branches = events.filter((e: any) => e.parsedJson?.parent_id);

  return {
    totalStories: rootStories.length,
    totalBranches: branches.length,
    network: SUI_NETWORK,
    packageId: SUI_PACKAGE_ID
  };
}

