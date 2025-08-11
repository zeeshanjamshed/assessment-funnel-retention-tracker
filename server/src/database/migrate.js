const pool = require('./connection')

const createTables = async () => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        user_agent TEXT,
        ip_address INET,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(quiz_id, session_id)
      )
    `)
    

    await client.query(`
      CREATE TABLE IF NOT EXISTS slide_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        slide_id VARCHAR(255) NOT NULL,
        slide_title VARCHAR(500),
        slide_sequence INTEGER NOT NULL,
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_quiz_id ON sessions(quiz_id)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_slide_visits_session_id ON slide_visits(session_id)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_slide_visits_slide_sequence ON slide_visits(slide_sequence)
    `)
    
    await client.query('COMMIT')
    console.log('Database tables created successfully!')
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating tables:', error)
    throw error
  } finally {
    client.release()
  }
}


if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { createTables }
