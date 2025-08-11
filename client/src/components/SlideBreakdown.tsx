'use client'

import { QuizAnalytics } from '@/types'
import { Users, TrendingDown, ArrowDown } from 'lucide-react'

interface SlideBreakdownProps {
  analytics: QuizAnalytics
}

export default function SlideBreakdown({ analytics }: SlideBreakdownProps) {  
  const slideDetails = analytics.slideData.map((slide, index) => {
    const dropOff = index > 0 ? analytics.slideData[index - 1].user_count - slide.user_count : 0
    const dropOffRate = index > 0 
      ? ((dropOff / analytics.slideData[index - 1].user_count) * 100).toFixed(1)
      : '0.0'
    
    return {
      slideId: slide.slide_id,
      slideTitle: slide.slide_title,
      sequence: slide.slide_sequence,
      users: slide.user_count,
      dropOff,
      dropOffRate: parseFloat(dropOffRate),
      retentionRate: ((slide.user_count / analytics.totalSessions) * 100).toFixed(1)
    }
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Slide-by-Slide Breakdown</h2>
        <p className="text-gray-600">
          Detailed user progression showing exactly where users drop off
        </p>
      </div>

      <div className="space-y-3">
        {slideDetails.map((slide, index) => (
          <div 
            key={slide.slideId} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {slide.sequence}
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {slide.slideTitle}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    ID: {slide.slideId}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sequence: {slide.sequence}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-semibold text-gray-900">
                    {slide.users.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">users</span>
                </div>
                <p className="text-xs text-gray-500">
                  {slide.retentionRate}% retention
                </p>
              </div>

              {/* Drop-off Indicator */}
              {slide.dropOff > 0 && (
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <ArrowDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      -{slide.dropOff.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-red-500">
                    {slide.dropOffRate}% drop-off
                  </p>
                </div>
              )}

              {/* Visual Progress Bar */}
              <div className="w-24">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(slide.users / analytics.totalSessions) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {((slide.users / analytics.totalSessions) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalSessions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Started Quiz</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.completedUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {analytics.droppedOffUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Dropped Off</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.completionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Requirements Format Output:
        </h3>
        <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
          {slideDetails.map((slide) => (
            <div key={slide.slideId} className="mb-1">
              <span className="text-blue-600">Slide {slide.sequence}:</span>{' '}
              <span className="font-semibold">{slide.users} users</span>
              {slide.dropOff > 0 && (
                <span className="text-red-600 ml-2">(-{slide.dropOff})</span>
              )}
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-300">
            <span className="text-green-600">Completed:</span>{' '}
            <span className="font-semibold">
              {slideDetails[slideDetails.length - 1]?.users || 0} users
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
