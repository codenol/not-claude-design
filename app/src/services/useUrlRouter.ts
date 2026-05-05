import { useState, useEffect, useCallback } from 'react'
import type { AppRoute } from '../features/routes'
import type { FeatureStage } from '../features/types'

const VALID_STAGES: FeatureStage[] = ['draft', 'analytics', 'prototypes', 'discussion', 'final', 'published']

function isValiStage(s: string): s is FeatureStage {
  return VALID_STAGES.includes(s as FeatureStage)
}

function parseUrl(pathname: string): AppRoute {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return { page: 'entry' }
  if (segments[0] === 'libraries') return { page: 'libraries' }
  if (segments[0] === 'projects' && segments.length === 1) return { page: 'projects' }

  // /projects/:projectId/:pageId/:featureId[/v:major.:minor[/:stage]]
  if (segments[0] === 'projects' && (segments.length === 4 || segments.length === 5 || segments.length === 6)) {
    const base: any = {
      page: 'feature',
      projectId: segments[1],
      pageId: segments[2],
      featureId: segments[3],
    }

    // /projects/:projectId/:pageId/:featureId/v:major.:minor[/:stage]
    if (segments.length >= 5) {
      const verMatch = segments[4].match(/^v(\d+)\.(\d+)$/)
      if (verMatch) {
        base.page = 'feature-version'
        base.major = parseInt(verMatch[1], 10)
        base.minor = parseInt(verMatch[2], 10)
        if (segments.length === 6 && isValiStage(segments[5])) {
          base.stage = segments[5]
        }
        return base
      }
    }

    // /projects/:projectId/:pageId/:featureId[/:stage]
    if (segments.length === 5 && isValiStage(segments[4])) {
      base.stage = segments[4]
      return base
    }

    return base
  }

  return { page: 'projects' }
}

export function useUrlRouter() {
  const [route, setRoute] = useState<AppRoute>(() => parseUrl(window.location.pathname))

  useEffect(() => {
    const handler = () => setRoute(parseUrl(window.location.pathname))
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const navigate = useCallback((url: string) => {
    window.history.pushState(null, '', url)
    setRoute(parseUrl(url))
  }, [])

  return { route, navigate }
}
