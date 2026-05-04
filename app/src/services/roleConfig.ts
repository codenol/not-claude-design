import type { NorkaRole } from '../features/types'

export interface RoleInfo {
  role: NorkaRole
  label: string
  color: string
}

export interface UserInfo {
  id: string
  name: string
  role: NorkaRole
  initials: string
}

export const ROLES: RoleInfo[] = [
  { role: 'ПО', label: 'ПО', color: '#7C3AED' },
  { role: 'Аналитик', label: 'Аналитик', color: '#2563EB' },
  { role: 'Дизайнер', label: 'Дизайнер', color: '#EC4899' },
  { role: 'Фронтендер', label: 'Фронтендер', color: '#06B6D4' },
  { role: 'Бэкендер', label: 'Бэкендер', color: '#10B981' },
  { role: 'Архитектор', label: 'Архитектор', color: '#F97316' },
  { role: 'Деливери', label: 'Деливери', color: '#D97706' },
  { role: 'QA', label: 'QA', color: '#EF4444' },
]

export const USERS: UserInfo[] = [
  { id: 'u-po-1', name: 'Алексей Соколов', role: 'ПО', initials: 'АС' },
  { id: 'u-po-2', name: 'Марина Волкова', role: 'ПО', initials: 'МВ' },
  { id: 'u-po-3', name: 'Игорь Крылов', role: 'ПО', initials: 'ИК' },
  { id: 'u-po-4', name: 'Светлана Белова', role: 'ПО', initials: 'СБ' },

  { id: 'u-an-1', name: 'Дмитрий Зайцев', role: 'Аналитик', initials: 'ДЗ' },
  { id: 'u-an-2', name: 'Елена Морозова', role: 'Аналитик', initials: 'ЕМ' },
  { id: 'u-an-3', name: 'Николай Ветров', role: 'Аналитик', initials: 'НВ' },
  { id: 'u-an-4', name: 'Ольга Смирнова', role: 'Аналитик', initials: 'ОС' },

  { id: 'u-ds-1', name: 'Анна Фёдорова', role: 'Дизайнер', initials: 'АФ' },
  { id: 'u-ds-2', name: 'Павел Гришин', role: 'Дизайнер', initials: 'ПГ' },
  { id: 'u-ds-3', name: 'Юлия Новикова', role: 'Дизайнер', initials: 'ЮН' },
  { id: 'u-ds-4', name: 'Максим Орлов', role: 'Дизайнер', initials: 'МО' },

  { id: 'u-fe-1', name: 'Сергей Петров', role: 'Фронтендер', initials: 'СП' },
  { id: 'u-fe-2', name: 'Татьяна Иванова', role: 'Фронтендер', initials: 'ТИ' },
  { id: 'u-fe-3', name: 'Артём Козлов', role: 'Фронтендер', initials: 'АК' },
  { id: 'u-fe-4', name: 'Дарья Соколова', role: 'Фронтендер', initials: 'ДС' },

  { id: 'u-be-1', name: 'Роман Быков', role: 'Бэкендер', initials: 'РБ' },
  { id: 'u-be-2', name: 'Виктория Лосева', role: 'Бэкендер', initials: 'ВЛ' },
  { id: 'u-be-3', name: 'Глеб Кузнецов', role: 'Бэкендер', initials: 'ГК' },
  { id: 'u-be-4', name: 'Наталья Ершова', role: 'Бэкендер', initials: 'НЕ' },

  { id: 'u-ar-1', name: 'Андрей Громов', role: 'Архитектор', initials: 'АГ' },
  { id: 'u-ar-2', name: 'Екатерина Ларина', role: 'Архитектор', initials: 'ЕЛ' },
  { id: 'u-ar-3', name: 'Владимир Титов', role: 'Архитектор', initials: 'ВТ' },
  { id: 'u-ar-4', name: 'Людмила Жукова', role: 'Архитектор', initials: 'ЛЖ' },

  { id: 'u-dv-1', name: 'Олег Березин', role: 'Деливери', initials: 'ОБ' },
  { id: 'u-dv-2', name: 'Ксения Попова', role: 'Деливери', initials: 'КП' },
  { id: 'u-dv-3', name: 'Станислав Лебедев', role: 'Деливери', initials: 'СЛ' },
  { id: 'u-dv-4', name: 'Маргарита Осипова', role: 'Деливери', initials: 'МО' },

  { id: 'u-qa-1', name: 'Виктор Синицын', role: 'QA', initials: 'ВС' },
  { id: 'u-qa-2', name: 'Алёна Кукушкина', role: 'QA', initials: 'АК' },
  { id: 'u-qa-3', name: 'Денис Филин', role: 'QA', initials: 'ДФ' },
  { id: 'u-qa-4', name: 'Ирина Сорокина', role: 'QA', initials: 'ИС' },
]

export const ROLE_MAP: Record<NorkaRole, RoleInfo> = Object.fromEntries(
  ROLES.map(r => [r.role, r])
) as Record<NorkaRole, RoleInfo>

export function getRoleColor(role: NorkaRole): string {
  return ROLE_MAP[role]?.color ?? '#999999'
}

export function getUsersByRole(role: NorkaRole): UserInfo[] {
  return USERS.filter(u => u.role === role)
}
