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
  tier: 'free' | 'mid' | 'premium'
  trustScore: number
  totalVerifications: number
  supporterOf: string[]
}

export interface Supporter {
  id: string
  name: string
  email?: string
  avatar?: string
  feedback: string
  addedDate: string
  trustScore: number
  verificationsCompleted: number
  encouragementsSent: number
  role: 'accountability' | 'encourager' | 'verifier' | 'all'
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

export interface Verification {
  id: string
  pactId: string
  type: 'photo' | 'strava' | 'supporter_confirm' | 'self_report'
  status: 'pending' | 'verified' | 'disputed'
  evidence?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
  note?: string
}

export interface WeeklyReflection {
  id: string
  pactId: string
  weekNumber: number
  weekStartDate: string
  whatWentWell: string
  whatWasChallenging: string
  lessonsLearned: string
  recommitment: string
  energyLevel: 1 | 2 | 3 | 4 | 5
  supporterHelpfulness: 1 | 2 | 3 | 4 | 5
  mood: 'energized' | 'steady' | 'drained' | 'renewed'
  createdAt: string
}

export interface ProgressCard {
  id: string
  pactId: string
  title: string
  description: string
  milestone: string
  verified: boolean
  verificationMethod: string
  stats: {
    streakDays: number
    goalsCompleted: number
    totalGoals: number
    completionRate: number
  }
  createdAt: string
  shared: boolean
}

export interface EncouragementTemplate {
  id: string
  text: string
  category: 'motivation' | 'celebration' | 'comeback' | 'milestone'
}

export interface SupporterActivity {
  id: string
  type: 'encouragement' | 'verification' | 'nudge' | 'reaction'
  supporterName: string
  pactTitle: string
  pactId: string
  content: string
  createdAt: string
}

export interface RoomChallenge {
  id: string
  roomId: string
  title: string
  description: string
  creatorName: string
  startDate: string
  endDate: string
  verificationMethod: 'photo' | 'self_report' | 'supporter'
  participants: ChallengeParticipant[]
  milestones: ChallengeMilestone[]
  status: 'upcoming' | 'active' | 'completed'
  prize?: string
  category: string
}

export interface ChallengeParticipant {
  userId: string
  userName: string
  joinedAt: string
  progress: number
  completedMilestones: string[]
  verified: boolean
}

export interface ChallengeMilestone {
  id: string
  title: string
  description: string
  dueDate: string
  verificationRequired: boolean
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
  verificationMethod: 'strava' | 'photo' | 'supporter' | 'self' | 'mixed'
  verifications: Verification[]
  weeklyReflections: WeeklyReflection[]
  progressCards: ProgressCard[]
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
  challenges: RoomChallenge[]
  type: 'community' | 'challenge' | 'creator'
  creatorId?: string
  creatorName?: string
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
