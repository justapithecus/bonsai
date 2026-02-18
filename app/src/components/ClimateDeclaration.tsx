import { CLIMATES } from '@grove/core'
import type { Climate } from '@grove/core'
import { useState } from 'react'

import { declareClimate } from '../server/climate'

interface ClimateDeclarationProps {
  currentClimate?: Climate
  onClose: () => void
  onDeclared: () => void
}

const CLIMATE_DESCRIPTIONS: Record<Climate, string> = {
  expansion: 'Warmth, openness, new growth across the portfolio.',
  consolidation:
    'Neutrality, clarity — tightening and strengthening across projects.',
  pruning:
    'Coolness, deliberate reduction — reshaping scope across the portfolio.',
  dormancy:
    'Stillness, muted tones — intentional rest across the portfolio.',
}

export function ClimateDeclaration({
  currentClimate,
  onClose,
  onDeclared,
}: ClimateDeclarationProps) {
  const [selected, setSelected] = useState<Climate | undefined>(undefined)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSelect = (climate: Climate) => {
    setSelected(climate)
    setConfirming(true)
  }

  const handleConfirm = async () => {
    if (!selected) return
    setSubmitting(true)
    await declareClimate({ data: { climate: selected } })
    onDeclared()
  }

  const handleCancel = () => {
    setSelected(undefined)
    setConfirming(false)
  }

  return (
    <div
      className="px-8 py-6"
      style={{
        backgroundColor: 'var(--grove-surface)',
        borderBottom: '1px solid var(--grove-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm"
          style={{ color: 'var(--grove-text)' }}
        >
          {confirming ? 'Confirm climate declaration' : 'Declare portfolio climate'}
        </h3>
        <button
          onClick={onClose}
          className="text-xs cursor-pointer"
          style={{ color: 'var(--grove-text-muted)' }}
        >
          Close
        </button>
      </div>

      {!confirming ? (
        <div className="flex gap-3">
          {CLIMATES.map((climate) => (
            <button
              key={climate}
              onClick={() => handleSelect(climate)}
              className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor:
                  climate === currentClimate
                    ? 'var(--grove-accent)'
                    : 'var(--grove-bg)',
                color:
                  climate === currentClimate
                    ? 'var(--grove-surface)'
                    : 'var(--grove-text)',
                border: '1px solid var(--grove-border)',
              }}
            >
              {climate}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p
            className="text-sm mb-2"
            style={{ color: 'var(--grove-text)' }}
          >
            Climate:{' '}
            <span className="font-medium">{selected}</span>
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            {selected && CLIMATE_DESCRIPTIONS[selected]}
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--grove-text-muted)' }}
          >
            Climate changes should be deliberate and rare. This declaration
            applies across the entire portfolio.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--grove-accent)',
                color: 'var(--grove-surface)',
              }}
            >
              {submitting ? 'Declaring...' : 'Confirm declaration'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              style={{
                color: 'var(--grove-text-muted)',
                border: '1px solid var(--grove-border)',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
