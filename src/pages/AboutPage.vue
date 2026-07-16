<script setup lang="ts">
import { computed } from 'vue'

const agileDimensions = [
  {
    title: 'Scrum 角色与职责',
    description: 'Product Owner 是否稳定管理待办列表，Scrum Master 是否有效消除障碍并促进流程改进，团队是否理解并履行各自职责。',
  },
  {
    title: '事件执行',
    description: 'Sprint Planning、Daily Scrum、Review、Retrospective 是否按时执行，产出物是否清晰，行动项是否闭环。',
  },
  {
    title: '工件透明度',
    description: '冲刺目标、待办列表、完成定义（DoD）是否可视化、可追踪，并被团队与干系人一致理解。',
  },
  {
    title: '协作文化',
    description: '团队是否具备跨职能协作能力，是否鼓励主动反馈与快速响应变化，是否存在心理安全感。',
  },
  {
    title: '度量与改进',
    description: '是否建立了交付周期、完成率、缺陷趋势等核心度量体系，并用数据驱动回顾与流程改进。',
  },
]

const devopsDimensions = [
  {
    title: '代码管理',
    description: '代码分支策略、评审规范和合并门禁是否标准化，代码流转是否透明、可追溯。',
  },
  {
    title: '持续集成',
    description: '每次提交是否自动触发构建、静态检查与基础验证，流水线是否稳定且反馈快速。',
  },
  {
    title: '测试自动化',
    description: '单元测试、接口测试、端到端测试是否分层覆盖，并作为发布门禁强制执行。',
  },
  {
    title: '制品管理',
    description: '构建产物是否有统一的版本化制品仓库，是否做到一次构建多环境复用，支持安全回滚。',
  },
  {
    title: '配置管理',
    description: '应用配置、环境参数与敏感信息是否集中管理，变更是否可审计、可追溯、可回退。',
  },
  {
    title: '环境一致性',
    description: '开发、测试、预发、生产环境是否通过容器化或模板化减少差异，避免环境漂移。',
  },
  {
    title: '发布治理',
    description: '发布流程是否具备审批、灰度、回滚与变更可追踪能力，能否支撑高频安全交付。',
  },
  {
    title: '监控反馈与安全左移',
    description: '是否建立了应用监控、告警、日志追踪体系，并将安全检查前移至开发与构建阶段。',
  },
]

const levelRanges = [
  { score: '0 - 34', level: '初始', description: '实践基本缺失或高度依赖个人经验，尚未形成制度化流程。', color: '#ef4444' },
  { score: '35 - 59', level: '发展中', description: '已有局部实践尝试，但稳定性不足，缺乏标准化和跨团队复制能力。', color: '#f59e0b' },
  { score: '60 - 79', level: '稳定', description: '实践已经规范化并稳定执行，具备基本的度量和持续优化意识。', color: '#3b82f6' },
  { score: '80 - 100', level: '优化', description: '高度成熟，已形成组织级能力，可复制推广，并具备数据驱动的持续改进机制。', color: '#10b981' },
]

const scoreOptions = [
  { score: 1, label: '基本缺失', desc: '主要依赖个人经验或临时行为' },
  { score: 2, label: '局部实践', desc: '已有局部实践但不稳定，缺乏标准化' },
  { score: 3, label: '常规机制', desc: '形成常规机制，大多数团队可执行' },
  { score: 4, label: '稳定落地', desc: '实践稳定落地，具备数据驱动和持续优化能力' },
  { score: 5, label: '高度成熟', desc: '已形成组织级能力并可复制推广' },
]
</script>

