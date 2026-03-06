import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useOffline } from '../hooks/useOffline.js'
import { syncDB } from '../db/syncDB.js'
import { SoundEngine } from '../utils/soundEngine.js'
import Navbar from '../components/Navbar.jsx'

const AVATARS=['🦁','🐯','🦊','🐺','🦅','🐘','🦒','🦓','🐬','🦋']

export default function Settings(){
  const {student,logout,refreshStudent}=useUser()
  const {theme,toggleTheme}=useTheme()
  const offline=useOffline()
  const [syncing,setSyncing]=useState(false)
  const [syncMsg,setSyncMsg]=useState('')
  const [soundOn,setSoundOn]=useState(SoundEngine.isEnabled())

  function toggleSound(){
    const next=!soundOn
    setSoundOn(next);SoundEngine.setEnabled(next)
    if(next)SoundEngine.tap()
  }

  async function handleSync(){
    if(!student||offline)return
    setSyncing(true);setSyncMsg('')
    const r=await syncDB.syncAll(student.id)
    setSyncing(false);setSyncMsg(r.error?`Sync failed: ${r.error}`:`✅ Synced ${r.synced} records`)
  }

  async function shareReport(){
    if(!student)return
    const days=7,txt=`📚 Elimu Learn Progress Report\n${student.name} (${student.class_level})\n🔥 Streak: ${student.streak_days||1} days\n⭐ Total XP: ${student.total_xp||0}\nStudying Math, Physics, Biology & Chemistry — S1 to S6.\nPowered by Elimu Learn (works offline!)`
    try{if(navigator.share)await navigator.share({text:txt});else await navigator.clipboard?.writeText(txt);alert('Report copied!')}catch(e){}
  }

  if(!student)return null

  return(
    <div className="min-h-screen pb-24" style={{background:'#0C0F1A'}}>
      <div className="px-5 pt-12 pb-6 border-b" style={{background:'#131829',borderColor:'#1A2035'}}>
        <h1 className="text-2xl font-display font-extrabold text-white">⚙️ Settings</h1>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {/* Profile */}
        <div className="rounded-2xl p-4 glass">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{AVATARS[student.avatar||0]}</div>
            <div>
              <h2 className="text-white font-display font-extrabold text-lg">{student.name}</h2>
              <p className="text-sm font-semibold" style={{color:'#14B8A6'}}>{student.class_level} Student</p>
              <p className="text-slate-500 text-xs mt-0.5">⭐ {student.total_xp||0} XP · 🔥 {student.streak_days||1} day streak</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/achievements" onClick={()=>SoundEngine.tap()}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 active:scale-95 transition-all"
              style={{background:'#1A2035',border:'1px solid #252D45'}}>
              <span>🏅</span><span className="text-white text-sm font-semibold">Achievements</span>
            </Link>
            <button onClick={shareReport}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 active:scale-95 transition-all"
              style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)'}}>
              <span>📤</span><span className="text-sm font-semibold" style={{color:'#F59E0B'}}>Share Report</span>
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="text-white font-bold mb-4 text-sm">🎨 Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-slate-200 text-sm font-medium">Theme</p><p className="text-slate-500 text-xs mt-0.5">{theme==='dark'?'Dark mode':'Light mode'}</p></div>
              <button onClick={()=>{toggleTheme();SoundEngine.tap()}}
                className={`relative w-14 h-7 rounded-full transition-all ${theme==='light'?'bg-teal-500':'bg-night-surface'}`}
                style={{background:theme==='light'?'#0D9488':'#1A2035',border:'1px solid #252D45'}}>
                <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-all flex items-center justify-center text-sm bg-white`}
                  style={{left:theme==='light'?'calc(100% - 1.75rem)':'0.125rem'}}>
                  {theme==='light'?'☀️':'🌙'}
                </div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-slate-200 text-sm font-medium">Sound Effects</p><p className="text-slate-500 text-xs mt-0.5">{soundOn?'On — quiz sounds active':'Off — silent mode'}</p></div>
              <button onClick={toggleSound}
                className="relative w-14 h-7 rounded-full transition-all"
                style={{background:soundOn?'#0D9488':'#1A2035',border:'1px solid #252D45'}}>
                <div className="absolute top-0.5 w-6 h-6 rounded-full transition-all flex items-center justify-center text-sm bg-white"
                  style={{left:soundOn?'calc(100% - 1.75rem)':'0.125rem'}}>
                  {soundOn?'🔊':'🔇'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/quick-quiz" onClick={()=>SoundEngine.tap()} className="glass rounded-2xl p-3 flex items-center gap-2 active:scale-95 transition-all">
            <span className="text-xl">🎲</span><span className="text-sm font-semibold text-white">Quick Quiz</span>
          </Link>
          <Link to="/focus-timer" onClick={()=>SoundEngine.tap()} className="glass rounded-2xl p-3 flex items-center gap-2 active:scale-95 transition-all">
            <span className="text-xl">⏱</span><span className="text-sm font-semibold text-white">Focus Timer</span>
          </Link>
        </div>

        {/* Sync */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="text-white font-bold mb-2 text-sm">☁️ Cloud Sync</h3>
          <div className={`text-xs mb-3 font-medium ${offline?'text-amber-400':'text-teal-400'}`}>{offline?'📡 Offline — data saved locally':'🌐 Online — sync available'}</div>
          <button onClick={handleSync} disabled={offline||syncing}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{background:'#1A2035',border:'1px solid #252D45',color:'#E2E8F5'}}>
            {syncing?'⏳ Syncing...':'Sync Now to Cloud'}
          </button>
          {syncMsg&&<p className="text-xs text-slate-400 mt-2 text-center">{syncMsg}</p>}
        </div>

        {/* About */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="text-white font-bold mb-2 text-sm">ℹ️ About</h3>
          <div className="space-y-1 text-xs text-slate-500">
            <p>Version 3.0.0 — Savanna Dark</p>
            <p>Works 100% offline after first load</p>
            <p>Built for Ugandan secondary school students</p>
            <p>Math, Physics, Biology, Chemistry · S1–S6</p>
          </div>
        </div>

        <button onClick={()=>{SoundEngine.tap();logout()}}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
          style={{border:'1px solid rgba(239,68,68,0.4)',color:'#FB7185'}}>
          Sign Out / Switch Student
        </button>
      </div>
      <Navbar/>
    </div>
  )
}
