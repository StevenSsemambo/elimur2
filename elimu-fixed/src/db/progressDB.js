import db from './schema.js'

export const progressDB = {
  async getOrCreate(studentId, lessonId, subject, topicId) {
    let rec = await db.progress.where({ student_id: studentId, lesson_id: lessonId }).first()
    if (!rec) {
      const id = await db.progress.add({
        student_id: studentId, subject, topic_id: topicId, lesson_id: lessonId,
        status: 'not_started', score: 0, best_score: 0, attempts: 0,
        time_spent: 0, completed_at: null, synced: false
      })
      rec = await db.progress.get(id)
    }
    return rec
  },

  async markInProgress(studentId, lessonId) {
    const rec = await db.progress.where({ student_id: studentId, lesson_id: lessonId }).first()
    if (rec && rec.status === 'not_started') {
      await db.progress.update(rec.id, { status: 'in_progress', synced: false })
    }
  },

  async completeLesson(studentId, lessonId, score, timeSpent) {
    const rec = await db.progress.where({ student_id: studentId, lesson_id: lessonId }).first()
    if (rec) {
      const best = Math.max(rec.best_score || 0, score)
      await db.progress.update(rec.id, {
        status: 'completed', score, best_score: best,
        attempts: (rec.attempts || 0) + 1,
        time_spent: (rec.time_spent || 0) + timeSpent,
        completed_at: new Date().toISOString(), synced: false
      })
    }
    // Award XP
    const xpGain = score >= 70 ? 50 : 20
    const student = await db.students.get(studentId)
    if (student) {
      await db.students.update(studentId, {
        total_xp: (student.total_xp || 0) + xpGain,
        last_active: new Date().toISOString()
      })
    }
    return xpGain
  },

  async getSubjectProgress(studentId, subject) {
    return db.progress.where({ student_id: studentId, subject }).toArray()
  },

  async getAllProgress(studentId) {
    return db.progress.where('student_id').equals(studentId).toArray()
  },

  async getLessonProgress(studentId, lessonId) {
    return db.progress.where({ student_id: studentId, lesson_id: lessonId }).first()
  },

  async getStats(studentId) {
    const all = await db.progress.where('student_id').equals(studentId).toArray()
    const completed = all.filter(p => p.status === 'completed')
    const avgScore = completed.length
      ? Math.round(completed.reduce((s, p) => s + p.score, 0) / completed.length)
      : 0
    return { total: all.length, completed: completed.length, avgScore }
  }
}

export const bookmarkDB = {
  async toggle(studentId, lessonId) {
    const existing = await db.bookmarks.where({ student_id: studentId, lesson_id: lessonId }).first()
    if (existing) { await db.bookmarks.delete(existing.id); return false }
    else { await db.bookmarks.add({ student_id: studentId, lesson_id: lessonId, created_at: new Date().toISOString() }); return true }
  },
  async isBookmarked(studentId, lessonId) {
    const b = await db.bookmarks.where({ student_id: studentId, lesson_id: lessonId }).first()
    return !!b
  },
  async getAll(studentId) {
    return db.bookmarks.where('student_id').equals(studentId).toArray()
  }
}

export const quizDB = {
  async saveAttempt(studentId, lessonId, answers, score, timeTaken) {
    return db.quiz_attempts.add({
      student_id: studentId, lesson_id: lessonId,
      answers: JSON.stringify(answers), score, time_taken: timeTaken,
      attempted_at: new Date().toISOString(), synced: false
    })
  },
  async getAttempts(studentId, lessonId) {
    return db.quiz_attempts.where({ student_id: studentId, lesson_id: lessonId }).toArray()
  }
}

export const studentDB = {
  async create(name, classLevel, avatar) {
    const id = await db.students.add({
      name, class_level: classLevel, avatar,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      total_xp: 0, streak_days: 1, supabase_id: null
    })
    return db.students.get(id)
  },
  async get(id) { return db.students.get(id) },
  async getAll() { return db.students.toArray() },
  async update(id, data) { return db.students.update(id, data) },
  async updateStreak(id) {
    const student = await db.students.get(id)
    if (!student) return
    const last = new Date(student.last_active)
    const now = new Date()
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) await db.students.update(id, { streak_days: (student.streak_days || 0) + 1, last_active: now.toISOString() })
    else if (diffDays > 1) await db.students.update(id, { streak_days: 1, last_active: now.toISOString() })
    else await db.students.update(id, { last_active: now.toISOString() })
  }
}

