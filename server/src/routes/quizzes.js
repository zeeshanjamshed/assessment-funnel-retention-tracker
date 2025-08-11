const express = require('express')
const pool = require('../database/connection')

const router = express.Router()


router.get('/', async (req, res) => {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          quiz_id,
          COUNT(*) as total_sessions,
          MAX(created_at) as last_activity
        FROM sessions
        GROUP BY quiz_id
        ORDER BY last_activity DESC
      `)
      
      const quizzes = result.rows.map(row => ({
        quiz_id: row.quiz_id,
        total_sessions: parseInt(row.total_sessions),
        last_activity: row.last_activity
      }))
      
      res.json(quizzes)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    res.status(500).json({ error: 'Failed to fetch quizzes' })
  }
})

module.exports = router
