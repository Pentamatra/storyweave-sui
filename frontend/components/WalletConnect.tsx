'use client'

import { ConnectButton } from '@mysten/dapp-kit'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect } from 'react'

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const account = useCurrentAccount()

  useEffect(() => {
    if (account?.address) {
      onConnect(account.address)
    }
  }, [account?.address, onConnect])

  return (
    <div>
      <ConnectButton />
    </div>
  )
}
