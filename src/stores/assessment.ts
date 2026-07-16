import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getQuestionsByMode } from '@/utils/scoring'
import { buildAssessmentReport, getCompletionRate, isAssessmentComplete } from '@/utils/scoring'
import type {
  AssessmentProfile,
  AssessmentReport,
  HistoryRecord,
  QuestionAnswer,
} from '@/types/assessment'
import { defaultAssessmentProfile } from '@/types/assessment'

const PROFILE_KEY = 'assessment_profile'
const ANSWERS_KEY = 'assessment_answers'
const REPORT_KEY = 'assessment_report'
const HISTORY_KEY = 'assessment_history'

const readStorage = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  }
  catch {
    return fallback
  }
}

export const useAssessmentStore = defineStore('assessment', () => {
  const profile = ref<AssessmentProfile>(readStorage(PROFILE_KEY, defaultAssessmentProfile()))
  const answers = ref<Record<string, QuestionAnswer>>(readStorage(ANSWERS_KEY, {}))
  const report = ref<AssessmentReport | null>(readStorage<AssessmentReport | null>(REPORT_KEY, null))
  const history = ref<HistoryRecord[]>(readStorage<HistoryRecord[]>(HISTORY_KEY, []))

  const questions = computed(() => getQuestionsByMode(profile.value.mode))
  const completionRate = computed(() => getCompletionRate(profile.value.mode, answers.value))
  const completed = computed(() => isAssessmentComplete(profile.value.mode, answers.value))

  watch(
    profile,
    (value) => {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  watch(
    answers,
    (value) => {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  watch(
    report,
    (value) => {
      if (value) {
        localStorage.setItem(REPORT_KEY, JSON.stringify(value))
      }
      else {
        localStorage.removeItem(REPORT_KEY)
      }
    },
    { deep: true },
  )

  watch(
    history,
    (value) => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(value))
    },
    { deep: true },
  )

  const updateProfile = (payload: AssessmentProfile) => {
    profile.value = payload
  }

  const answerQuestion = (questionId: string, score: number, note = '') => {
    answers.value[questionId] = {
      questionId,
      score,
      note,
    }
  }

  const clearAnswers = () => {
    answers.value = {}
  }

  const resetAssessment = () => {
    profile.value = defaultAssessmentProfile()
    answers.value = {}
    report.value = null
  }

  const createReport = () => {
    const nextReport = buildAssessmentReport(profile.value, answers.value)
    report.value = nextReport
    history.value = [
      {
        id: `${nextReport.profile.customerName}-${nextReport.createdAt}`,
        customerName: nextReport.profile.customerName,
        mode: nextReport.profile.mode,
        overallScore: nextReport.overallScore,
        overallLevel: nextReport.overallLevel,
        createdAt: nextReport.createdAt,
      },
      ...history.value,
    ].slice(0, 8)

    return nextReport
  }

  return {
    answers,
    completed,
    completionRate,
    history,
    profile,
    questions,
    report,
    answerQuestion,
    clearAnswers,
    createReport,
    resetAssessment,
    updateProfile,
  }
})
