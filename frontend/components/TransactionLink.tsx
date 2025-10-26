'use client'

import { motion } from 'framer-motion'

interface TransactionLinkProps {
  digest: string
  network?: 'testnet' | 'mainnet' | 'devnet'
  label?: string
}

export default function TransactionLink({ 
  digest, 
  network = 'testnet',
  label = 'View on Explorer'
}: TransactionLinkProps) {
  const explorerUrl = `https://suiscan.xyz/${network}/tx/${digest}`

  return (
    <motion.a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 glass hover:border-cyan-400/60 border border-cyan-500/40 rounded-xl text-sm font-semibold text-cyan-300 transition-all duration-300 group cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <span className="text-base relative z-10">🔗</span>
      <span className="relative z-10">{label}</span>
      <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity font-mono relative z-10">
        {digest.slice(0, 6)}...{digest.slice(-4)}
      </span>
      <svg 
        className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 relative z-10" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </motion.a>
  )
}
