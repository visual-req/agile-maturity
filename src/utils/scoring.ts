import { questionBank } from '@/data/questionBank'
import type {
  AssessmentDomain,
  AssessmentMode,
  AssessmentProfile,
  AssessmentReport,
  DimensionScore,
  QuestionAnswer,
  Recommendation,
} from '@/types/assessment'

const recommendationLibrary: Record<string, Recommendation[]> = {
  'Scrum 角色与职责': [
    { phase: '短期', title: '明确角色边界', detail: '澄清 Product Owner、Scrum Master 与团队的职责，统一待办列表维护规则。' },
    { phase: '中期', title: '建立角色协同节奏', detail: '设置需求梳理、障碍管理和冲刺目标同步机制，减少职责空转。' },
    { phase: '长期', title: '形成组织级 Scrum 角色培养机制', detail: '通过教练辅导和社区实践复制成熟团队经验。' },
  ],
  '事件执行': [
    { phase: '短期', title: '标准化 Scrum 事件模板', detail: '为计划会、站会、评审会、回顾会定义输入、输出与时间盒。' },
    { phase: '中期', title: '跟踪回顾行动项闭环', detail: '对回顾输出建立 owner 和截止时间，确保改进行动真正落地。' },
    { phase: '长期', title: '让事件成为经营节奏', detail: '把迭代节奏和交付指标联动，形成持续改进的管理机制。' },
  ],
  '工件透明度': [
    { phase: '短期', title: '统一工件定义', detail: '完善 DoR、DoD、看板列定义和工件状态说明，减少认知偏差。' },
    { phase: '中期', title: '提升可视化透明度', detail: '将冲刺目标、依赖和阻塞项纳入看板，支持团队共同决策。' },
    { phase: '长期', title: '打通组织级可视化', detail: '将团队工件透明度与项目组合视角联动，支持跨团队协同。' },
  ],
  '协作文化': [
    { phase: '短期', title: '引入跨职能同步机制', detail: '让产品、研发、测试在需求澄清和风险评估阶段共同参与。' },
    { phase: '中期', title: '增强反馈安全感', detail: '在回顾和复盘中建立问题可说、问题可改的团队氛围。' },
    { phase: '长期', title: '构建自组织团队文化', detail: '逐步将计划、改进和执行权下沉到团队，提升响应变化能力。' },
  ],
  '度量与改进': [
    { phase: '短期', title: '建立核心交付指标', detail: '优先采集迭代完成率、缺陷趋势、交付周期等关键度量。' },
    { phase: '中期', title: '将数据用于回顾决策', detail: '在回顾中结合指标分析根因，制定针对性的流程改进行动。' },
    { phase: '长期', title: '形成持续改进驾驶舱', detail: '沉淀跨团队对比指标和改进策略，支持组织层经营分析。' },
  ],
  '代码管理': [
    { phase: '短期', title: '统一代码评审与分支策略', detail: '明确主干保护、PR 模板和最小评审要求。' },
    { phase: '中期', title: '强化质量门禁', detail: '将静态检查、代码规范和基础测试纳入合并前检查。' },
    { phase: '长期', title: '推广主干开发能力', detail: '逐步缩短分支生命周期，提升交付吞吐和集成效率。' },
  ],
  '持续集成': [
    { phase: '短期', title: '补齐自动构建链路', detail: '确保每次提交都自动触发构建、检查和结果反馈。' },
    { phase: '中期', title: '优化流水线时长与稳定性', detail: '识别瓶颈步骤，提升构建缓存和并行执行能力。' },
    { phase: '长期', title: '形成组织级 CI 模板', detail: '沉淀可复用流水线模板，降低团队接入成本。' },
  ],
  '测试自动化': [
    { phase: '短期', title: '优先覆盖关键链路', detail: '从核心业务流程和高风险模块开始补齐自动化测试。' },
    { phase: '中期', title: '把测试纳入发布门禁', detail: '将自动化测试结果作为发布前必经条件，减少上线回归风险。' },
    { phase: '长期', title: '建设分层测试体系', detail: '持续完善单测、接口、端到端测试的职责边界与协同。' },
  ],
  '制品管理': [
    { phase: '短期', title: '统一制品归档与命名规则', detail: '明确构建产物的版本标识、留存周期和仓库归档方式，避免产物散落与来源不清。' },
    { phase: '中期', title: '打通流水线与制品仓库', detail: '确保制品由流水线自动上传、传递和发布，减少人工替换与二次打包。' },
    { phase: '长期', title: '建立组织级制品治理体系', detail: '沉淀制品追溯、审计、复用和回滚机制，支撑多团队一致交付。' },
  ],
  '配置管理': [
    { phase: '短期', title: '梳理配置项与敏感信息', detail: '识别不同环境的配置差异，清理硬编码与手工维护项。' },
    { phase: '中期', title: '推进配置集中管理', detail: '通过配置中心、环境变量或密钥管理服务统一管理参数与敏感信息。' },
    { phase: '长期', title: '实现配置可追踪可回滚', detail: '将配置纳入版本控制、审批审计和发布验证，形成配置即资产的治理方式。' },
  ],
  '环境一致性': [
    { phase: '短期', title: '梳理环境差异项', detail: '盘点开发、测试、生产环境的配置差异和高发问题。' },
    { phase: '中期', title: '推动环境模板化', detail: '通过容器、脚本或模板统一环境配置和部署参数。' },
    { phase: '长期', title: '实现环境即代码', detail: '以标准化配置和自动化校验降低环境漂移。' },
  ],
  '发布治理': [
    { phase: '短期', title: '标准化发布清单', detail: '明确审批、检查、回滚和通知项，降低人工发布失误。' },
    { phase: '中期', title: '提升发布自动化与可追踪性', detail: '让发布记录、变更说明和回滚操作可留痕、可审计。' },
    { phase: '长期', title: '建设高频安全发布能力', detail: '通过灰度、蓝绿或金丝雀模式提升发布频率与稳定性。' },
  ],
  '监控反馈与安全左移': [
    { phase: '短期', title: '补齐监控和告警覆盖', detail: '优先建立服务健康度、错误率和核心业务指标告警。' },
    { phase: '中期', title: '将安全检查前移', detail: '把依赖扫描、漏洞检测和基线校验纳入流水线。' },
    { phase: '长期', title: '形成闭环运营机制', detail: '将监控、故障复盘和安全治理纳入持续改进周期。' },
  ],
}

