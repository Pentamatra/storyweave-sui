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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 transition-all group"
    >
      <span>⛓️</span>
      <span>{label}</span>
      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        {digest.slice(0, 6)}...{digest.slice(-4)}
      </span>
      <svg 
        className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </motion.a>
  )
}
