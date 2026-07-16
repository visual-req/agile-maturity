import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getQuestionsByMode } from '@/utils/scoring'
import { buildAssessmentReport, getCompletionRate, isAssessmentComplete } from '@/utils/scoring'
import { api } from '@/api/client'
import type {
  AssessmentProfile,
  AssessmentReport,
  HistoryRecord,
  QuestionAnswer,
} from '@/types/assessment'
import { defaultAssessmentProfile } from '@/types/assessment'

const PROFILE_KEY = 'assessment_profile'
const ANSWERS_KEY = 'assessment_answers'
const ASSESSMENT_ID_KEY = 'assessment_id'

const readStorage = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

export const useAssessmentStore = defineStore('assessment', () => {
  const assessmentId = ref<string | null>(localStorage.getItem(ASSESSMENT_ID_KEY))
  const profile = ref<AssessmentProfile>(readStorage(PROFILE_KEY, defaultAssessmentProfile()))
  const answers = ref<Record<string, QuestionAnswer>>(readStorage(ANSWERS_KEY, {}))
  const report = ref<AssessmentReport | null>(null)
  const history = ref<HistoryRecord[]>([])
  const loading = ref(false)

  const questions = computed(() => getQuestionsByMode(profile.value.mode))
  const completionRate = computed(() => getCompletionRate(profile.value.mode, answers.value))
  const completed = computed(() => isAssessmentComplete(profile.value.mode, answers.value))

  // ---------- Profile ----------

  const updateProfile = async (payload: AssessmentProfile) => {
    profile.value = payload
    localStorage.setItem(PROFILE_KEY, JSON.stringify(payload))

    try {
      if (assessmentId.value) {
        await api.updateProfile(assessmentId.value, payload)
      } else {
        const { id } = await api.createAssessment(payload)
        assessmentId.value = id
        localStorage.setItem(ASSESSMENT_ID_KEY, id)
      }
    } catch (e) {
      console.warn('API 同步失败，使用本地缓存', e)
    }
  }

  // ---------- Answers ----------

  const answerQuestion = (questionId: string, score: number, note = '') => {
    answers.value[questionId] = { questionId, score, note }
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers.value))
  }

  const syncAnswers = async () => {
    if (!assessmentId.value) return
    const items = Object.values(answers.value)
    if (items.length === 0) return
    try {
      await api.saveAnswers(assessmentId.value, items)
    } catch (e) {
      console.warn('答案同步到 API 失败', e)
    }
  }

  const clearAnswers = () => {
    answers.value = {}
    localStorage.removeItem(ANSWERS_KEY)
  }

  // ---------- Report ----------

  const createReport = async () => {
    loading.value = true
    try {
      // Try backend first
      if (assessmentId.value) {
        await syncAnswers()
        const data = await api.generateReport(assessmentId.value)
        const mapped: AssessmentReport = {
          profile: data.profile as AssessmentProfile,
          agileScore: data.agileScore,
          devopsScore: data.devopsScore,
          overallScore: data.overallScore,
          overallLevel: data.overallLevel as AssessmentReport['overallLevel'],
          dimensionScores: data.dimensionScores as AssessmentReport['dimensionScores'],
          strengths: data.strengths,
          risks: data.risks,
          recommendations: data.recommendations as AssessmentReport['recommendations'],
          createdAt: data.createdAt,
        }
        report.value = mapped
        await loadHistory()
        return mapped
      }
    } catch (e) {
      console.warn('API 生成报告失败，回退本地计算', e)
    }

    // Fallback: local computation
    const localReport = buildAssessmentReport(profile.value, answers.value)
    report.value = localReport
    return localReport
  }

  const loadReport = async () => {
    if (!assessmentId.value) return
    try {
      const data = await api.getReport(assessmentId.value)
      report.value = {
        profile: data.profile as AssessmentProfile,
        agileScore: data.agileScore,
        devopsScore: data.devopsScore,
        overallScore: data.overallScore,
        overallLevel: data.overallLevel as AssessmentReport['overallLevel'],
        dimensionScores: data.dimensionScores as AssessmentReport['dimensionScores'],
        strengths: data.strengths,
        risks: data.risks,
        recommendations: data.recommendations as AssessmentReport['recommendations'],
        createdAt: data.createdAt,
      }
    } catch {
      // No report yet, use local if available
    }
  }

  // ---------- History ----------

  const loadHistory = async () => {
    try {
      const data = await api.getHistory()
      history.value = data
    } catch (e) {
      console.warn('加载历史记录失败', e)
    }
  }

  // ---------- Reset ----------

  const resetAssessment = () => {
    profile.value = defaultAssessmentProfile()
    answers.value = {}
    report.value = null
    assessmentId.value = null
    localStorage.removeItem(ASSESSMENT_ID_KEY)
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(ANSWERS_KEY)
  }

  // Auto-load on init
  loadHistory()

  return {
    assessmentId,
    answers,
    completed,
    completionRate,
    history,
    loading,
    profile,
    questions,
    report,
    answerQuestion,
    clearAnswers,
    createReport,
    loadHistory,
    loadReport,
    resetAssessment,
    syncAnswers,
    updateProfile,
  }
})