const levelRanges = [
  { max: 34, level: '初始' },
  { max: 59, level: '发展中' },
  { max: 79, level: '稳定' },
  { max: 100, level: '优化' },
] as const

const modeIncludesDomain = (mode: AssessmentMode, domain: AssessmentDomain) =>
  mode === 'full' || mode === domain

export const getLevelByScore = (score: number) =>
  levelRanges.find((range) => score <= range.max)?.level ?? '优化'

export const getQuestionsByMode = (mode: AssessmentMode) =>
  questionBank.filter((question) => modeIncludesDomain(mode, question.domain))

export const groupQuestionsByDimension = (mode: AssessmentMode) => {
  return getQuestionsByMode(mode).reduce<Record<string, typeof questionBank>>((acc, question) => {
    const key = `${question.domain}:${question.dimension}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(question)
    return acc
  }, {})
}

const calculateDomainScore = (dimensionScores: DimensionScore[], domain: AssessmentDomain) => {
  const filtered = dimensionScores.filter((item) => item.domain === domain)
  if (filtered.length === 0) {
    return 0
  }
  return Math.round(filtered.reduce((sum, item) => sum + item.score, 0) / filtered.length)
}

const dedupeRecommendations = (items: Recommendation[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.phase}-${item.title}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export const buildAssessmentReport = (
  profile: AssessmentProfile,
  answers: Record<string, QuestionAnswer>,
): AssessmentReport => {
  const selectedQuestions = getQuestionsByMode(profile.mode)
  const grouped = groupQuestionsByDimension(profile.mode)

  const dimensionScores = Object.entries(grouped).map<DimensionScore>(([, questions]) => {
    const totalWeight = questions.reduce((sum, item) => sum + item.weight, 0)
    const weightedScore = questions.reduce((sum, item) => {
      const answer = answers[item.id]
      return sum + (answer?.score ?? 0) * item.weight
    }, 0)
    const score = totalWeight === 0 ? 0 : Math.round((weightedScore / totalWeight) * 20)
    return {
      domain: questions[0].domain,
      dimension: questions[0].dimension,
      score,
      level: getLevelByScore(score),
    }
  })

  const agileScore = profile.mode === 'devops' ? 0 : calculateDomainScore(dimensionScores, 'agile')
  const devopsScore = profile.mode === 'agile' ? 0 : calculateDomainScore(dimensionScores, 'devops')
  const overallBase = [agileScore, devopsScore].filter((score) => score > 0)
  const overallScore = overallBase.length > 0
    ? Math.round(overallBase.reduce((sum, score) => sum + score, 0) / overallBase.length)
    : 0

  const strengths = dimensionScores
    .filter((item) => item.score >= 80)
    .map((item) => `${item.dimension}表现稳健，已达到${item.level}水平。`)
    .slice(0, 3)

  const risks = dimensionScores
    .filter((item) => item.score < 60)
    .sort((a, b) => a.score - b.score)
    .map((item) => `${item.dimension}得分较低，当前为${item.level}阶段。`)
    .slice(0, 4)

  const recommendations = dedupeRecommendations(
    dimensionScores
      .filter((item) => item.score < 75)
      .flatMap((item) => recommendationLibrary[item.dimension] ?? [])
      .slice(0, 9),
  )

  if (strengths.length === 0 && selectedQuestions.length > 0) {
    strengths.push('当前整体实践已具备一定基础，可围绕高频协作场景继续提升稳定性。')
  }

  if (risks.length === 0 && selectedQuestions.length > 0) {
    risks.push('当前未发现明显短板，建议继续关注跨团队协同与自动化深度。')
  }

  return {
    profile,
    agileScore,
    devopsScore,
    overallScore,
    overallLevel: getLevelByScore(overallScore),
    dimensionScores,
    strengths,
    risks,
    recommendations,
    createdAt: new Date().toISOString(),
  }
}

export const getCompletionRate = (
  mode: AssessmentMode,
  answers: Record<string, QuestionAnswer>,
) => {
  const questions = getQuestionsByMode(mode)
  if (questions.length === 0) {
    return 0
  }
  const answeredCount = questions.filter((item) => answers[item.id]?.score).length
  return Math.round((answeredCount / questions.length) * 100)
}

export const isAssessmentComplete = (
  mode: AssessmentMode,
  answers: Record<string, QuestionAnswer>,
) => getCompletionRate(mode, answers) === 100
