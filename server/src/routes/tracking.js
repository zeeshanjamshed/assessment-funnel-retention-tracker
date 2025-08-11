const express = require('express')
const pool = require('../database/connection')

const router = express.Router()


router.post('/entry', async (req, res) => {
    try {
        const { quizId, sessionId, userAgent } = req.body

        let ipAddress = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
            req.ip ||
            'unknown'

        if (ipAddress === '::1') {
            ipAddress = '127.0.0.1'
        } else if (ipAddress && ipAddress.includes(',')) {
            ipAddress = ipAddress.split(',')[0].trim()
        }

        if (!ipAddress || ipAddress === 'unknown' || ipAddress === 'localhost') {
            ipAddress = '127.0.0.1'
        }

        if (!quizId || !sessionId) {
            return res.status(400).json({ error: 'quizId and sessionId are required' })
        }



        const client = await pool.connect()

        try {

            await client.query(`
        INSERT INTO sessions (quiz_id, session_id, user_agent, ip_address)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (quiz_id, session_id) 
        DO UPDATE SET updated_at = NOW()
      `, [quizId, sessionId, userAgent, ipAddress])

            res.json({ success: true, message: 'Entry tracked successfully' })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error tracking entry:', error)
        res.status(500).json({ error: 'Failed to track entry' })
    }
})


router.post('/slide', async (req, res) => {
    try {
        const { quizId, sessionId, slideId, slideTitle, slideSequence } = req.body

        if (!quizId || !sessionId || !slideId || slideSequence === undefined) {
            return res.status(400).json({
                error: 'quizId, sessionId, slideId, and slideSequence are required'
            })
        }

        const client = await pool.connect()

        try {

            const sessionResult = await client.query(
                'SELECT id FROM sessions WHERE quiz_id = $1 AND session_id = $2',
                [quizId, sessionId]
            )

            if (sessionResult.rows.length === 0) {
                return res.status(404).json({ error: 'Session not found' })
            }

            const sessionUuid = sessionResult.rows[0].id


            const existingVisit = await client.query(`
        SELECT id FROM slide_visits 
        WHERE session_id = $1 AND slide_id = $2
      `, [sessionUuid, slideId])

            if (existingVisit.rows.length === 0) {

                await client.query(`
          INSERT INTO slide_visits (session_id, slide_id, slide_title, slide_sequence)
          VALUES ($1, $2, $3, $4)
        `, [sessionUuid, slideId, slideTitle, slideSequence])
            }

            res.json({ success: true, message: 'Slide visit tracked successfully' })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error tracking slide visit:', error)
        res.status(500).json({ error: 'Failed to track slide visit' })
    }
})

module.exports = router
