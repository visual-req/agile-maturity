import { describe, expect, it } from 'vitest'
import { buildAssessmentReport, getCompletionRate, getQuestionsByMode } from '@/utils/scoring'
import type { AssessmentProfile, QuestionAnswer } from '@/types/assessment'

const profile: AssessmentProfile = {
  customerName: '测试客户',
  teamName: '平台团队',
  industry: '互联网',
  teamSize: '10-30 人',
  assessor: '顾问A',
  assessmentDate: '2026-07-16',
  mode: 'full',
}

describe('scoring', () => {
  it('应该根据问卷答案生成完整报告', () => {
    const answers = getQuestionsByMode('full').reduce<Record<string, QuestionAnswer>>((acc, question) => {
      acc[question.id] = {
        questionId: question.id,
        score: 4,
        note: '已有体系支撑',
      }
      return acc
    }, {})

    const report = buildAssessmentReport(profile, answers)

    expect(report.overallScore).toBe(80)
    expect(report.overallLevel).toBe('优化')
    expect(report.dimensionScores.length).toBeGreaterThan(5)
    expect(report.strengths.length).toBeGreaterThan(0)
  })

  it('应该计算问卷完成度', () => {
    const questions = getQuestionsByMode('agile')
    const answers: Record<string, QuestionAnswer> = {
      [questions[0].id]: {
        questionId: questions[0].id,
        score: 3,
        note: '',
      },
    }

    expect(getCompletionRate('agile', answers)).toBe(Math.round((1 / questions.length) * 100))
  })

  it('应该包含 DevOps 的制品管理和配置管理维度', () => {
    const questions = getQuestionsByMode('devops')
    const dimensions = new Set(questions.map((item) => item.dimension))

    expect(dimensions.has('制品管理')).toBe(true)
    expect(dimensions.has('配置管理')).toBe(true)
  })

  it('应该提供更完整的 Agile 和 DevOps 问卷题量', () => {
    expect(getQuestionsByMode('agile').length).toBeGreaterThanOrEqual(15)
    expect(getQuestionsByMode('devops').length).toBeGreaterThanOrEqual(24)
    expect(getQuestionsByMode('full').length).toBeGreaterThanOrEqual(39)
  })
})
