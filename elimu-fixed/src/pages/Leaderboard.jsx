import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { studentDB } from '../db/progressDB.js'
import Navbar from '../components/Navbar.jsx'

const AVATARS=['🦁','🐯','🦊','🐺','🦅','🐘','🦒','🦓','🐬','🦋']
const MEDALS=['🥇','🥈','🥉']

export default function Leaderboard(){
  const {student}=useUser()
  const navigate=useNavigate()
  const [students,setStudents]=useState([])

  useEffect(()=>{
    studentDB.getAll().then(all=>{
      setStudents(all.sort((a,b)=>(b.total_xp||0)-(a.total_xp||0)))
    })
  },[])

  return(
    <div className="min-h-screen pb-24" style={{background:'#0C0F1A'}}>
      <div className="px-5 pt-12 pb-6 border-b relative overflow-hidden" style={{background:'linear-gradient(180deg,#131829 0%,#0C0F1A 100%)',borderColor:'#1A2035'}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 0%,rgba(245,158,11,0.1) 0%,transparent 70%)'}}/>
        <button onClick={()=>navigate('/dashboard')} className="text-slate-400 text-sm mb-4 block">← Dashboard</button>
        <h1 className="text-2xl font-display font-extrabold text-white">🏆 Household Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">All students on this device</p>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {students.length===0&&(
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-slate-400">No students yet</p>
          </div>
        )}
        {students.map((s,i)=>{
          const isMe=s.id===student?.id
          return(
            <div key={s.id} className={`rounded-2xl p-4 flex items-center gap-4 transition-all card-spring`}
              style={{animationDelay:`${i*0.06}s`,background:isMe?'rgba(245,158,11,0.08)':'#131829',border:`1px solid ${isMe?'rgba(245,158,11,0.3)':'#1A2035'}`}}>
              <div className="text-2xl w-8 text-center">{MEDALS[i]||`${i+1}`}</div>
              <div className="text-3xl">{AVATARS[s.avatar||0]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm flex items-center gap-2">
                  {s.name}{isMe&&<span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'rgba(245,158,11,0.15)',color:'#F59E0B'}}>You</span>}
                </div>
                <div className="text-slate-500 text-xs mt-0.5">{s.class_level} · 🔥 {s.streak_days||1} day streak</div>
              </div>
              <div className="text-right">
                <div className="font-display font-extrabold text-base" style={{color:i===0?'#F59E0B':i===1?'#94A3B8':i===2?'#B45309':'#64748B'}}>
                  {(s.total_xp||0).toLocaleString()}
                </div>
                <div className="text-slate-500 text-xs">XP</div>
              </div>
            </div>
          )
        })}

        {students.length===1&&(
          <div className="glass rounded-2xl p-4 text-center mt-4">
            <p className="text-slate-400 text-sm">👨‍👩‍👧 Share this device with family members to see the household leaderboard!</p>
          </div>
        )}
      </div>
      <Navbar/>
    </div>
  )
}
