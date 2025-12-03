import { FC } from "react"
import { BlockLink, type BlockLinkItem } from "./block-link"

interface BlockLinkWrapperProps {
  items: BlockLinkItem[]
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export const BlockLinkWrapper: FC<BlockLinkWrapperProps> = (props) => {
  return <BlockLink {...props} />
}