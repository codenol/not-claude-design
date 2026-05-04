import type { UseCase, UseCaseStep, UseCaseErrorFlow } from '../features/types'
import { Button, Input, Dropdown } from '../components'
import styles from './UseCaseEditor.module.css'

export interface UseCaseEditorProps {
  useCases: UseCase[]
  personaNames: string[]
  screenNames: string[]
  onChange: (useCases: UseCase[]) => void
}

export function UseCaseEditor({ useCases, personaNames, screenNames, onChange }: UseCaseEditorProps) {
  const add = () => {
    onChange([
      ...useCases,
      {
        id: `uc${Date.now()}`,
        title: '',
        actor: personaNames[0] ?? '',
        goal: '',
        trigger: '',
        mainFlow: [],
        errorFlows: [],
        relatedFeatures: [],
      },
    ])
  }

  const update = (idx: number, patch: Partial<UseCase>) => {
    const next = [...useCases]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  const remove = (idx: number) => {
    onChange(useCases.filter((_, i) => i !== idx))
  }

  const addStep = (ucIdx: number) => {
    const uc = useCases[ucIdx]
    update(ucIdx, { mainFlow: [...uc.mainFlow, { actor: 'user', action: '', screenId: undefined }] })
  }

  const updateStep = (ucIdx: number, stepIdx: number, patch: Partial<UseCaseStep>) => {
    const uc = useCases[ucIdx]
    const steps = [...uc.mainFlow]
    steps[stepIdx] = { ...steps[stepIdx], ...patch }
    update(ucIdx, { mainFlow: steps })
  }

  const removeStep = (ucIdx: number, stepIdx: number) => {
    const uc = useCases[ucIdx]
    update(ucIdx, { mainFlow: uc.mainFlow.filter((_, i) => i !== stepIdx) })
  }

  const addError = (ucIdx: number) => {
    const uc = useCases[ucIdx]
    update(ucIdx, { errorFlows: [...uc.errorFlows, { condition: '', resolution: '' }] })
  }

  const updateError = (ucIdx: number, errIdx: number, patch: Partial<UseCaseErrorFlow>) => {
    const uc = useCases[ucIdx]
    const errs = [...uc.errorFlows]
    errs[errIdx] = { ...errs[errIdx], ...patch }
    update(ucIdx, { errorFlows: errs })
  }

  const removeError = (ucIdx: number, errIdx: number) => {
    const uc = useCases[ucIdx]
    update(ucIdx, { errorFlows: uc.errorFlows.filter((_, i) => i !== errIdx) })
  }

  const actorOptions = personaNames.map(n => ({ label: n, value: n }))
  const screenOptions = screenNames.map(n => ({ label: n, value: n }))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Use Cases</h2>
        <Button sentiment="accent" size="small" onClick={add}>+ Добавить</Button>
      </div>

      {useCases.length === 0 && (
        <p className={styles.empty}>Нет use cases.</p>
      )}

      <div className={styles.list}>
        {useCases.map((uc, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardFields}>
                <Input
                  className={styles.fullWidth}
                  placeholder="Название use case"
                  value={uc.title}
                  onChange={e => update(idx, { title: e.target.value })}
                />
                <div className={styles.row}>
                  <Dropdown
                    placeholder="Actor"
                    options={actorOptions}
                    defaultValue={uc.actor}
                    onChange={e => update(idx, { actor: e.target.value })}
                  />
                  <Input
                    className={styles.fullWidth}
                    placeholder="Триггер"
                    value={uc.trigger}
                    onChange={e => update(idx, { trigger: e.target.value })}
                  />
                </div>
                <Input
                  className={styles.fullWidth}
                  placeholder="Цель (goal)"
                  value={uc.goal}
                  onChange={e => update(idx, { goal: e.target.value })}
                />
              </div>
              <Button type="ghost" sentiment="danger" size="small" onClick={() => remove(idx)}>×</Button>
            </div>

            <div className={styles.stepsSection}>
              <div className={styles.sectionLabel}>
                Основной поток
                <Button type="ghost" sentiment="secondary" size="small" onClick={() => addStep(idx)}>+ Шаг</Button>
              </div>
              {uc.mainFlow.map((step, si) => (
                <div key={si} className={styles.stepRow}>
                  <span className={styles.stepNum}>{si + 1}.</span>
                  <Dropdown
                    placeholder="Actor"
                    options={[{ label: 'User', value: 'user' }, { label: 'System', value: 'system' }]}
                    defaultValue={step.actor}
                    onChange={e => updateStep(idx, si, { actor: e.target.value as 'user' | 'system' })}
                  />
                  <Input
                    placeholder="Действие"
                    value={step.action}
                    onChange={e => updateStep(idx, si, { action: e.target.value })}
                  />
                  <Dropdown
                    placeholder="Экран"
                    options={screenOptions}
                    defaultValue={step.screenId ?? ''}
                    onChange={e => updateStep(idx, si, { screenId: e.target.value || undefined })}
                  />
                  <Button type="ghost" sentiment="danger" size="small" onClick={() => removeStep(idx, si)}>×</Button>
                </div>
              ))}
            </div>

            <div className={styles.errorSection}>
              <div className={styles.sectionLabel}>
                Ошибки
                <Button type="ghost" sentiment="secondary" size="small" onClick={() => addError(idx)}>+ Ошибка</Button>
              </div>
              {uc.errorFlows.map((ef, ei) => (
                <div key={ei} className={styles.errorRow}>
                  <Input
                    placeholder="Условие"
                    value={ef.condition}
                    onChange={e => updateError(idx, ei, { condition: e.target.value })}
                  />
                  <Input
                    placeholder="Решение"
                    value={ef.resolution}
                    onChange={e => updateError(idx, ei, { resolution: e.target.value })}
                  />
                  <Button type="ghost" sentiment="danger" size="small" onClick={() => removeError(idx, ei)}>×</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
