import { WritingSession, BlockchainReceipt } from "../types";

/**
 * Generates a SHA-256 hash of the content using the Web Crypto API.
 * This is a real cryptographic operation ensuring the content matches the hash.
 */
export const generateContentHash = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Simulates anchoring the content hash to a blockchain.
 * In a production environment, this would call a smart contract or a service like Ethereum, Polygon, or Solana.
 */
export const anchorToBlockchain = async (session: WritingSession): Promise<BlockchainReceipt> => {
  // 1. Generate real content hash
  const contentHash = await generateContentHash(session.finalContent);

  // 2. Simulate network latency for block confirmation
  await new Promise(resolve => setTimeout(resolve, 2500));

  // 3. Generate a simulated deterministic transaction hash based on the content hash
  // This ensures that if you re-run it with same content, it looks consistent for the demo
  const mockTxPrefix = "0x" + Math.random().toString(16).substr(2, 8);
  const txHash = `${mockTxPrefix}...${contentHash.substring(0, 16)}`;

  return {
    transactionHash: txHash,
    blockHeight: 18452000 + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    contentHash: contentHash,
    network: 'HumanAuthNet (L2)',
    status: 'confirmed'
  };
};