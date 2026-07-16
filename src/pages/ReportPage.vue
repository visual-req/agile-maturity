<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import ScoreTag from '@/components/ScoreTag.vue'
import { useAssessmentStore } from '@/stores/assessment'
import type { AssessmentReport } from '@/types/assessment'

const ReportCharts = defineAsyncComponent(() => import('@/components/ReportCharts.vue'))

const router = useRouter()
const store = useAssessmentStore()
const reportContainerRef = ref<HTMLElement | null>(null)
const exportingPdf = ref(false)
const exportingWord = ref(false)

const report = computed(() => store.report)

const summaryCards = computed(() => {
  if (!report.value) {
    return []
  }

  return [
    { label: '综合得分', value: report.value.overallScore, suffix: '分' },
    { label: 'Agile 得分', value: report.value.agileScore, suffix: '分' },
    { label: 'DevOps 得分', value: report.value.devopsScore, suffix: '分' },
  ]
})

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const getExportFileName = (suffix: string) => {
  const customerName = report.value?.profile.customerName?.trim() || 'assessment-report'
  return `${customerName}-${suffix}`
}

const buildReportText = (currentReport: AssessmentReport) => {
  return [
    'Agile / Scrum 与 DevOps 成熟度评估报告',
    '',
    `客户名称：${currentReport.profile.customerName}`,
    `团队名称：${currentReport.profile.teamName}`,
    `行业：${currentReport.profile.industry || '-'}`,
    `团队规模：${currentReport.profile.teamSize || '-'}`,
    `评估人：${currentReport.profile.assessor || '-'}`,
    `评估日期：${currentReport.profile.assessmentDate || '-'}`,
    '',
    `综合得分：${currentReport.overallScore}`,
    `综合等级：${currentReport.overallLevel}`,
    `Agile 得分：${currentReport.agileScore}`,
    `DevOps 得分：${currentReport.devopsScore}`,
    '',
    '维度得分：',
    ...currentReport.dimensionScores.map((item) => `- ${item.dimension}（${item.domain === 'agile' ? 'Agile / Scrum' : 'DevOps'}）：${item.score}（${item.level}）`),
    '',
    '优势与现状：',
    ...currentReport.strengths.map((item) => `- ${item}`),
    '',
    '关键风险：',
    ...currentReport.risks.map((item) => `- ${item}`),
    '',
    '改进建议：',
    ...currentReport.recommendations.map((item) => `- [${item.phase}] ${item.title}：${item.detail}`),
  ].join('\n')
}

