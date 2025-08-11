export interface SlideData {
  slide_id: string
  slide_title: string
  slide_sequence: number
  user_count: number
}

export interface QuizAnalytics {
  quizId: string
  totalSessions: number
  completedUsers: number
  droppedOffUsers: number
  completionRate: number
  finalSlideNumber: number
  slideData: SlideData[]
}
