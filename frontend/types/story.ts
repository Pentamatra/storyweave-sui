export interface Contributor {
  address: string
  role: 'creator' | 'contributor'
  timestamp: number
  transactionDigest: string
}

export interface StoryNode {
  id: string
  title: string
  content: string
  ipfsCid: string
  parentId: string | null
  creator: string
  contributors: Contributor[]
  createdAt: number
  transactionDigest: string
  type: 'root' | 'merged'
}

export interface CreateStoryData {
  title: string
  prompt: string
  model?: string
  parentId?: string
  parentIpfsCid?: string
}

export interface AIModel {
  id: string
  name: string
  description?: string
}
