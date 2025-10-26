'use client'

import { motion } from 'framer-motion'

interface BlockchainStatsProps {
  totalStories: number
  totalBranches: number
  lastBlockTime?: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export default function BlockchainStats({ 
  totalStories, 
  totalBranches,
  lastBlockTime 
}: BlockchainStatsProps) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Stories */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group relative overflow-hidden glass rounded-2xl p-6 md:p-8 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30"
        style={{
          background: 'linear-gradient(145deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.02) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/30 group-hover:from-indigo-500/50 group-hover:to-indigo-600/50 transition-all duration-300 shadow-lg shadow-indigo-500/30">
              <span className="text-2xl">📚</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/60 animate-pulse"></div>
          </div>
          
          <p className="text-xs md:text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wider">Total Stories</p>
          <div className="mb-3">
            <div className="text-4xl md:text-5xl font-black gradient-text">
              {totalStories}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">On-chain NFTs minted</p>
          
          <div className="mt-4 pt-4 border-t border-indigo-400/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <div className="text-xs text-indigo-300 font-semibold">Live on Sui</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Total Branches */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group relative overflow-hidden glass rounded-2xl p-6 md:p-8 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30"
        style={{
          background: 'linear-gradient(145deg, rgba(120, 75, 162, 0.08) 0%, rgba(120, 75, 162, 0.02) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 group-hover:from-purple-500/50 group-hover:to-purple-600/50 transition-all duration-300 shadow-lg shadow-purple-500/30">
              <span className="text-2xl">🌳</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/60 animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <p className="text-xs md:text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wider">Story Branches</p>
          <div className="mb-3">
            <div className="text-4xl md:text-5xl font-black gradient-text">
              {totalBranches}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">Narrative connections</p>
          
          <div className="mt-4 pt-4 border-t border-purple-400/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="text-xs text-purple-300 font-semibold">Growing ecosystem</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Network Status */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -6, scale: 1.02 }}
        className="group relative overflow-hidden glass rounded-2xl p-6 md:p-8 backdrop-blur-xl border border-pink-500/30 hover:border-pink-400/60 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-pink-500/30"
        style={{
          background: 'linear-gradient(145deg, rgba(240, 147, 251, 0.08) 0%, rgba(240, 147, 251, 0.02) 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-all duration-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-600/30 group-hover:from-pink-500/50 group-hover:to-pink-600/50 transition-all duration-300 shadow-lg shadow-pink-500/30">
              <span className="text-2xl">⛓️</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/60 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <p className="text-xs md:text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wider">Network</p>
          <div className="mb-3">
            <div className="text-4xl md:text-5xl font-black gradient-text">
              Sui
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">Blockchain network</p>
          
          <div className="mt-4 pt-4 border-t border-pink-400/20 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="text-xs text-green-300 font-semibold">Testnet Active</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
