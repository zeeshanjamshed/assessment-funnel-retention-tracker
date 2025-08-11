'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface QuizSelectorProps {
  selectedQuiz: string
  onQuizSelect: (quizId: string) => void
}

interface Quiz {
  quiz_id: string
  total_sessions: number
  last_activity: string
}

export default function QuizSelector({ selectedQuiz, onQuizSelect }: QuizSelectorProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${process.env.API_URL}/api/quizzes`)
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (quizId: string) => {
    onQuizSelect(quizId)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Quiz
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <span className="block truncate">
            {selectedQuiz || 'Choose a quiz...'}
          </span>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            {quizzes.length === 0 ? (
              <div className="px-4 py-2 text-gray-500">No quizzes found</div>
            ) : (
              quizzes.map((quiz) => (
                <button
                  key={quiz.quiz_id}
                  onClick={() => handleSelect(quiz.quiz_id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{quiz.quiz_id}</span>
                    <span className="text-sm text-gray-500">
                      {quiz.total_sessions} sessions
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}