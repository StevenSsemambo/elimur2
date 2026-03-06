import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { progressDB, quizDB, goalsDB } from '../db/progressDB.js'
import { calculateScore } from '../utils/scoring.js'
import { SoundEngine, Haptics } from '../utils/soundEngine.js'

const QUESTION_TIME = 30

export default function Quiz() {
  const { lessonId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { student, refreshStudent } = useUser()
  const lesson=state?.lesson, subject=state?.subject, topicId=state?.topicId
  const [cur,setCur]=useState(0)
  const [answers,setAnswers]=useState([])
  const [selected,setSelected]=useState(null)
  const [confirmed,setConfirmed]=useState(false)
  const [timeLeft,setTimeLeft]=useState(QUESTION_TIME)
  const [active,setActive]=useState(true)
  const startTime=useRef(Date.now())
  const timerRef=useRef(null)
  const confirmRef=useRef(null)
  const questions=lesson?.quiz?.questions||[]
  const q=questions[cur]

  useEffect(()=>{
    if(!active||confirmed)return
    setTimeLeft(QUESTION_TIME)
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){clearInterval(timerRef.current);confirmRef.current?.('__timeout__');return 0}
        return t-1
      })
    },1000)
    return()=>clearInterval(timerRef.current)
  },[cur,active])

  function pick(opt){if(confirmed)return;SoundEngine.tap();Haptics.tap();setSelected(opt)}

  async function confirm(forced){
    const ans=forced||selected
    if(!ans&&!forced)return
    clearInterval(timerRef.current);setActive(false)
    const final=forced==='__timeout__'?null:ans
    const ok=final===q.answer
    if(ok){SoundEngine.correct();Haptics.correct()}else{SoundEngine.wrong();Haptics.wrong()}
    const newAnswers=[...answers,final]
    setAnswers(newAnswers);setConfirmed(true)
    setTimeout(async()=>{
      if(cur+1<questions.length){
        setCur(c=>c+1);setSelected(null);setConfirmed(false);setActive(true)
      }else{
        const score=calculateScore(newAnswers,questions)
        const timeTaken=Math.round((Date.now()-startTime.current)/1000)
        SoundEngine.quizComplete()
        if(student){
          await progressDB.completeLesson(student.id,lessonId,score,timeTaken)
          await quizDB.saveAttempt(student.id,lessonId,newAnswers,score,timeTaken)
          await goalsDB.incrementCompleted(student.id)
          refreshStudent()
        }
        navigate(`/results/${lessonId}`,{state:{lesson,questions,answers:newAnswers,score,subject,topicId}})
      }
    },1300)
  }
  confirmRef.current=confirm

  if(!lesson||questions.length===0)return(
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0C0F1A'}}>
      <div className="text-center px-6"><p className="text-slate-400 mb-4">No quiz available.</p><button onClick={()=>navigate(-1)} style={{color:'#14B8A6'}}>← Go back</button></div>
    </div>
  )

  const timerPct=timeLeft/QUESTION_TIME*100
  const timerCol=timeLeft>15?'#14B8A6':timeLeft>7?'#F59E0B':'#EF4444'
  const isOk=confirmed&&selected===q.answer
  const isWrong=confirmed&&selected!==q.answer&&selected!==null

  return(
    <div className="min-h-screen flex flex-col" style={{background:'#0C0F1A'}}>
      <div className="px-5 pt-10 pb-4 border-b" style={{background:'#131829',borderColor:'#1A2035'}}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={()=>navigate(-1)} className="text-slate-400 text-sm">✕ Exit</button>
          <span className="text-slate-400 text-sm font-semibold">{cur+1} / {questions.length}</span>
          <span className="text-sm font-bold" style={{color:'#F59E0B'}}>+{lesson.xp_reward} XP</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{background:'#1A2035'}}>
          <div className="h-full rounded-full transition-all duration-400" style={{width:`${cur/questions.length*100}%`,background:'linear-gradient(90deg,#0D9488,#F59E0B)'}}/>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono w-6 text-right" style={{color:timerCol}}>{timeLeft}s</span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{background:'#1A2035'}}>
            <div className="h-full rounded-full" style={{width:`${timerPct}%`,background:timerCol,transition:'width 1s linear,background 0.5s'}}/>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        <p className="text-white font-display font-extrabold text-lg leading-snug mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt,i)=>{
            let style={background:'#1A2035',border:'1px solid #252D45'},cls=''
            if(!confirmed){
              if(selected===opt)style={background:'rgba(13,148,136,0.15)',border:'2px solid #14B8A6'}
            }else{
              if(opt===q.answer){style={background:'rgba(34,197,94,0.12)',border:'2px solid #22C55E'};cls='correct-answer'}
              else if(opt===selected){style={background:'rgba(239,68,68,0.12)',border:'2px solid #EF4444'};cls='wrong-answer'}
              else{style={background:'#0C0F1A',border:'1px solid #131829',opacity:0.4}}
            }
            return(
              <button key={i} onClick={()=>pick(opt)} className={`w-full rounded-2xl p-4 text-left transition-all active:scale-95 ${cls}`} style={style}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{background:'#252D45',color:'#94A3B8'}}>
                    {['A','B','C','D'][i]}
                  </span>
                  <span className="text-sm text-slate-200 leading-snug">{opt}</span>
                </div>
              </button>
            )
          })}
        </div>
        {confirmed&&(
          <div className="mt-4 rounded-2xl p-4" style={{background:isOk?'rgba(34,197,94,0.06)':'rgba(239,68,68,0.06)',border:`1px solid ${isOk?'rgba(34,197,94,0.25)':confirmed&&!selected?'#252D45':'rgba(239,68,68,0.25)'}`}}>
            <p className="text-sm font-bold mb-1" style={{color:isOk?'#4ADE80':!selected?'#94A3B8':'#FB7185'}}>
              {isOk?'✅ Correct!':!selected?'⏰ Time\'s up!':'❌ Not quite!'}
            </p>
            <p className="text-sm text-slate-400">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-8">
        <button onClick={()=>confirm()} disabled={!selected||confirmed}
          className="w-full py-4 rounded-2xl font-display font-extrabold text-lg text-white transition-all active:scale-95 disabled:opacity-30"
          style={{background:!selected||confirmed?'#1A2035':'linear-gradient(135deg,#0D9488,#0369A1)'}}>
          {confirmed?(cur+1<questions.length?'Next →':'See Results →'):'Confirm Answer'}
        </button>
      </div>
    </div>
  )
}
