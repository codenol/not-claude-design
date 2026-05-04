import type { PRD } from '../features/types'

export interface CheckItem {
  label: string
  passed: boolean
}

export function checkPrd(prd: PRD): CheckItem[] {
  return [
    {
      label: 'Есть хотя бы одна персона',
      passed: prd.personas.length > 0,
    },
    {
      label: 'У всех персон есть имя и роль',
      passed: prd.personas.length > 0 && prd.personas.every(p => p.name.trim() && p.role.trim()),
    },
    {
      label: 'Есть хотя бы один use case',
      passed: prd.useCases.length > 0,
    },
    {
      label: 'У всех use cases есть название',
      passed: prd.useCases.length > 0 && prd.useCases.every(uc => uc.title.trim()),
    },
    {
      label: 'У всех use cases есть actor',
      passed: prd.useCases.length > 0 && prd.useCases.every(uc => uc.actor.trim()),
    },
    {
      label: 'У всех use cases есть хотя бы 1 шаг',
      passed: prd.useCases.length > 0 && prd.useCases.every(uc => uc.mainFlow.length > 0),
    },
    {
      label: 'Есть хотя бы одна сущность данных',
      passed: prd.dataModel.length > 0,
    },
    {
      label: 'У всех сущностей есть имя и хотя бы 1 поле',
      passed: prd.dataModel.length > 0 && prd.dataModel.every(e => e.name.trim() && e.fields.length > 0),
    },
    {
      label: 'Есть хотя бы один экран',
      passed: prd.screenInventory.length > 0,
    },
    {
      label: 'Каждый экран привязан к use case',
      passed: prd.screenInventory.length > 0 && prd.screenInventory.every(s => s.relatedUseCases.length > 0),
    },
    {
      label: 'Есть хотя бы одна ось вариативности',
      passed: prd.variantMatrix.length > 0,
    },
  ]
}

export interface CompletenessCheckProps {
  prd: PRD
}

export function CompletenessCheck({ prd }: CompletenessCheckProps) {
  const items = checkPrd(prd)
  const passed = items.filter(i => i.passed).length
  const total = items.length
  const pct = Math.round((passed / total) * 100)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      border: '1px solid var(--color-neutral-200, #e5e7eb)',
      borderRadius: 'var(--border-radius-m, 8px)',
      background: 'var(--color-bg-default, #ffffff)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-default, #111827)' }}>
          Полнота PRD
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: pct === 100 ? 'var(--color-accent-success, #10b981)' : pct >= 70 ? '#f59e0b' : '#ef4444',
        }}>
          {passed}/{total} ({pct}%)
        </span>
      </div>

      <div style={{
        height: 4,
        borderRadius: 2,
        background: 'var(--color-neutral-100, #f3f4f6)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 2,
          background: pct === 100 ? 'var(--color-accent-success, #10b981)' : pct >= 70 ? '#f59e0b' : '#ef4444',
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: item.passed ? 'var(--color-accent-success, #10b981)' : 'var(--color-neutral-400, #9ca3af)',
          }}>
            <span>{item.passed ? '✓' : '○'}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
