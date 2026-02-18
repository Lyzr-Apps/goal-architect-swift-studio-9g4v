export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  joinedDate: string
  currentStreak: number
  longestStreak: number
  completionRate: number
  totalPacts: number
  completedPacts: number
}

export interface Supporter {
  id: string
  name: string
  email?: string
  avatar?: string
  feedback: string
  addedDate: string
}

export interface MicroGoal {
  id: string
  goalText: string
  difficulty: 'easy' | 'medium' | 'hard'
  dueDate: string
  reasoning: string
  measurableOutcome: string
  completed: boolean
  completedDate?: string
}

export interface Nudge {
  nudgeText: string
  behavioralPrinciple: string
}

export interface WeeklyPlanDay {
  day: string
  microGoal: string
  reminder: string
  supporterPrompt: string
  completed: boolean
}

export interface DailyCheckIn {
  id: string
  date: string
  note: string
  mood: 'great' | 'good' | 'okay' | 'tough'
  completedGoals: string[]
}

export interface Pact {
  id: string
  userId: string
  title: string
  description: string
  identityStatement: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  category: string
  supporters: Supporter[]
  microGoals: MicroGoal[]
  nudges: Nudge[]
  weeklyPlan: WeeklyPlanDay[]
  checkIns: DailyCheckIn[]
  aiPlan?: AIPlanOutput
  createdAt: string
  updatedAt: string
  streak: number
  completionRate: number
  behavioralState?: string
  identityAffirmation?: string
}

export interface AIPlanOutput {
  behavioralState: string
  identityAffirmation: string
  microGoals: MicroGoal[]
  nudges: Nudge[]
  weeklyPlan: WeeklyPlanDay[]
  explanations: {
    pactInterpretation: string
    behaviorInsights: string
    supporterInsights: string
  }
  difficultyDistribution: {
    easyPercent: number
    mediumPercent: number
    hardPercent: number
  }
}

export interface Room {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  members: string[]
  posts: RoomPost[]
  createdAt: string
  isPublic: boolean
  icon: string
}

export interface RoomPost {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  likes: number
  likedBy: string[]
  type: 'update' | 'milestone' | 'encouragement' | 'question'
}
