import { useState, useEffect, useCallback } from 'react'
import type { AppRoute } from '../features/routes'

function parseUrl(pathname: string): AppRoute {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return { page: 'entry' }
  if (segments[0] === 'libraries') return { page: 'libraries' }
  if (segments[0] === 'projects' && segments.length === 1) return { page: 'projects' }

  // /projects/:projectId/:pageId/:featureId
  if (segments[0] === 'projects' && segments.length === 4) {
    const verMatch = segments[3].match(/^v(\d+)\.(\d+)$/)
    return {
      page: 'feature',
      projectId: segments[1],
      pageId: segments[2],
      featureId: verMatch ? segments[3] : segments[3],
    }
  }

  // /projects/:projectId/:pageId/:featureId/v:major.:minor
  if (segments[0] === 'projects' && segments.length === 5) {
    const verMatch = segments[4].match(/^v(\d+)\.(\d+)$/)
    if (verMatch) {
      return {
        page: 'feature-version',
        projectId: segments[1],
        pageId: segments[2],
        featureId: segments[3],
        major: parseInt(verMatch[1], 10),
        minor: parseInt(verMatch[2], 10),
      }
    }
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