export const achievementsDB = {
  BADGES: [
    { id: 'first_lesson',    label: 'First Step',      icon: '🎯', desc: 'Complete your first lesson',           check: (p, s) => p.filter(x => x.status === 'completed').length >= 1 },
    { id: 'five_lessons',    label: 'Getting Started', icon: '📚', desc: 'Complete 5 lessons',                   check: (p, s) => p.filter(x => x.status === 'completed').length >= 5 },
    { id: 'ten_lessons',     label: 'Scholar',         icon: '🏆', desc: 'Complete 10 lessons',                  check: (p, s) => p.filter(x => x.status === 'completed').length >= 10 },
    { id: 'perfect_score',   label: 'Perfectionist',   icon: '💯', desc: 'Score 100% on a quiz',                 check: (p, s) => p.some(x => x.best_score === 100) },
    { id: 'streak_3',        label: 'On a Roll',       icon: '🔥', desc: '3-day study streak',                   check: (p, s) => (s?.streak_days || 0) >= 3 },
    { id: 'streak_7',        label: 'Week Warrior',    icon: '⚡', desc: '7-day study streak',                   check: (p, s) => (s?.streak_days || 0) >= 7 },
    { id: 'streak_30',       label: 'Unstoppable',     icon: '🌟', desc: '30-day study streak',                  check: (p, s) => (s?.streak_days || 0) >= 30 },
    { id: 'math_start',      label: 'Mathematician',   icon: '📐', desc: 'Complete a Maths lesson',              check: (p, s) => p.some(x => x.subject === 'mathematics' && x.status === 'completed') },
    { id: 'physics_start',   label: 'Physicist',       icon: '⚡', desc: 'Complete a Physics lesson',            check: (p, s) => p.some(x => x.subject === 'physics' && x.status === 'completed') },
    { id: 'bio_start',       label: 'Biologist',       icon: '🧬', desc: 'Complete a Biology lesson',            check: (p, s) => p.some(x => x.subject === 'biology' && x.status === 'completed') },
    { id: 'chem_start',      label: 'Chemist',         icon: '🧪', desc: 'Complete a Chemistry lesson',          check: (p, s) => p.some(x => x.subject === 'chemistry' && x.status === 'completed') },
    { id: 'all_subjects',    label: 'Renaissance',     icon: '🌍', desc: 'Complete lessons in all 4 subjects',   check: (p, s) => ['mathematics','physics','biology','chemistry'].every(sub => p.some(x => x.subject === sub && x.status === 'completed')) },
    { id: 'xp_500',          label: 'XP Hunter',       icon: '⭐', desc: 'Earn 500 XP',                          check: (p, s) => (s?.total_xp || 0) >= 500 },
    { id: 'xp_1000',         label: 'XP Master',       icon: '💎', desc: 'Earn 1000 XP',                         check: (p, s) => (s?.total_xp || 0) >= 1000 },
    { id: 'high_scorer',     label: 'High Achiever',   icon: '🎖️', desc: 'Average score above 80%',              check: (p, s) => { const c = p.filter(x => x.status === 'completed'); return c.length >= 3 && c.reduce((a,x) => a+x.score,0)/c.length >= 80 } },
  ],

  async checkAndAward(studentId, progress, student) {
    const earned = await db.achievements.where('student_id').equals(studentId).toArray()
    const earnedIds = new Set(earned.map(e => e.badge_id))
    const newBadges = []
    for (const badge of this.BADGES) {
      if (!earnedIds.has(badge.id) && badge.check(progress, student)) {
        await db.achievements.add({ student_id: studentId, badge_id: badge.id, earned_at: new Date().toISOString() })
        newBadges.push(badge)
      }
    }
    return newBadges
  },

  async getEarned(studentId) {
    const earned = await db.achievements.where('student_id').equals(studentId).toArray()
    const earnedMap = new Map(earned.map(e => [e.badge_id, e.earned_at]))
    return this.BADGES.map(b => ({ ...b, earned: earnedMap.has(b.id), earned_at: earnedMap.get(b.id) || null }))
  }
}

export const goalsDB = {
  async getTodayGoal(studentId) {
    const today = new Date().toISOString().split('T')[0]
    return db.daily_goals.where({ student_id: studentId, date: today }).first()
  },

  async setTodayGoal(studentId, target) {
    const today = new Date().toISOString().split('T')[0]
    const existing = await db.daily_goals.where({ student_id: studentId, date: today }).first()
    if (existing) {
      await db.daily_goals.update(existing.id, { target, updated_at: new Date().toISOString() })
    } else {
      await db.daily_goals.add({ student_id: studentId, date: today, target, completed: 0, updated_at: new Date().toISOString() })
    }
  },

  async incrementCompleted(studentId) {
    const today = new Date().toISOString().split('T')[0]
    const existing = await db.daily_goals.where({ student_id: studentId, date: today }).first()
    if (existing) {
      await db.daily_goals.update(existing.id, { completed: (existing.completed || 0) + 1 })
    }
  },

  async getWeekHistory(studentId) {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const date = d.toISOString().split('T')[0]
      const rec = await db.daily_goals.where({ student_id: studentId, date }).first()
      days.push({ date, target: rec?.target || 2, completed: rec?.completed || 0, met: rec ? (rec.completed || 0) >= (rec.target || 2) : false })
    }
    return days
  }
}

export const notesDB = {
  async get(studentId, lessonId) {
    return db.lesson_notes.where({ student_id: studentId, lesson_id: lessonId }).first()
  },
  async save(studentId, lessonId, text) {
    const ex = await db.lesson_notes.where({ student_id: studentId, lesson_id: lessonId }).first()
    if (ex) await db.lesson_notes.update(ex.id, { text, updated_at: new Date().toISOString() })
    else await db.lesson_notes.add({ student_id: studentId, lesson_id: lessonId, text, updated_at: new Date().toISOString() })
  },
}
