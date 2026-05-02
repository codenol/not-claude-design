import styles from './Logo.module.css'

export type LogoVariant = 'genom' | 'logo' | 'spektr' | 'vision' | 'spektr-s3' | 'spektr-ai'

export interface LogoProps {
  variant?: LogoVariant
  className?: string
}

export function Logo({ variant = 'genom', className }: LogoProps) {
  return (
    <div className={`${styles.logo} ${styles[variant]} ${className || ''}`}>
      {variant === 'genom' && (
        <div className={styles['genom-svg']}>
          <svg viewBox="0 0 99 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 19C13.5 16.5 14.5 14.5 16.5 13C18.5 11.5 21 10.5 24 10C27 9.5 29.5 9 31.5 8.5C33.5 8 35 7 36 5.5C37 4 37.5 2 37.5 0H42C42 2.5 41 4.5 39 6C37 7.5 34.5 8.5 31.5 9C28.5 9.5 26 10 24 10.5C22 11 20.5 12 19.5 13.5C18.5 15 18 17 18 19H13.5Z" fill="#11244D"/>
            <path d="M0 19V0H4.5V19H0Z" fill="#11244D"/>
            <path d="M55 19V0H59.5V19H55Z" fill="#11244D"/>
            <path d="M68 19C68 16.5 69 14.5 71 13C73 11.5 75.5 10.5 78.5 10C81.5 9.5 84 9 86 8.5C88 8 89.5 7 90.5 5.5C91.5 4 92 2 92 0H96.5C96.5 2.5 95.5 4.5 93.5 6C91.5 7.5 89 8.5 86 9C83 9.5 80.5 10 78.5 10.5C76.5 11 75 12 74 13.5C73 15 72.5 17 72.5 19H68Z" fill="#11244D"/>
            <path d="M45 19V0H49.5V19H45Z" fill="#11244D"/>
          </svg>
        </div>
      )}

      {variant === 'logo' && (
        <span className={styles['logo-text']}>ЛОГОТИП</span>
      )}

      {variant === 'spektr' && (
        <div className={styles['spektr-svg']}>
          <svg viewBox="0 0 114 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="28" fontFamily="TT Hoves, sans-serif" fontWeight="500" fontSize="31" fill="#00BEC8">^</text>
            <text x="22" y="28" fontFamily="TT Hoves, sans-serif" fontWeight="500" fontSize="31" fill="#11244D">спектр</text>
          </svg>
        </div>
      )}

      {variant === 'vision' && (
        <span className={styles['vision-text']}>
          <span className={styles['vision-caret']}>^</span>
          <span className={styles['vision-name']}>визион</span>
        </span>
      )}

      {variant === 'spektr-s3' && (
        <span className={styles['vision-text']}>
          <span className={styles['vision-caret']}>^</span>
          <span className={styles['vision-name']}>спектр.S3</span>
        </span>
      )}

      {variant === 'spektr-ai' && (
        <div className={styles['spektr-ai-svg']}>
          <svg viewBox="0 0 140 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="22" fontFamily="TT Hoves, sans-serif" fontWeight="500" fontSize="22" fill="#00BEC8">^</text>
            <text x="18" y="22" fontFamily="TT Hoves, sans-serif" fontWeight="500" fontSize="22" fill="#11244D">спектр</text>
            <text x="90" y="22" fontFamily="TT Hoves, sans-serif" fontWeight="500" fontSize="22" fill="#11244D"> ИИ</text>
          </svg>
        </div>
      )}
    </div>
  )
}
