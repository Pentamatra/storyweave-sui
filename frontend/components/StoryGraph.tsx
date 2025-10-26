'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ForceGraph2D from 'react-force-graph-2d'
import { StoryNode } from '../types/story'

interface StoryGraphProps {
  stories: StoryNode[]
  onBranchStory: (story: StoryNode) => void
}

interface GraphNode {
  id: string
  title: string
  content: string
  type: 'root' | 'merged'
  x?: number
  y?: number
}

interface GraphLink {
  source: string
  target: string
}

export default function StoryGraph({ stories, onBranchStory }: StoryGraphProps) {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ 
    nodes: [], 
    links: [] 
  })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const graphRef = useRef<any>()

  useEffect(() => {
    const nodes: GraphNode[] = stories.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      type: story.type,
    }))

    const links: GraphLink[] = stories
      .filter(story => story.parentId)
      .map(story => ({
        source: story.parentId!,
        target: story.id
      }))

    setGraphData({ nodes, links })
  }, [stories])

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }

  return (
    <div className="w-full">
      {graphData.nodes.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Graph Container */}
          <div className="flex-1">
            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-b from-black/40 to-black/20 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 glass shadow-2xl">
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel={(node: any) => node.title}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D) => {
                  // Enhanced safety check for node position
                  if (typeof node.x !== 'number' || typeof node.y !== 'number' || 
                      !isFinite(node.x) || !isFinite(node.y) ||
                      isNaN(node.x) || isNaN(node.y)) {
                    return
                  }
                  
                  const label = node.title || 'Untitled'
                  const fontSize = 12
                  ctx.font = `600 ${fontSize}px 'Space Grotesk', sans-serif`
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'middle'
                  
                  // Draw glow effect with additional validation
                  const glowSize = 12
                  try {
                    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize)
                    
                    if (node.type === 'root') {
                      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)')
                      gradient.addColorStop(1, 'rgba(102, 126, 234, 0)')
                    } else {
                      gradient.addColorStop(0, 'rgba(240, 147, 251, 0.6)')
                      gradient.addColorStop(1, 'rgba(240, 147, 251, 0)')
                    }
                    
                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI)
                    ctx.fill()
                    
                    // Draw node circle with border
                    const color = node.type === 'root' ? '#667eea' : '#f093fb'
                    ctx.fillStyle = color
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
                    ctx.fill()
                    
                    // Draw border
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
                    ctx.lineWidth = 1.5
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
                    ctx.stroke()
                    
                    // Draw label with background
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
                    const textWidth = ctx.measureText(label).width
                    ctx.fillRect(
                      node.x - textWidth / 2 - 6,
                      node.y + 20 - 8,
                      textWidth + 12,
                      16
                    )
                    
                    ctx.fillStyle = '#ffffff'
                    ctx.fillText(label, node.x, node.y + 24)
                  } catch (e) {
                    // Fallback: draw simple circle if gradient fails
                    const color = node.type === 'root' ? '#667eea' : '#f093fb'
                    ctx.fillStyle = color
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
                    ctx.fill()
                  }
                }}
                linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D) => {
                  const start = link.source
                  const end = link.target
                  
                  // Validate link positions
                  if (!start || !end || 
                      typeof start.x !== 'number' || typeof start.y !== 'number' ||
                      typeof end.x !== 'number' || typeof end.y !== 'number' ||
                      !isFinite(start.x) || !isFinite(start.y) ||
                      !isFinite(end.x) || !isFinite(end.y)) {
                    return
                  }
                  
                  try {
                    // Create gradient for link
                    const gradient = ctx.createLinearGradient(
                      start.x, start.y,
                      end.x, end.y
                    )
                    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)')
                    gradient.addColorStop(1, 'rgba(240, 147, 251, 0.4)')
                    
                    ctx.strokeStyle = gradient
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(start.x, start.y)
                    ctx.lineTo(end.x, end.y)
                    ctx.stroke()
                  } catch (e) {
                    // Fallback: simple line
                    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(start.x, start.y)
                    ctx.lineTo(end.x, end.y)
                    ctx.stroke()
                  }
                }}
                linkColor={() => 'transparent'}
                linkWidth={2}
                onNodeClick={handleNodeClick}
                backgroundColor="transparent"
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
              />
              
              {/* Info Badge */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 glass rounded-lg md:rounded-xl px-3 md:px-5 py-2 md:py-2.5 text-xs font-semibold text-gray-200 shadow-lg border border-white/20">
                <span className="gradient-text hidden sm:inline">📊 {graphData.nodes.length} Stories • {graphData.links.length} Connections</span>
                <span className="gradient-text sm:hidden">📊 {graphData.nodes.length} • {graphData.links.length}</span>
              </div>
            </div>
          </div>

          {/* Selected Node Info Panel */}
          <div className="lg:w-96">
            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col overflow-hidden shadow-2xl border border-purple-500/20"
                style={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                }}
              >
                <div className="flex-shrink-0 mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold gradient-text flex-1 line-clamp-2">
                      {selectedNode.title}
                    </h3>
                    <span className={`ml-2 text-xs px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                      selectedNode.type === 'root' 
                        ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30' 
                        : 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                    }`}>
                      {selectedNode.type === 'root' ? '🌱 Root' : '🌿 Branch'}
                    </span>
                  </div>
                  
                  {/* Type indicator */}
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className={`w-2 h-2 rounded-full ${selectedNode.type === 'root' ? 'bg-indigo-400' : 'bg-purple-400'} animate-pulse`}></div>
                    <span>{selectedNode.type === 'root' ? 'Original Story' : 'Story Branch'}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto mb-6 pr-2">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedNode.content}
                  </p>
                </div>
                
                {/* Action Button */}
                <motion.button
                  onClick={() => {
                    const story = stories.find(s => s.id === selectedNode.id)
                    if (story) onBranchStory(story)
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl btn-gradient text-white font-bold transition-all shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60"
                >
                  🌿 Branch from this Story
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col items-center justify-center text-center shadow-2xl border border-white/10"
                style={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                }}
              >
                <div className="text-5xl mb-4 float">🎯</div>
                <h4 className="text-lg font-bold mb-2 text-white">Select a Story Node</h4>
                <p className="text-gray-400 text-sm">
                  Click on any node in the graph to view story details and branch options
                </p>
                
                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-white/10 w-full space-y-3">
                  <p className="text-xs font-medium text-gray-400 mb-3">Legend:</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-xs text-gray-400">Root Story</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-gray-400">Branch Story</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl p-16 text-center shadow-2xl border border-white/10"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
          }}
        >
          <div className="text-6xl mb-6 float">🌳</div>
          <h3 className="text-3xl font-black mb-4 gradient-text">No Story Graph Yet</h3>
          <p className="text-gray-300 max-w-md mx-auto leading-relaxed">
            Create stories to see them visualized as an interactive network graph. Each story will branch into new narratives!
          </p>
        </motion.div>
      )}
    </div>
  )
}