<template>
  <div class="page-stack about-page">
    <section>
      <a-card class="panel-card" :bordered="false">
        <div class="about-hero">
          <h2 class="about-hero__title">评估说明</h2>
          <p class="about-hero__text">
            本工具面向咨询顾问、交付经理与客户管理层，通过结构化问卷评估客户在
            Agile（Scrum）与 DevOps 两大领域的成熟度，并以可视化报告输出等级、优势、风险和改进建议。
          </p>
        </div>
      </a-card>
    </section>

    <section class="page-grid page-grid--two">
      <a-card class="panel-card" :bordered="false">
        <template #title>评估方式</template>
        <div class="about-flow">
          <div
            v-for="(step, index) in [
              { title: '创建评估', desc: '填写客户信息、团队背景、评估范围与评估人' },
              { title: '完成问卷', desc: '按维度逐项评分（1-5 分），并补充证据备注' },
              { title: '生成报告', desc: '系统自动计算得分、等级并输出图文报告' },
              { title: '行动规划', desc: '基于报告中的短中长期改进建议制定落地计划' },
            ]"
            :key="step.title"
            class="about-flow__item"
          >
            <div class="about-flow__step">0{{ index + 1 }}</div>
            <div>
              <div class="about-flow__title">{{ step.title }}</div>
              <div class="about-flow__desc">{{ step.desc }}</div>
            </div>
          </div>
        </div>
      </a-card>

      <a-card class="panel-card" :bordered="false">
        <template #title>评分标准</template>
        <div class="about-scores">
          <div
            v-for="item in scoreOptions"
            :key="item.score"
            class="about-scores__item"
          >
            <a-tag :color="['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][item.score - 1]">
              {{ item.score }} 分
            </a-tag>
            <div>
              <div class="about-scores__label">{{ item.label }}</div>
              <div class="about-scores__desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
        <a-divider />
        <p class="panel-description">
          每道题配置权重，系统按加权得分换算为百分制维度得分。域得分按所属维度平均计算，综合得分按 Agile / DevOps 域得分平均计算。
        </p>
      </a-card>
    </section>

    <section>
      <a-card class="panel-card" :bordered="false">
        <template #title>成熟度等级</template>
        <div class="about-levels">
          <div
            v-for="item in levelRanges"
            :key="item.level"
            class="about-levels__item"
          >
            <div class="about-levels__header">
              <span class="about-levels__dot" :style="{ background: item.color }" />
              <strong>{{ item.level }}</strong>
              <span class="about-levels__range">{{ item.score }} 分</span>
            </div>
            <p class="about-levels__desc">{{ item.description }}</p>
          </div>
        </div>
      </a-card>
    </section>

    <section class="page-grid page-grid--two">
      <a-card class="panel-card" :bordered="false">
        <template #title>Agile / Scrum 评估维度</template>
        <div class="about-dimensions">
          <div
            v-for="dim in agileDimensions"
            :key="dim.title"
            class="about-dimensions__item"
          >
            <div class="about-dimensions__title">{{ dim.title }}</div>
            <div class="about-dimensions__desc">{{ dim.description }}</div>
          </div>
        </div>
      </a-card>

      <a-card class="panel-card" :bordered="false">
        <template #title>DevOps 评估维度</template>
        <div class="about-dimensions">
          <div
            v-for="dim in devopsDimensions"
            :key="dim.title"
            class="about-dimensions__item"
          >
            <div class="about-dimensions__title">{{ dim.title }}</div>
            <div class="about-dimensions__desc">{{ dim.description }}</div>
          </div>
        </div>
      </a-card>
    </section>

    <section>
      <a-card class="panel-card" :bordered="false">
        <template #title>报告输出内容</template>
        <div class="about-output">
          <a-row :gutter="[20, 16]">
            <a-col :span="8">
              <div class="about-output__card">
                <div class="about-output__icon">📊</div>
                <div class="about-output__title">综合得分与等级</div>
                <div class="about-output__desc">综合得分、Agile 得分、DevOps 得分与对应成熟度等级</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="about-output__card">
                <div class="about-output__icon">📈</div>
                <div class="about-output__title">维度分析</div>
                <div class="about-output__desc">各维度得分与等级，支持雷达图和柱状图对比</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="about-output__card">
                <div class="about-output__icon">🎯</div>
                <div class="about-output__title">改进建议</div>
                <div class="about-output__desc">按短期、中期、长期输出针对性改进行动建议</div>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </section>
  </div>
</template>
