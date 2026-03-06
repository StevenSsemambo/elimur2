import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext.jsx'
import { achievementsDB, progressDB } from '../db/progressDB.js'
import Navbar from '../components/Navbar.jsx'

export default function Achievements() {
  const { student } = useUser()
  const [badges, setBadges] = useState([])
  const [newBadges, setNewBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student) return
    async function load() {
      const progress = await progressDB.getAllProgress(student.id)
      // Check for newly earned badges
      const fresh = await achievementsDB.checkAndAward(student.id, progress, student)
      if (fresh.length > 0) setNewBadges(fresh)
      const all = await achievementsDB.getEarned(student.id)
      setBadges(all)
      setLoading(false)
    }
    load()
  }, [student])

  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  return (
    <div className="min-h-screen  pb-24" style={{background:"#0C0F1A"}}>
      <div className=" px-5 pt-12 pb-6 border-b border-night-border">
        <h1 className="text-2xl font-display font-bold text-white">🏅 Achievements</h1>
        <p className="text-slate-400 text-sm">{earned.length} / {badges.length} badges earned</p>
      </div>

      {/* New badge popup */}
      {newBadges.length > 0 && (
        <div className="mx-5 mt-4 bg-gradient-to-r from-teal-900 to-teal-800 border border-teal-600 rounded-2xl p-4 text-center">
          <p className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">🎉 New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</p>
          <div className="flex justify-center gap-3 mt-2">
            {newBadges.map(b => (
              <div key={b.id} className="text-center">
                <div className="text-3xl">{b.icon}</div>
                <div className="text-white text-xs font-semibold mt-1">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 mt-5 space-y-5">
        {/* XP Progress */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-sm">⭐ Total XP</span>
            <span className="text-teal-400 font-bold">{student?.total_xp || 0} XP</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Bronze', xp: 100, color: 'bg-amber-700' },
              { label: 'Silver', xp: 500, color: 'bg-slate-400' },
              { label: 'Gold', xp: 1000, color: 'bg-yellow-400' },
            ].map(tier => {
              const pct = Math.min(100, ((student?.total_xp || 0) / tier.xp) * 100)
              const done = (student?.total_xp || 0) >= tier.xp
              return (
                <div key={tier.label} className={`rounded-xl p-2 text-center ${done ? '' : ''}`}>
                  <div className={`text-xs font-bold ${done ? 'text-white' : 'text-slate-500'}`}>{done ? '✅' : '🔒'} {tier.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tier.xp} XP</div>
                  <div className="h-1 bg-slate-600 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${tier.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Earned badges */}
        {earned.length > 0 && (
          <>
            <h2 className="text-white font-display font-bold">Earned ({earned.length})</h2>
            <div className="grid grid-cols-2 gap-3">
              {earned.map(b => (
                <div key={b.id} className="glass rounded-2xl p-4 border border-teal-900/50">
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <div className="text-white font-semibold text-sm">{b.label}</div>
                  <div className="text-slate-400 text-xs mt-1">{b.desc}</div>
                  {b.earned_at && (
                    <div className="text-teal-500 text-xs mt-2">
                      {new Date(b.earned_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Locked badges */}
        {locked.length > 0 && (
          <>
            <h2 className="text-slate-400 font-display font-bold">Locked ({locked.length})</h2>
            <div className="grid grid-cols-2 gap-3">
              {locked.map(b => (
                <div key={b.id} className="rounded-2xl p-4 /50 border border-night-border/50 opacity-60">
                  <div className="text-3xl mb-2 grayscale">{b.icon}</div>
                  <div className="text-slate-400 font-semibold text-sm">{b.label}</div>
                  <div className="text-slate-500 text-xs mt-1">{b.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}
