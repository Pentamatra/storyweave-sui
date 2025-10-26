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
  type: 'root' | 'child'
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
    <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
      {/* Graph */}
      <div className="flex-1 bg-black/20 rounded-xl overflow-hidden">
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => node.title}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D) => {
              const label = node.title
              const fontSize = 12
              ctx.font = `${fontSize}px Inter, sans-serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              
              // Draw node circle
              const color = node.type === 'root' ? '#6366f1' : '#a855f7'
              ctx.fillStyle = color
              ctx.beginPath()
              ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
              ctx.fill()
              
              // Draw label
              ctx.fillStyle = '#ffffff'
              ctx.fillText(label, node.x, node.y + 20)
            }}
            linkColor={() => 'rgba(255,255,255,0.2)'}
            linkWidth={2}
            onNodeClick={handleNodeClick}
            backgroundColor="transparent"
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No nodes to display
          </div>
        )}
      </div>

      {/* Selected Node Info */}
      <div className="lg:w-80">
        {selectedNode ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedNode.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedNode.type === 'root' 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'bg-purple-500/20 text-purple-300'
              }`}>
                {selectedNode.type === 'root' ? 'Root' : 'Branch'}
              </span>
            </div>
            
            <p className="text-gray-300 text-sm mb-6">
              {selectedNode.content}
            </p>
            
            <button
              onClick={() => {
                const story = stories.find(s => s.id === selectedNode.id)
                if (story) onBranchStory(story)
              }}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition-all"
            >
              Branch from this Story
            </button>
          </motion.div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center h-full flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-lg font-semibold mb-2">Select a Node</h4>
            <p className="text-gray-400 text-sm">
              Click on any story node to view details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}