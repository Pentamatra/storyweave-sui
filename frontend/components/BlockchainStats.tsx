'use client'

import { motion } from 'framer-motion'

interface BlockchainStatsProps {
  totalStories: number
  totalBranches: number
  lastBlockTime?: number
}

export default function BlockchainStats({ 
  totalStories, 
  totalBranches,
  lastBlockTime 
}: BlockchainStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Total Stories</span>
          <span className="text-2xl">📚</span>
        </div>
        <div className="text-3xl font-bold text-white">{totalStories}</div>
        <div className="text-xs text-gray-500 mt-1">On-chain NFTs</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Total Branches</span>
          <span className="text-2xl">🌳</span>
        </div>
        <div className="text-3xl font-bold text-white">{totalBranches}</div>
        <div className="text-xs text-gray-500 mt-1">Story connections</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Network</span>
          <span className="text-2xl">⛓️</span>
        </div>
        <div className="text-3xl font-bold text-white">Sui</div>
        <div className="text-xs text-gray-500 mt-1 flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Testnet Active
        </div>
      </motion.div>
    </div>
  )
}
