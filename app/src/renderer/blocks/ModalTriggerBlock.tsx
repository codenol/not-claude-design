import { useState } from 'react'
import { Button, Modal } from '../../components'
import { renderBlocks } from '../registry'
import type { ModalTriggerBlock } from '../../types/screen'
import type { ButtonSentiment, ModalWidth } from '../../components'

export function ModalTriggerBlock({ config }: { config: ModalTriggerBlock }) {
  const [open, setOpen] = useState(false)
  const { buttonLabel, buttonSentiment = 'accent', buttonSize = 'large', title, description, width = 400, content, footerButtons } = config

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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        width={width as ModalWidth}
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
      </Modal>
    </>
  )
}
