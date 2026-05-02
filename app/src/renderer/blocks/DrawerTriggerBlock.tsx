import { useState } from 'react'
import { Button, Drawer } from '../../components'
import { renderBlocks } from '../registry'
import type { DrawerTriggerBlock } from '../../types/screen'
import type { ButtonSentiment, DrawerWidth } from '../../components'

export function DrawerTriggerBlock({ config }: { config: DrawerTriggerBlock }) {
  const [open, setOpen] = useState(false)
  const { buttonLabel, buttonSentiment = 'secondary', buttonSize = 'large', title, width = 400, backdrop = true, content, footerButtons } = config

  return (
    <>
      <Button
        sentiment={buttonSentiment as ButtonSentiment}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        size={buttonSize as any}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        width={width as DrawerWidth}
        backdrop={backdrop}
        footer={footerButtons && footerButtons.length > 0 ? (
          <>
            {footerButtons.map((btn, i) => (
              <Button
                key={i}
                type={btn.type === 'outline' ? 'outline' : 'filled'}
                sentiment={(btn.sentiment || 'accent') as ButtonSentiment}
                size="large"
                onClick={() => setOpen(false)}
              >
                {btn.label}
              </Button>
            ))}
          </>
        ) : undefined}
      >
        {renderBlocks(content)}
      </Drawer>
    </>
  )
}
