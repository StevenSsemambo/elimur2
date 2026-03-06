import Dexie from 'dexie'
export const db = new Dexie('ElimuLearnDB')
db.version(1).stores({students:'++id,name,class_level,created_at,supabase_id',progress:'++id,student_id,subject,topic_id,lesson_id,status,synced',quiz_attempts:'++id,student_id,lesson_id,attempted_at,synced',bookmarks:'++id,student_id,lesson_id,created_at',settings:'key'})
db.version(2).stores({students:'++id,name,class_level,created_at,supabase_id',progress:'++id,student_id,subject,topic_id,lesson_id,status,synced',quiz_attempts:'++id,student_id,lesson_id,attempted_at,synced',bookmarks:'++id,student_id,lesson_id,created_at',settings:'key',achievements:'++id,student_id,badge_id,earned_at',daily_goals:'++id,student_id,date'})
db.version(3).stores({students:'++id,name,class_level,created_at,supabase_id',progress:'++id,student_id,subject,topic_id,lesson_id,status,synced',quiz_attempts:'++id,student_id,lesson_id,attempted_at,synced',bookmarks:'++id,student_id,lesson_id,created_at',settings:'key',achievements:'++id,student_id,badge_id,earned_at',daily_goals:'++id,student_id,date',lesson_notes:'++id,student_id,lesson_id'})
export default db
