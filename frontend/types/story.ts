export interface StoryNode {
  id: string
  title: string
  content: string
  ipfsCid: string
  parentId: string | null
  creator: string
  createdAt: number
  transactionDigest: string
  type: 'root' | 'child'
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
