const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

const trackingRoutes = require('./routes/tracking')
const analyticsRoutes = require('./routes/analytics')
const quizRoutes = require('./routes/quizzes')

const app = express()
const PORT = process.env.PORT || 3001


app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
    origin: function (origin, callback) {

        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'https://offer.nebroo.com',
            'http://localhost:3001',
            'null'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || origin === 'null') {
            return callback(null, true);
        }

        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/funnel-tracker.js', express.static(path.join(__dirname, '../../public/funnel-tracker.js')))


app.use('/api/track', trackingRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/quizzes', quizRoutes)


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})


app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