const buildWordHtml = (currentReport: AssessmentReport) => {
  const profileRows = [
    ['客户名称', currentReport.profile.customerName],
    ['团队名称', currentReport.profile.teamName],
    ['行业', currentReport.profile.industry || '-'],
    ['团队规模', currentReport.profile.teamSize || '-'],
    ['评估人', currentReport.profile.assessor || '-'],
    ['评估日期', currentReport.profile.assessmentDate || '-'],
    ['综合得分', `${currentReport.overallScore}`],
    ['综合等级', currentReport.overallLevel],
    ['Agile 得分', `${currentReport.agileScore}`],
    ['DevOps 得分', `${currentReport.devopsScore}`],
  ]

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>成熟度评估报告</title>
        <style>
          body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; color: #1f2937; line-height: 1.7; margin: 24px; }
          h1, h2 { color: #111827; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          h2 { font-size: 18px; margin: 24px 0 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; vertical-align: top; }
          th { background: #f8fafc; width: 180px; }
          ul { padding-left: 20px; }
          li { margin: 6px 0; }
        </style>
      </head>
      <body>
        <h1>Agile / Scrum 与 DevOps 成熟度评估报告</h1>
        <table>
          ${profileRows.map(([label, value]) => `
            <tr>
              <th>${escapeHtml(label)}</th>
              <td>${escapeHtml(value)}</td>
            </tr>
          `).join('')}
        </table>

        <h2>维度得分</h2>
        <table>
          <tr>
            <th>维度</th>
            <th>领域</th>
            <th>得分</th>
            <th>等级</th>
          </tr>
          ${currentReport.dimensionScores.map((item) => `
            <tr>
              <td>${escapeHtml(item.dimension)}</td>
              <td>${escapeHtml(item.domain === 'agile' ? 'Agile / Scrum' : 'DevOps')}</td>
              <td>${item.score}</td>
              <td>${escapeHtml(item.level)}</td>
            </tr>
          `).join('')}
        </table>

        <h2>优势与现状</h2>
        <ul>${currentReport.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>

        <h2>关键风险</h2>
        <ul>${currentReport.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>

        <h2>改进建议</h2>
        <ul>
          ${currentReport.recommendations.map((item) => `
            <li>[${escapeHtml(item.phase)}] ${escapeHtml(item.title)}：${escapeHtml(item.detail)}</li>
          `).join('')}
        </ul>
      </body>
    </html>
  `
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

const exportSummary = () => {
  if (!report.value) {
    return
  }

  const blob = new Blob([buildReportText(report.value)], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${getExportFileName('summary')}.txt`)
  message.success('评估摘要已导出。')
}

const exportWord = async () => {
  if (!report.value || exportingWord.value) {
    return
  }

  exportingWord.value = true

  try {
    const blob = new Blob([`\ufeff${buildWordHtml(report.value)}`], {
      type: 'application/msword;charset=utf-8',
    })
    downloadBlob(blob, `${getExportFileName('report')}.doc`)
    message.success('Word 报告已导出。')
  }
  finally {
    exportingWord.value = false
  }
}

const exportPdf = async () => {
  if (!report.value || !reportContainerRef.value || exportingPdf.value) {
    return
  }

  exportingPdf.value = true
  document.body.classList.add('is-exporting-pdf')

  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    const canvas = await html2canvas(reportContainerRef.value, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: reportContainerRef.value.scrollWidth,
      windowHeight: reportContainerRef.value.scrollHeight,
    })

    const imageData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 24
    const imageWidth = pageWidth - margin * 2
    const imageHeight = (canvas.height * imageWidth) / canvas.width
    let heightLeft = imageHeight
    let position = margin

    pdf.addImage(imageData, 'PNG', margin, position, imageWidth, imageHeight, undefined, 'FAST')
    heightLeft -= pageHeight - margin * 2

    while (heightLeft > 0) {
      position = heightLeft - imageHeight + margin
      pdf.addPage()
      pdf.addImage(imageData, 'PNG', margin, position, imageWidth, imageHeight, undefined, 'FAST')
      heightLeft -= pageHeight - margin * 2
    }

    pdf.save(`${getExportFileName('report')}.pdf`)
    message.success('PDF 报告已导出。')
  }
  catch (error) {
    console.error(error)
    message.error('PDF 导出失败，请稍后重试。')
  }
  finally {
    document.body.classList.remove('is-exporting-pdf')
    exportingPdf.value = false
  }
}

const printReport = () => {
  window.print()
}
</script>

<template>
  <div class="page-stack">
    <a-empty
      v-if="!report"
      description="还没有可展示的报告，请先完成评估问卷。"
    >
      <a-button type="primary" @click="router.push('/assessment/new')">
        去创建评估
      </a-button>
    </a-empty>

    <div v-else ref="reportContainerRef" class="report-export">
      <section class="page-grid page-grid--three">
        <a-card
          v-for="item in summaryCards"
          :key="item.label"
          class="panel-card metric-panel"
          :bordered="false"
        >
          <div class="metric-panel__label">{{ item.label }}</div>
          <div class="metric-panel__value">{{ item.value }}<span>{{ item.suffix }}</span></div>
        </a-card>
        <a-card class="panel-card metric-panel" :bordered="false">
          <div class="metric-panel__label">综合等级</div>
          <div class="metric-panel__value metric-panel__value--small">
            {{ report.overallLevel }}
          </div>
          <ScoreTag :level="report.overallLevel" />
        </a-card>
      </section>

      <a-card class="panel-card" :bordered="false">
        <div class="report-head">
          <div>
            <div class="progress-head__label">客户 / 团队</div>
            <h3 class="progress-head__title">
              {{ report.profile.customerName }} · {{ report.profile.teamName }}
            </h3>
          </div>
          <div class="report-head__actions">
            <a-button @click="printReport">打印视图</a-button>
            <a-button :loading="exportingPdf" @click="exportPdf">导出 PDF</a-button>
            <a-button :loading="exportingWord" @click="exportWord">导出 Word</a-button>
            <a-button type="primary" @click="exportSummary">导出摘要</a-button>
          </div>
        </div>
      </a-card>

      <ReportCharts :items="report.dimensionScores" />

      <section class="page-grid page-grid--two">
        <a-card class="panel-card" :bordered="false">
          <template #title>优势与现状</template>
          <div class="insight-list">
            <div
              v-for="item in report.strengths"
              :key="item"
              class="insight-item insight-item--positive"
            >
              {{ item }}
            </div>
          </div>
        </a-card>

        <a-card class="panel-card" :bordered="false">
          <template #title>关键风险</template>
          <div class="insight-list">
            <div
              v-for="item in report.risks"
              :key="item"
              class="insight-item insight-item--risk"
            >
              {{ item }}
            </div>
          </div>
        </a-card>
      </section>

      <a-card class="panel-card" :bordered="false">
        <template #title>维度分析</template>
        <div class="score-grid">
          <div
            v-for="item in report.dimensionScores"
            :key="item.dimension"
            class="score-row"
          >
            <div>
              <div class="score-row__title">{{ item.dimension }}</div>
              <div class="score-row__meta">{{ item.domain === 'agile' ? 'Agile / Scrum' : 'DevOps' }}</div>
            </div>
            <div class="score-row__value">
              <strong>{{ item.score }}</strong>
              <ScoreTag :level="item.level" />
            </div>
          </div>
        </div>
      </a-card>

      <a-card class="panel-card" :bordered="false">
        <template #title>改进建议</template>
        <a-timeline mode="left">
          <a-timeline-item
            v-for="item in report.recommendations"
            :key="`${item.phase}-${item.title}`"
            color="cyan"
          >
            <div class="timeline-item__phase">{{ item.phase }}</div>
            <div class="timeline-item__title">{{ item.title }}</div>
            <div class="timeline-item__text">{{ item.detail }}</div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </div>
  </div>
</template>
