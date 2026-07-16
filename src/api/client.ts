import type { AssessmentMode, AssessmentProfile, MaturityLevel } from '@/types/assessment'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface AssessmentProfilePayload extends AssessmentProfile {}

export interface AnswerItem {
  questionId: string
  score: number
  note: string
}

export interface AssessmentDetail {
  id: string
  profile: AssessmentProfilePayload
  answers: AnswerItem[]
  completed: boolean
  completionRate: number
}

export interface DimensionScoreItem {
  domain: string
  dimension: string
  score: number
  level: string
}

export interface RecommendationItem {
  phase: string
  title: string
  detail: string
}

export interface ReportData {
  assessmentId: string
  profile: AssessmentProfilePayload
  agileScore: number
  devopsScore: number
  overallScore: number
  overallLevel: string
  dimensionScores: DimensionScoreItem[]
  strengths: string[]
  risks: string[]
  recommendations: RecommendationItem[]
  createdAt: string
}

export interface HistoryItem {
  id: string
  customerName: string
  mode: AssessmentMode
  overallScore: number
  overallLevel: MaturityLevel
  createdAt: string
}

export const api = {
  createAssessment(profile: AssessmentProfilePayload): Promise<{ id: string }> {
    return request('/assessments', {
      method: 'POST',
      body: JSON.stringify({ profile }),
    })
  },

  getAssessment(id: string): Promise<AssessmentDetail> {
    return request(`/assessments/${id}`)
  },

  updateProfile(id: string, profile: AssessmentProfilePayload): Promise<{ ok: boolean }> {
    return request(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    })
  },

  deleteAssessment(id: string): Promise<{ ok: boolean }> {
    return request(`/assessments/${id}`, { method: 'DELETE' })
  },

  saveAnswers(id: string, answers: AnswerItem[]): Promise<{ ok: boolean }> {
    return request(`/assessments/${id}/answers`, {
      method: 'PUT',
      body: JSON.stringify({ answers }),
    })
  },

  generateReport(id: string): Promise<ReportData> {
    return request(`/assessments/${id}/report`, { method: 'POST' })
  },

  getReport(id: string): Promise<ReportData> {
    return request(`/assessments/${id}/report`)
  },

  getHistory(): Promise<HistoryItem[]> {
    return request('/reports/history')
  },
}
