import React from 'react'
import type { ContentBlock } from '../types/screen'
import {
  ButtonBlock,
  BadgeBlock,
  InputBlock,
  TextareaBlock,
  TableStatusBlock,
  TextBlock,
  HeadingBlock,
  DropdownBlock,
  DataTableBlock,
  ModalTriggerBlock,
  DrawerTriggerBlock,
  ContainerBlock,
  SectionBlock,
  FormBlock,
} from './blocks'

export function renderBlock(block: ContentBlock): React.ReactNode {
  switch (block.type) {
    case 'section': {
      const b = block as { heading?: string; direction?: string; gap?: number; items: ContentBlock[] }
      return <SectionBlock key={Math.random()} heading={b.heading} direction={b.direction as 'row' | 'col'} gap={b.gap}>{renderBlocks(b.items)}</SectionBlock>
    }
    case 'row': {
      const b = block as { gap?: number; items: ContentBlock[] }
      return <ContainerBlock key={Math.random()} direction="row" gap={b.gap}>{renderBlocks(b.items)}</ContainerBlock>
    }
    case 'col': {
      const b = block as { gap?: number; items: ContentBlock[] }
      return <ContainerBlock key={Math.random()} direction="col" gap={b.gap}>{renderBlocks(b.items)}</ContainerBlock>
    }
    case 'button':
      return <ButtonBlock key={Math.random()} config={block as Parameters<typeof ButtonBlock>[0]['config']} />
    case 'badge':
      return <BadgeBlock key={Math.random()} config={block as Parameters<typeof BadgeBlock>[0]['config']} />
    case 'input':
      return <InputBlock key={Math.random()} config={block as Parameters<typeof InputBlock>[0]['config']} />
    case 'textarea':
      return <TextareaBlock key={Math.random()} config={block as Parameters<typeof TextareaBlock>[0]['config']} />
    case 'tablestatus':
      return <TableStatusBlock key={Math.random()} config={block as Parameters<typeof TableStatusBlock>[0]['config']} />
    case 'text':
      return <TextBlock key={Math.random()} config={block as Parameters<typeof TextBlock>[0]['config']} />
    case 'heading':
      return <HeadingBlock key={Math.random()} config={block as Parameters<typeof HeadingBlock>[0]['config']} />
    case 'dropdown':
      return <DropdownBlock key={Math.random()} config={block as Parameters<typeof DropdownBlock>[0]['config']} />
    case 'datatable':
      return <DataTableBlock key={Math.random()} config={block as Parameters<typeof DataTableBlock>[0]['config']} />
    case 'modal-trigger':
      return <ModalTriggerBlock key={Math.random()} config={block as Parameters<typeof ModalTriggerBlock>[0]['config']} />
    case 'drawer-trigger':
      return <DrawerTriggerBlock key={Math.random()} config={block as Parameters<typeof DrawerTriggerBlock>[0]['config']} />
    case 'form': {
      const b = block as { gap?: number; items: ContentBlock[] }
      return <FormBlock key={Math.random()} gap={b.gap}>{renderBlocks(b.items)}</FormBlock>
    }
    default:
      return null
  }
}

export function renderBlocks(blocks: ContentBlock[]): React.ReactNode[] {
  return blocks.map(block => renderBlock(block))
}
