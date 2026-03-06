import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { progressDB } from '../db/progressDB.js'
import Navbar from '../components/Navbar.jsx'

const SUBJECT_FILES = {
  mathematics: {
    s1: ['algebra', 'sets', 'numbers', 'geometry', 'ratio_indices'],
    s2: ['quadratic', 'trigonometry', 'statistics', 'simultaneous'],
    s3: ['functions', 'coordinate_sequences', 'matrices_probability'],
    s4: ['calculus', 'vectors', 'permcomb'],
    s5: ['further_calculus', 'differential_equations', 'complex_numbers', 'mechanics'],
    s6: ['pure_mathematics', 'statistics_probability', 'applied_mathematics'],
  },
  physics: {
    s1: ['forces', 'measurement', 'light', 'energy'],
    s2: ['waves_electricity', 'magnetism_heat'],
    s3: ['radioactivity', 'electromagnetic'],
    s4: ['circular_gravitation'],
    s5: ['mechanics_advanced', 'thermal_physics', 'waves_optics'],
    s6: ['modern_physics', 'quantum_mechanics', 'astrophysics'],
  },
  biology: {
    s1: ['cells', 'photosynthesis_respiration', 'diffusion_osmosis'],
    s2: ['transport', 'digestion_ecology'],
    s3: ['genetics', 'hormones_homeostasis'],
    s4: ['evolution_immunity'],
    s5: ['cell_biology_advanced', 'biochemistry', 'genetics_advanced'],
    s6: ['developmental_biology', 'immunology', 'molecular_biology'],
  },
  chemistry: {
    s1: ['atoms', 'matter', 'bonding'],
    s2: ['acids_periodic', 'reactions_metals'],
    s3: ['organic_rates', 'electrochemistry'],
    s4: ['thermochemistry'],
    s5: ['advanced_organic', 'spectroscopy', 'transition_metals'],
    s6: ['pharmaceuticals', 'polymers', 'green_chemistry'],
  },
}

export default function TopicList() {
  const { subject, topicId } = useParams()
  const { student } = useUser()
  const [lessons, setLessons] = useState([])
  const [topicTitle, setTopicTitle] = useState('')
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const classLevel = student?.class_level?.toLowerCase() || 's1'
      const files = SUBJECT_FILES[subject]?.[classLevel] || []
      let found = []
      for (const file of files) {
        try {
          const mod = await import(`../curriculum/${subject}/${classLevel}/${file}.json`)
          const data = mod.default
          if (data.topic_id === topicId) {
            setTopicTitle(data.topic_title)
            found = data.lessons
            break
          }
        } catch (e) {}
      }
      setLessons(found)
      setLoading(false)
    }
    if (student) {
      load()
      progressDB.getAllProgress(student.id).then(setProgress)
    }
  }, [subject, topicId, student])

  function getStatus(lessonId) {
    const p = progress.find(x => x.lesson_id === lessonId)
    return p?.status || 'not_started'
  }
  function getBestScore(lessonId) {
    const p = progress.find(x => x.lesson_id === lessonId)
    return p?.best_score || 0
  }

  const statusIcon = { completed: '✅', in_progress: '🔄', not_started: '○' }
  const statusColor = { completed: 'text-emerald-400', in_progress: 'text-yellow-400', not_started: 'text-slate-500' }

  return (
    <div className="min-h-screen night-DEFAULT pb-24" style={{background:"#0C0F1A"}}>
      <div className="night-card px-5 pt-12 pb-6 border-b night-border">
        <Link to={`/subject/${subject}`} className="text-slate-400 text-sm mb-3 block">← {subject.charAt(0).toUpperCase() + subject.slice(1)}</Link>
        <h1 className="text-2xl font-display font-extrabold text-white">{topicTitle || topicId}</h1>
        <p className="text-slate-400 text-sm">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="px-5 mt-5 space-y-3">
        {loading && <p className="text-slate-400 text-center py-8">Loading lessons...</p>}
        {!loading && lessons.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-slate-400">Lessons coming soon for this topic!</p>
          </div>
        )}
        {lessons.map((lesson) => {
          const status = getStatus(lesson.id)
          const score = getBestScore(lesson.id)
          return (
            <Link key={lesson.id} to={`/lesson/${lesson.id}`}
              state={{ lesson, subject, topicId }}
              className="glass rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-all block">
              <div className={`text-xl shrink-0 ${statusColor[status]}`}>{statusIcon[status]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{lesson.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-400 text-xs">⏱ {lesson.duration_minutes} min</span>
                  <span className="text-teal-400 text-xs">+{lesson.xp_reward} XP</span>
                  {score > 0 && <span className="text-yellow-400 text-xs">Best: {score}%</span>}
                </div>
              </div>
              <div className="text-slate-500 shrink-0">›</div>
            </Link>
          )
        })}
      </div>
      <Navbar />
    </div>
  )
}
