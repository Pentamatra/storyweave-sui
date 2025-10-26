'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { StoryNode } from '../types/story'
import WalletConnect from '../components/WalletConnect'
import BlockchainStats from '../components/BlockchainStats'
import TransactionLink from '../components/TransactionLink'
import StarfieldBackground from '../components/StarfieldBackground'
import Ribbons from '../components/Ribbons'

// Import StoryGraph with no SSR
const StoryGraph = dynamic(() => import('../components/StoryGraph'), {
  ssr: false,
  loading: () => <div className="text-center py-12 text-gray-400">Loading graph...</div>
})

// Fade In Animation - Optimized
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Faster
      delayChildren: 0.1, // Less delay
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 }, // Less movement
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4, // Faster
      ease: "easeOut",
    },
  },
}

export default function Home() {
  const [stories, setStories] = useState<StoryNode[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState<StoryNode | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    model: 'mistralai/mistral-7b-instruct'
  })

  // Load stories from backend
  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    // Mock data with contributors
    const mockStories: StoryNode[] = [
      {
        id: '0x1a2b3c4d5e6f7890',
        title: 'The Cosmic Explorer',
        content: 'In the vast expanse of space, a lone explorer discovers an ancient artifact that pulses with otherworldly energy. As they reach out to touch it, visions of distant galaxies flood their mind...',
        ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        parentId: null,
        creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        contributors: [
          {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            role: 'creator',
            timestamp: Date.now() - 86400000,
            transactionDigest: '0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0'
          }
        ],
        createdAt: Date.now() - 86400000,
        transactionDigest: '0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        type: 'root'
      },
      {
        id: '0x2b3c4d5e6f789012',
        title: 'The Quantum Gateway - Extended',
        content: 'In the vast expanse of space, a lone explorer discovers an ancient artifact that pulses with otherworldly energy. As they reach out to touch it, visions of distant galaxies flood their mind. Through this portal, the explorer witnesses a scientist opening dimensional gateways, leading to parallel universes where physics operates under different rules. Each reality holds a piece of an ancient puzzle, connecting the artifact to a cosmic network of knowledge...',
        ipfsCid: 'QmXwBPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPcfH',
        parentId: '0x1a2b3c4d5e6f7890',
        creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        contributors: [
          {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            role: 'creator',
            timestamp: Date.now() - 86400000,
            transactionDigest: '0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0'
          },
          {
            address: '0x963f57Fe8856D1663926a4d066Dd0e9607f1dGg',
            role: 'contributor',
            timestamp: Date.now() - 43200000,
            transactionDigest: '0x9f4b0c3d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1'
          }
        ],
        createdAt: Date.now() - 43200000,
        transactionDigest: '0x9f4b0c3d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1',
        type: 'merged'
      },
      {
        id: '0x3c4d5e6f78901234',
        title: 'Digital Consciousness',
        content: 'In a world where minds can be uploaded to the cloud, one person discovers that digital existence is not what humanity expected. The boundaries between real and virtual blur...',
        ipfsCid: 'QmZwCQKzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPdiJ',
        parentId: null,
        creator: '0x852e46Dd7645D1542936a4c955Cc0e8596e1cFf',
        contributors: [
          {
            address: '0x852e46Dd7645D1542936a4c955Cc0e8596e1cFf',
            role: 'creator',
            timestamp: Date.now() - 21600000,
            transactionDigest: '0xa05c1d4e3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a2b'
          }
        ],
        createdAt: Date.now() - 21600000,
        transactionDigest: '0xa05c1d4e3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a2b',
        type: 'root'
      }
    ]
    setStories(mockStories)
  }

  const handleCreateStory = async () => {
    if (!formData.title.trim() || !formData.prompt.trim()) return
    
    setCreateLoading(true)
    try {
      const endpoint = selectedStory 
        ? 'http://localhost:4000/create-child-story'
        : 'http://localhost:4000/create-root-story'
      
      const payload = selectedStory
        ? {
            title: formData.title,
            prompt: formData.prompt,
            model: formData.model,
            parentObjectId: selectedStory.id,
            parentIpfsCid: selectedStory.ipfsCid
          }
        : {
            title: formData.title,
            prompt: formData.prompt,
            model: formData.model
          }

      const response = await axios.post(endpoint, payload)
      
      // Add new story to list with REAL blockchain data
      const newStory: StoryNode = {
        id: response.data.objectId,
        title: response.data.title,
        content: response.data.content,
        ipfsCid: response.data.ipfsCid,
        parentId: selectedStory?.id || null,
        creator: response.data.creator,
        contributors: selectedStory 
          ? [...selectedStory.contributors, {
              address: response.data.creator,
              role: 'contributor' as const,
              timestamp: Date.now(),
              transactionDigest: response.data.transactionDigest
            }]
          : [{
              address: response.data.creator,
              role: 'creator' as const,
              timestamp: Date.now(),
              transactionDigest: response.data.transactionDigest
            }],
        createdAt: Date.now(),
        transactionDigest: response.data.transactionDigest,
        type: selectedStory ? 'merged' : 'root'
      }
      
      setStories([...stories, newStory])
      setShowCreateModal(false)
      setFormData({ title: '', prompt: '', model: 'mistralai/mistral-7b-instruct' })
      setSelectedStory(null)
    } catch (error) {
      console.error('Error creating story:', error)
      alert('Failed to create story. Check console for details.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden">
      {/* Starfield Background */}
      <StarfieldBackground />
      
      {/* Ribbons Animation */}
      <Ribbons
        baseThickness={10}
        colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
        speedMultiplier={0.38}
        maxAge={300}
        enableFade={false}
        enableShaderEffect={true}
      />
      
      {/* Animated Glow Elements - Optimized */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-glow-purple/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-glow-pink/5 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Content Wrapper */}
      <div className="relative z-10">

      {/* Header */}
      <header className="fixed top-0 w-full z-40 border-b border-white/10 backdrop-blur-2xl bg-black/50 shadow-2xl shadow-purple-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-glow-purple to-glow-pink rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse-slow"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300">
                  <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 65 75 L 95 75 L 95 145 L 65 145 Z" fill="white" opacity="0.9"/>
                    <path d="M 105 75 L 135 75 L 135 145 L 105 145 Z" fill="white" opacity="0.7"/>
                    <rect x="95" y="75" width="10" height="70" fill="white" opacity="0.5"/>
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">
                  StoryWeave
                </h1>
                <p className="text-xs text-gray-400 font-medium">AI-Powered Narratives</p>
              </div>
            </motion.div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <motion.button
                onClick={() => setViewMode(viewMode === 'grid' ? 'graph' : 'grid')}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center space-x-2 px-4 py-2.5 rounded-xl glass glass-hover font-semibold text-sm transition-all shadow-lg hover:shadow-xl border border-white/10 hover:border-white/20"
              >
                <span>{viewMode === 'grid' ? '📊' : '📋'}</span>
                <span>{viewMode === 'grid' ? 'Graph' : 'Grid'}</span>
              </motion.button>
              <WalletConnect onConnect={setWalletAddress} />
              <motion.button
                onClick={() => {
                  setSelectedStory(null)
                  setShowCreateModal(true)
                }}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 md:px-6 py-2.5 rounded-xl btn-gradient text-white font-bold text-sm md:text-base shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60"
              >
                ✨ Create
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-6 md:mb-8 px-4">
            <div className="inline-block px-4 md:px-5 py-2 md:py-2.5 rounded-full glass backdrop-blur-md border border-glow-purple/40 mb-4 md:mb-6 shadow-lg shadow-purple-500/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <p className="text-xs md:text-sm font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  ⛓️ Powered by Sui Blockchain
                </p>
              </div>
            </div>
          </motion.div>

          <motion.h2 
            variants={itemVariants} 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight neon-text px-4"
            style={{
              textShadow: '0 0 40px rgba(102, 126, 234, 0.4), 0 0 80px rgba(240, 147, 251, 0.3), 0 0 120px rgba(102, 126, 234, 0.2)'
            }}
          >
            <span className="gradient-text">Create Infinite Stories</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed px-4">
            Experience the future of storytelling. Generate branching narratives with AI, preserve them on blockchain, and build collaborative story universes.
          </motion.p>

           <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6 text-sm px-4">
            <motion.div 
              className="flex items-center space-x-2 glass px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all cursor-pointer group"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/60"></div>
              <span className="text-sm md:text-base text-gray-200 font-semibold group-hover:gradient-text transition-all">Sui Blockchain</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 glass px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all cursor-pointer group"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/60"></div>
              <span className="text-sm md:text-base text-gray-200 font-semibold group-hover:gradient-text transition-all">IPFS Storage</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 glass px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all cursor-pointer group"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-pink-400 rounded-full animate-pulse shadow-lg shadow-pink-400/60"></div>
              <span className="text-sm md:text-base text-gray-200 font-semibold group-hover:gradient-text transition-all">AI Generated</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 py-10">
        <BlockchainStats 
          totalStories={stories.length}
          totalBranches={stories.filter(s => s.type === 'merged').length}
        />
      </section>

      {/* Main Content Section */}
      <section className="relative z-10 container mx-auto px-4 pb-32">
        {stories.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 md:py-32 px-4"
          >
            <div className="relative inline-block mb-6 md:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative text-6xl md:text-7xl lg:text-8xl mb-2 float">📚</div>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6">
              <span className="gradient-text" style={{textShadow: '0 0 30px rgba(102, 126, 234, 0.3)'}}>
                No Stories Yet
              </span>
            </h3>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Be the first to create a story. Your narrative will be minted on the Sui blockchain and permanently stored on IPFS.
            </p>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 md:px-10 py-4 md:py-5 rounded-xl btn-gradient text-white font-bold text-base md:text-lg inline-flex items-center space-x-2 md:space-x-3 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
            >
              <span>🚀</span>
              <span>Start Creating Now</span>
            </motion.button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => {
                  setSelectedStory(story)
                  setShowStoryModal(true)
                }}
                className="group relative cursor-pointer"
              >
                {/* Main Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                  
                  <div className="relative p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all flex-1 line-clamp-2 pr-2">
                        {story.title}
                      </h3>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 ${
                        story.type === 'root' 
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' 
                          : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-purple-300 border border-purple-400/30'
                      }`}>
                        {story.type === 'root' ? '🌱 Root' : '✨ Merged'}
                      </span>
                    </div>
                    
                    {/* Contributors */}
                    {story.contributors.length > 1 && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                        <span className="text-xs text-gray-500">✍️ Contributors:</span>
                        <div className="flex -space-x-2">
                          {story.contributors.map((contributor, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white"
                              title={`${contributor.address.slice(0, 6)}...${contributor.address.slice(-4)}`}
                            >
                              {idx + 1}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-indigo-300 font-semibold">{story.contributors.length}</span>
                      </div>
                    )}
                    
                    {/* Content Preview */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {story.content}
                    </p>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-3 mb-4 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <span>📦</span>
                        <span className="font-mono">{story.ipfsCid.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <span>👤</span>
                        <span className="font-mono">{story.creator.slice(0, 6)}...</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStory(story)
                          setShowCreateModal(true)
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-500/30 to-purple-500/30 hover:from-indigo-500/40 hover:to-purple-500/40 text-white text-sm font-medium transition-all border border-indigo-400/30 hover:border-indigo-400/50"
                      >
                        🌿 Branch
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`https://suiscan.xyz/testnet/tx/${story.transactionDigest}`, '_blank')
                        }}
                        className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-sm font-medium transition-all border border-cyan-400/30 hover:border-cyan-400/50"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
            }}
          >
            <StoryGraph 
              stories={stories}
              onBranchStory={(story) => {
                setSelectedStory(story)
                setShowCreateModal(true)
              }}
            />
          </motion.div>
        )}
      </section>

      {/* Story Reading Modal - Modernized */}
      {showStoryModal && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Modern Glass Container */}
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-y-auto max-h-[90vh]">
              
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl md:text-3xl font-bold gradient-text">{selectedStory.title}</h2>
                      <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                        selectedStory.type === 'root' 
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40' 
                          : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-purple-300 border border-purple-400/40'
                      }`}>
                        {selectedStory.type === 'root' ? '🌱 Original' : '✨ Merged Story'}
                      </span>
                    </div>
                    
                    {/* Contributors Section - Blockchain Verified */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-gray-400">✍️</span>
                        <span className="text-gray-300 font-semibold">{selectedStory.contributors.length}</span>
                        <span className="text-gray-400">Contributor{selectedStory.contributors.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-400/30">
                        <span className="text-indigo-400">⛓️</span>
                        <span className="text-indigo-300 font-semibold">Blockchain Verified</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowStoryModal(false)
                      setSelectedStory(null)
                    }}
                    className="ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
              </div>

              {/* Contributors List - Blockchain Info */}
              {selectedStory.contributors.length > 0 && (
                <div className="px-6 pt-4 pb-2">
                  <div className="space-y-2">
                    {selectedStory.contributors.map((contributor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-300 font-mono">
                                {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                contributor.role === 'creator' 
                                  ? 'bg-indigo-500/20 text-indigo-300' 
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {contributor.role === 'creator' ? '🌱 Creator' : '✨ Contributor'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {new Date(contributor.timestamp).toLocaleDateString()} • On-chain
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(`https://suiscan.xyz/testnet/tx/${contributor.transactionDigest}`, '_blank')}
                          className="opacity-0 group-hover:opacity-100 text-xs text-cyan-400 hover:text-cyan-300 transition-all"
                        >
                          View TX →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Content */}
              <div className="p-6">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-400/20 p-6">
                  <p className="text-base md:text-lg leading-relaxed text-gray-100 whitespace-pre-wrap">
                    {selectedStory.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-gray-900/95 backdrop-blur-xl border-t border-white/10 p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowStoryModal(false)
                      setSelectedStory(selectedStory)
                      setShowCreateModal(true)
                    }}
                    className="flex-1 py-3.5 px-6 rounded-xl btn-gradient text-white font-bold text-sm shadow-xl shadow-indigo-500/30"
                  >
                    ✨ Continue This Story
                  </motion.button>
                  <button
                    onClick={() => window.open(`https://suiscan.xyz/testnet/tx/${selectedStory.transactionDigest}`, '_blank')}
                    className="py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-semibold text-sm border border-cyan-400/30 hover:border-cyan-400/50 transition-all"
                  >
                    🔗 View on SuiScan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Modal - Modernized */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl"
          >
            {/* Modern Glass Container */}
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
                      {selectedStory ? '✨ Continue Story' : '🌱 Create New Story'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {selectedStory 
                        ? 'Your contribution will be merged with the existing story' 
                        : 'Start a new narrative journey on the blockchain'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setSelectedStory(null)
                    }}
                    className="ml-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                </div>
              </div>

              {/* Parent Story Info */}
              {selectedStory && (
                <div className="p-6 pb-0">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-400/30 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-indigo-300 font-semibold">📖 CONTINUING FROM:</span>
                      <span className="text-xs text-gray-400">{selectedStory.contributors.length} contributor(s)</span>
                    </div>
                    <p className="font-bold text-white mb-1">{selectedStory.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{selectedStory.content.slice(0, 100)}...</p>
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-purple-300">
                      💡 AI will merge your continuation with the existing story into one complete narrative
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-200 uppercase tracking-wide">Story Title</label>
                  <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 glass rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 font-medium"
                  placeholder="Enter a compelling title..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-200 uppercase tracking-wide">Story Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-5 py-4 glass rounded-xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 font-medium"
                  rows={5}
                  placeholder="Describe your narrative vision..."
                />
              </div>

                <div className="flex gap-4 pt-6">
                  <motion.button
                    onClick={() => {
                      setShowCreateModal(false)
                      setSelectedStory(null)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-xl glass text-white font-semibold transition-all hover:bg-white/10 shadow-lg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleCreateStory}
                    disabled={createLoading || !formData.title.trim() || !formData.prompt.trim()}
                    whileHover={{ scale: createLoading ? 1 : 1.03 }}
                    whileTap={{ scale: createLoading ? 1 : 0.98 }}
                    className="flex-1 py-3.5 rounded-xl btn-gradient text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60"
                  >
                    {createLoading ? '⏳ Generating...' : '🚀 Generate & Mint'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

       {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-xl bg-black/40 mt-20 shadow-inner shadow-purple-500/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 gradient-text">StoryWeave</h3>
              <p className="text-sm text-gray-400">
                AI-powered narrative creation on Sui blockchain. Create, share, and monetize stories.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">© 2024 StoryWeave. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="text-xl">𝕏</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="text-xl">💬</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="text-xl">🔗</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}