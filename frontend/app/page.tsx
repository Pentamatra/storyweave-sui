'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { StoryNode } from '../types/story'
import WalletConnect from '../components/WalletConnect'
import BlockchainStats from '../components/BlockchainStats'
import TransactionLink from '../components/TransactionLink'

// Import StoryGraph with no SSR
const StoryGraph = dynamic(() => import('../components/StoryGraph'), {
  ssr: false,
  loading: () => <div className="text-center py-12 text-gray-400">Loading graph...</div>
})

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
    // For now, use mock data. In production, fetch from backend
    const mockStories: StoryNode[] = [
      {
        id: '0x1a2b3c4d5e6f7890',
        title: 'The Cosmic Explorer',
        content: 'In the vast expanse of space, a lone explorer discovers an ancient artifact that pulses with otherworldly energy. As they reach out to touch it, visions of distant galaxies flood their mind...',
        ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        parentId: null,
        creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        createdAt: Date.now() - 86400000,
        transactionDigest: '0x8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
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
        id: response.data.objectId,  // Real object ID from blockchain
        title: response.data.title,
        content: response.data.content,
        ipfsCid: response.data.ipfsCid,
        parentId: selectedStory?.id || null,
        creator: response.data.creator,  // Real creator address from blockchain
        createdAt: Date.now(),
        transactionDigest: response.data.transactionDigest,
        type: selectedStory ? 'child' : 'root'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">ChainMuse</h1>
                <p className="text-xs text-gray-400">AI-Powered Story Network</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletConnect onConnect={setWalletAddress} />
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'graph' : 'grid')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                {viewMode === 'grid' ? '📊 Graph View' : '📋 Grid View'}
              </button>
              <button
                onClick={() => {
                  setSelectedStory(null)
                  setShowCreateModal(true)
                }}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold transition-all"
              >
                + Create Story
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Infinite Stories
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            AI-generated branching narratives stored on Sui blockchain with IPFS
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-400">Sui Blockchain</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-400">IPFS Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
              <span className="text-gray-400">OpenRouter AI</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Blockchain Stats */}
      <section className="container mx-auto px-4">
        <BlockchainStats 
          totalStories={stories.length}
          totalBranches={stories.filter(s => s.parentId).length}
        />
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 pb-20">
        {stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-2">No Stories Yet</h3>
            <p className="text-gray-400 mb-6">Create the first story to begin your narrative journey</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all group cursor-pointer"
                onClick={() => {
                  setSelectedStory(story)
                  setShowStoryModal(true)
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {story.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    story.type === 'root' 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {story.type === 'root' ? 'Root' : 'Branch'}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {story.content}
                </p>
                
                <div className="space-y-2 mb-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>📦 IPFS:</span>
                    <span className="font-mono">{story.ipfsCid.slice(0, 10)}...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>👤 Creator:</span>
                    <span className="font-mono">{story.creator.slice(0, 10)}...</span>
                  </div>
                  <div className="pt-2">
                    <TransactionLink 
                      digest={story.transactionDigest}
                      label="View TX"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedStory(story)
                    setShowCreateModal(true)
                  }}
                  className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium transition-all"
                >
                  Branch from this Story
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <StoryGraph 
              stories={stories}
              onBranchStory={(story) => {
                setSelectedStory(story)
                setShowCreateModal(true)
              }}
            />
          </div>
        )}
      </section>

      {/* Story Reading Modal */}
      {showStoryModal && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6 sticky top-0 bg-gray-900">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold">{selectedStory.title}</h2>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    selectedStory.type === 'root' 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {selectedStory.type === 'root' ? 'Root' : 'Branch'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  👤 {selectedStory.creator.slice(0, 10)}... • 📦 {selectedStory.ipfsCid.slice(0, 10)}...
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStoryModal(false)
                  setSelectedStory(null)
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Story Content */}
            <div className="mb-6 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl">
              <p className="text-lg leading-relaxed text-gray-100 whitespace-pre-wrap">
                {selectedStory.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-gray-900">
              <TransactionLink 
                digest={selectedStory.transactionDigest}
                label="View on SuiScan"
              />
              <button
                onClick={() => {
                  setShowStoryModal(false)
                  setSelectedStory(selectedStory)
                  setShowCreateModal(true)
                }}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium transition-all"
              >
                Branch from this Story
              </button>
              <button
                onClick={() => {
                  setShowStoryModal(false)
                  setSelectedStory(null)
                }}
                className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 font-medium transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-8 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedStory ? 'Branch Story' : 'Create New Story'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedStory(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedStory && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-300 mb-1">Branching from:</p>
                <p className="font-semibold">{selectedStory.title}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter story title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Story Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  rows={4}
                  placeholder="Describe what happens next..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedStory(null)
                  }}
                  className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStory}
                  disabled={createLoading || !formData.title.trim() || !formData.prompt.trim()}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Creating...' : 'Generate & Mint'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}