import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TeamMember } from '@/types/database'
import { fetchTeam, type TeamErrorCode } from './team-api'

export function useTeam() {
  const [loading, setLoading] = useState(Boolean(supabase))
  const [members, setMembers] = useState<TeamMember[]>([])
  const [error, setError] = useState<TeamErrorCode | null>(null)

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchTeam>>) => {
    setMembers(result.members)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    let alive = true
    void fetchTeam().then((result) => {
      if (alive) apply(result)
    })
    return () => {
      alive = false
    }
  }, [apply])

  const reload = useCallback(async () => {
    setLoading(true)
    apply(await fetchTeam())
  }, [apply])

  return { loading, members, error, reload }
}
