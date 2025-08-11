const express = require('express')
const pool = require('../database/connection')

const router = express.Router()


router.get('/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params
    const client = await pool.connect()
    
    try {

      const totalSessionsResult = await client.query(
        'SELECT COUNT(*) as total FROM sessions WHERE quiz_id = $1',
        [quizId]
      )
      const totalSessions = parseInt(totalSessionsResult.rows[0].total)
      
      if (totalSessions === 0) {
        return res.json({
          quizId,
          totalSessions: 0,
          completionRate: 0,
          slideData: []
        })
      }
      

      const slideDataResult = await client.query(`
        SELECT 
          sv.slide_id,
          sv.slide_title,
          sv.slide_sequence,
          COUNT(DISTINCT sv.session_id) as user_count
        FROM slide_visits sv
        JOIN sessions s ON sv.session_id = s.id
        WHERE s.quiz_id = $1
        GROUP BY sv.slide_id, sv.slide_title, sv.slide_sequence
        ORDER BY sv.slide_sequence
      `, [quizId])
      
      const slideData = slideDataResult.rows.map(row => ({
        slide_id: row.slide_id,
        slide_title: row.slide_title,
        slide_sequence: parseInt(row.slide_sequence),
        user_count: parseInt(row.user_count)
      }))
      

      const maxSlideVisited = slideData.length > 0 ? Math.max(...slideData.map(s => s.slide_sequence)) : 0
      
      let completedUsers = 0
      let finalSlideNumber = maxSlideVisited
      
      if (maxSlideVisited >= 10) {
        completedUsers = slideData.find(slide => slide.slide_sequence === maxSlideVisited)?.user_count || 0
      }
      
      const completionRate = totalSessions > 0 ? (completedUsers / totalSessions) * 100 : 0
      
      res.json({
        quizId,
        totalSessions,
        completedUsers,
        droppedOffUsers: totalSessions - completedUsers,
        completionRate: Math.round(completionRate * 10) / 10,
        finalSlideNumber,
        slideData
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})


router.get('/:quizId/dropoff', async (req, res) => {
  try {
    const { quizId } = req.params
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        WITH slide_progression AS (
          SELECT 
            sv.slide_sequence,
            sv.slide_title,
            COUNT(DISTINCT sv.session_id) as users_reached,
            LAG(COUNT(DISTINCT sv.session_id)) OVER (ORDER BY sv.slide_sequence) as prev_users
          FROM slide_visits sv
          JOIN sessions s ON sv.session_id = s.id
          WHERE s.quiz_id = $1
          GROUP BY sv.slide_sequence, sv.slide_title
          ORDER BY sv.slide_sequence
        )
        SELECT 
          slide_sequence,
          slide_title,
          users_reached,
          COALESCE(prev_users - users_reached, 0) as dropped_off,
          CASE 
            WHEN prev_users > 0 THEN ROUND(((prev_users - users_reached)::decimal / prev_users) * 100, 2)
            ELSE 0
          END as drop_off_rate
        FROM slide_progression
      `, [quizId])
      
      res.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching drop-off analysis:', error)
    res.status(500).json({ error: 'Failed to fetch drop-off analysis' })
  }
})

module.exports = router
