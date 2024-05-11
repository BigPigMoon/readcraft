export interface Item {
  Card?: Card
  Group?: Folder
}

export interface Card {
  id: number
  word: string
  translation: string
  group_id: number
}

export interface Folder {
  id: number
  title: string
  invite_code: string
  group_id: number
}

export interface TreeNode {
  root: Folder,
  children: TreeNode[],
}