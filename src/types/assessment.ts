export type AssessmentMode = 'agile' | 'devops' | 'full'
export type AssessmentDomain = 'agile' | 'devops'
export type MaturityLevel = '初始' | '发展中' | '稳定' | '优化'

export interface AssessmentProfile {
  customerName: string
  teamName: string
  industry: string
  teamSize: string
  assessor: string
  assessmentDate: string
  mode: AssessmentMode
}

export interface QuestionOption {
  label: string
  score: number
  description: string
}

export interface AssessmentQuestion {
  id: string
  domain: AssessmentDomain
  dimension: string
  title: string
  description: string
  weight: number
  evidenceHint: string
  options: QuestionOption[]
}

export interface QuestionAnswer {
  questionId: string
  score: number
  note: string
}

export interface DimensionScore {
  domain: AssessmentDomain
  dimension: string
  score: number
  level: MaturityLevel
}

export interface Recommendation {
  phase: '短期' | '中期' | '长期'
  title: string
  detail: string
}

export interface AssessmentReport {
  profile: AssessmentProfile
  agileScore: number
  devopsScore: number
  overallScore: number
  overallLevel: MaturityLevel
  dimensionScores: DimensionScore[]
  strengths: string[]
  risks: string[]
  recommendations: Recommendation[]
  createdAt: string
}

export interface HistoryRecord {
  id: string
  customerName: string
  mode: AssessmentMode
  overallScore: number
  overallLevel: MaturityLevel
  createdAt: string
}

export const defaultAssessmentProfile = (): AssessmentProfile => ({
  customerName: '',
  teamName: '',
  industry: '',
  teamSize: '',
  assessor: '',
  assessmentDate: new Date().toISOString().slice(0, 10),
  mode: 'full',
})
