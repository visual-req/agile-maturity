<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ScoreTag from '@/components/ScoreTag.vue'
import { domainMeta } from '@/data/questionBank'
import { useAssessmentStore } from '@/stores/assessment'

const router = useRouter()
const store = useAssessmentStore()

const dimensionHighlights = computed(() => [
  {
    key: 'agile',
    ...domainMeta.agile,
    items: ['Scrum 角色与职责', '事件执行', '工件透明度', '协作文化', '度量与改进'],
  },
  {
    key: 'devops',
    ...domainMeta.devops,
    items: ['代码管理', '持续集成', '测试自动化', '制品管理', '配置管理', '环境一致性', '发布治理', '监控反馈与安全左移'],
  },
])

const quickStats = computed(() => {
  const lastReport = store.history[0]
  return [
    { label: '最近评估数', value: String(store.history.length).padStart(2, '0') },
    { label: '当前问卷完成度', value: `${store.completionRate}%` },
    { label: '最近综合等级', value: lastReport?.overallLevel ?? '未开始' },
  ]
})
</script>

<template>
  <div class="page-stack">
    <section class="hero-panel">
      <div class="hero-panel__content">
        <a-tag color="cyan">企业敏捷与工程能力诊断</a-tag>
        <h2 class="hero-panel__title">用一套统一口径，完成 Agile(Scrum) 与 DevOps 成熟度评估</h2>
        <p class="hero-panel__text">
          面向咨询顾问、交付经理与客户管理层，支持结构化问卷、图文并存的结果报告，以及分阶段改进建议输出。
        </p>
        <div class="hero-panel__actions">
          <a-button type="primary" size="large" @click="router.push('/assessment/new')">
            创建新的评估
          </a-button>
          <a-button size="large" ghost @click="router.push('/report')">
            查看最近报告
          </a-button>
        </div>
      </div>
      <div class="hero-panel__metrics">
        <div
          v-for="item in quickStats"
          :key="item.label"
          class="metric-tile"
        >
          <div class="metric-tile__label">{{ item.label }}</div>
          <div class="metric-tile__value">{{ item.value }}</div>
        </div>
      </div>
    </section>

    <section class="page-grid page-grid--two">
      <a-card
        v-for="dimension in dimensionHighlights"
        :key="dimension.key"
        class="panel-card dimension-panel"
        :bordered="false"
      >
        <template #title>{{ dimension.title }}</template>
        <p class="panel-description">{{ dimension.description }}</p>
        <div class="dimension-list">
          <span
            v-for="item in dimension.items"
            :key="item"
            class="dimension-pill"
          >
            {{ item }}
          </span>
        </div>
      </a-card>
    </section>

    <section class="page-grid page-grid--wide">
      <a-card class="panel-card" :bordered="false">
        <template #title>评估流程</template>
        <a-steps :current="store.report ? 3 : store.completionRate > 0 ? 2 : 0" size="small">
          <a-step title="创建评估" description="填写客户与团队背景信息" />
          <a-step title="完成问卷" description="逐项评分并补充证据备注" />
          <a-step title="生成报告" description="计算等级并输出图文洞察" />
          <a-step title="行动规划" description="按短中长期形成改进建议" />
        </a-steps>
      </a-card>

      <a-card class="panel-card" :bordered="false">
        <template #title>最近评估记录</template>
        <a-empty v-if="store.history.length === 0" description="还没有历史评估记录" />
        <div v-else class="history-list">
          <div
            v-for="record in store.history"
            :key="record.id"
            class="history-row"
          >
            <div>
              <div class="history-row__title">{{ record.customerName }}</div>
              <div class="history-row__meta">{{ new Date(record.createdAt).toLocaleString() }}</div>
            </div>
            <div class="history-row__score">
              <strong>{{ record.overallScore }}</strong>
              <ScoreTag :level="record.overallLevel" />
            </div>
          </div>
        </div>
      </a-card>
    </section>
  </div>
</template>
