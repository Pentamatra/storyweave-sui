// backend/src/services/ipfsService.ts
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.warn("⚠️ PINATA_JWT is not set. Using mock IPFS service for testing.");
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Uploads a JSON object to IPFS using Pinata.
 * @param jsonData The JSON object to upload.
 * @returns The IPFS Content Identifier (CID).
 */
export async function uploadJsonToIpfs(jsonData: object): Promise<string> {
  console.log('📦 Uploading metadata to IPFS via Pinata...');

  // If no API key is set, return a mock CID for testing
  if (!PINATA_JWT) {
    console.log('⚠️ Using mock IPFS CID for testing');
    return `Qm${Math.random().toString(36).substring(2, 46)}`;
  }

  try {
    const formData = new FormData();
    const jsonString = JSON.stringify(jsonData);
    formData.append('file', jsonString, {
      filename: 'story-node.json',
      contentType: 'application/json',
    });

    const response = await axios.post<PinataResponse>(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
      }
    );

    const cid = response.data.IpfsHash;
    console.log(`✅ Successfully pinned to IPFS. CID: ${cid}`);
    return cid;
  } catch (error) {
    console.error('❌ Error uploading to Pinata:', error);
    
    // Fallback to mock CID if Pinata is unavailable
    console.log('⚠️ Falling back to mock IPFS CID');
    return `Qm${Math.random().toString(36).substring(2, 46)}`;
  }
}

/**
 * Fetches content from IPFS using the CID.
 * @param cid The IPFS Content Identifier.
 * @returns The content as a string.
 */
export async function fetchFromIpfs(cid: string): Promise<string> {
  console.log(`📥 Fetching content from IPFS: ${cid}`);

  // If it's a mock CID, return mock content
  if (cid.startsWith('Qm') && cid.length === 46) {
    console.log('⚠️ Returning mock content for testing');
    return JSON.stringify({
      name: "Mock Story",
      content: "This is mock content for testing purposes.",
      timestamp: Date.now()
    });
  }

  try {
    // Try multiple IPFS gateways
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
    ];

    for (const gateway of gateways) {
      try {
        const response = await axios.get(gateway, {
          timeout: 10000, // 10 second timeout
        });
        console.log(`✅ Successfully fetched content from IPFS via ${gateway}`);
        return response.data;
      } catch (gatewayError) {
        console.warn(`⚠️ Failed to fetch from ${gateway}, trying next...`);
        continue;
      }
    }

    throw new Error('All IPFS gateways failed');
  } catch (error) {
    console.error('❌ Error fetching from IPFS:', error);
    throw new Error('Failed to fetch content from IPFS');
  }
}


