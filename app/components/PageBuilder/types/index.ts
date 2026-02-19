// types/index.ts
export interface Block {
  id: string
  type: string
  props: Record<string, any>
  customClasses?: string
  htmlId?: string
  children?: Block[]
}

export interface BlockDefinition {
  type: string
  name: string
  description: string
  icon: string
  defaultProps: Record<string, any>
  allowChildren?: boolean
}

export interface SaveData {
  blocks: Block[]
  json: string
  html: string
}
