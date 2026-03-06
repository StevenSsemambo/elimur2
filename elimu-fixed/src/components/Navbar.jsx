import { Link, useLocation } from 'react-router-dom'
import { SoundEngine } from '../utils/soundEngine.js'

const LINKS=[
  {path:'/dashboard',icon:'🏠',label:'Home'},
  {path:'/search',   icon:'🔍',label:'Search'},
  {path:'/bookmarks',icon:'🔖',label:'Saved'},
  {path:'/progress', icon:'📊',label:'Progress'},
  {path:'/settings', icon:'⚙️',label:'Settings'},
]

export default function Navbar(){
  const loc=useLocation()
  return(
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t" style={{background:'rgba(12,15,26,0.97)',backdropFilter:'blur(20px)',borderColor:'#1A2035'}}>
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {LINKS.map(l=>{
          const active=loc.pathname===l.path
          return(
            <Link key={l.path} to={l.path} onClick={()=>SoundEngine.tap()}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all"
              style={{color:active?'#F59E0B':'#3A4560'}}>
              <span className={`text-xl transition-transform ${active?'scale-110':''}`}>{l.icon}</span>
              <span className="text-xs font-semibold">{l.label}</span>
              {active&&<div className="w-1 h-1 rounded-full" style={{background:'#F59E0B'}}/>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
