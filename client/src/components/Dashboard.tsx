'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Target } from 'lucide-react'
import QuizSelector from './QuizSelector'
import FunnelChart from './FunnelChart'
import MetricsCards from './MetricsCards'
import SlideBreakdown from './SlideBreakdown'
import { QuizAnalytics } from '@/types'

export default function Dashboard() {
  const [selectedQuiz, setSelectedQuiz] = useState<string>('')
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async (quizId: string) => {
    if (!quizId) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.API_URL}/api/analytics/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedQuiz) {
      fetchAnalytics(selectedQuiz)
    }
  }, [selectedQuiz])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Funnel Retention Tracker
          </h1>
        </div>
        <p className="text-gray-600">
          Track and analyze quiz completion rates and user drop-off points
        </p>
      </div>

      <div className="mb-8">
        <QuizSelector
          selectedQuiz={selectedQuiz}
          onQuizSelect={setSelectedQuiz}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {analytics && !loading && (
        <div className="space-y-8">
          <MetricsCards analytics={analytics} />
          <SlideBreakdown analytics={analytics} />
          <FunnelChart analytics={analytics} />
        </div>
      )}

      {!selectedQuiz && !loading && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Quiz to View Analytics
          </h3>
          <p className="text-gray-600">
            Choose a quiz from the dropdown above to see detailed funnel analytics
          </p>
        </div>
      )}
    </div>
  )
}
