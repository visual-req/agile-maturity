<script setup lang="ts">
import { computed, nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import QuestionCard from '@/components/QuestionCard.vue'
import { useAssessmentStore } from '@/stores/assessment'
import { groupQuestionsByDimension } from '@/utils/scoring'

const router = useRouter()
const store = useAssessmentStore()
const activeKey = ref('')
const headerCollapsed = ref(true)
const contentRef = ref<HTMLElement | null>(null)
const sectionRefs = ref<Record<string, HTMLElement | null>>({})
const collapsedSections = ref<Record<string, boolean>>({})
const dimNavCollapsed = ref(false)

const groupedSections = computed(() => {
  const groups = groupQuestionsByDimension(store.profile.mode)
  return Object.entries(groups).map(([key, questions]) => ({
    key,
    title: questions[0].dimension,
    domain: questions[0].domain,
    questions,
    completed: questions.every((item) => Boolean(store.answers[item.id]?.score)),
  }))
})

watch(
  groupedSections,
  async (sections) => {
    if (!sections.length) {
      activeKey.value = ''
      return
    }

    if (!sections.some((item) => item.key === activeKey.value)) {
      activeKey.value = sections[0].key
    }

    const currentState = { ...collapsedSections.value }
    sections.forEach((section) => {
      if (currentState[section.key] === undefined) {
        currentState[section.key] = false
      }
    })
    collapsedSections.value = currentState

    await nextTick()
    handleContentScroll()
  },
  { immediate: true },
)

const currentSection = computed(
  () => groupedSections.value.find((item) => item.key === activeKey.value) ?? groupedSections.value[0],
)

const setSectionRef = (key: string, el: Element | ComponentPublicInstance | null) => {
  sectionRefs.value[key] = el instanceof HTMLElement ? el : null
}

const scrollToSection = async (key: string) => {
  activeKey.value = key
  collapsedSections.value[key] = false
  await nextTick()

  const container = contentRef.value
  const target = sectionRefs.value[key]

  if (!container || !target) {
    return
  }

  container.scrollTo({
    top: Math.max(target.offsetTop - 12, 0),
    behavior: 'smooth',
  })
}

const toggleSectionCollapsed = (key: string) => {
  collapsedSections.value[key] = !collapsedSections.value[key]
}

const handleContentScroll = () => {
  const container = contentRef.value

  if (!container || groupedSections.value.length === 0) {
    return
  }

  const currentOffset = container.scrollTop + 96
  let nearestKey = groupedSections.value[0].key

  groupedSections.value.forEach((section) => {
    const element = sectionRefs.value[section.key]

    if (element && element.offsetTop <= currentOffset) {
      nearestKey = section.key
    }
  })

  activeKey.value = nearestKey
}

const onChangeAnswer = (payload: { questionId: string, score: number, note: string }) => {
  store.answerQuestion(payload.questionId, payload.score, payload.note)
}

const resetCurrentSection = () => {
  if (!currentSection.value) {
    return
  }

  Modal.confirm({
    title: '确认重置当前维度？',
    content: '该维度下已填写的评分和备注将被清空。',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      currentSection.value?.questions.forEach((question) => {
        delete store.answers[question.id]
      })
      message.success('当前维度已重置。')
    },
  })
}

const submitAssessment = async () => {
  if (!store.completed) {
    message.warning('请先完成全部题目评分，再生成报告。')
    return
  }

  try {
    await store.createReport()
    message.success('报告已生成。')
    router.push('/report')
  } catch (e: any) {
    message.error(e?.message ?? '报告生成失败，请重试。')
  }
}
</script>

<template>
  <div class="page-stack assessment-page">
    <section>
      <a-card class="panel-card assessment-overview" :bordered="false">
        <div class="assessment-overview__top">
          <div>
            <div class="progress-head__label">当前客户</div>
            <h3 class="progress-head__title">{{ store.profile.customerName || '未命名客户' }}</h3>
          </div>
          <div class="assessment-overview__summary">
            <span class="assessment-overview__meta">完成度 {{ store.completionRate }}%</span>
            <a-button type="link" class="assessment-overview__toggle" @click="headerCollapsed = !headerCollapsed">
              {{ headerCollapsed ? '展开顶部操作' : '收起顶部操作' }}
            </a-button>
          </div>
        </div>

        <div v-show="!headerCollapsed" class="assessment-overview__body">
          <div class="progress-head">
            <div class="assessment-overview__info">
              <div class="assessment-overview__meta">评估模式：{{ store.profile.mode === 'full' ? '双评估' : store.profile.mode === 'agile' ? 'Agile / Scrum' : 'DevOps' }}</div>
              <div class="assessment-overview__meta">维度数量：{{ groupedSections.length }}</div>
            </div>
            <div class="progress-head__actions">
              <a-progress type="circle" :percent="store.completionRate" :width="70" />
              <a-button @click="resetCurrentSection">重置当前维度</a-button>
              <a-button type="primary" @click="submitAssessment">生成报告</a-button>
            </div>
          </div>
        </div>
      </a-card>
    </section>

    <section class="assessment-layout assessment-layout--full">
      <a-card class="panel-card assessment-layout__menu" :bordered="false">
        <template #title>
          <div class="dim-nav__title-bar">
            <span>评估维度</span>
            <a-button type="text" class="dim-nav__toggle-btn" @click="dimNavCollapsed = !dimNavCollapsed">
              <span v-if="dimNavCollapsed">☰ 展开</span>
              <span v-else>✕ 收起</span>
            </a-button>
          </div>
        </template>
        <div v-show="!dimNavCollapsed" class="dimension-nav">
          <button
            v-for="section in groupedSections"
            :key="section.key"
            class="dimension-nav__item"
            :class="{ 'is-active': section.key === activeKey, 'is-complete': section.completed }"
            @click="scrollToSection(section.key)"
          >
            <span>{{ section.title }}</span>
            <small>
              {{ section.domain === 'agile' ? 'Agile' : 'DevOps' }} · {{ section.questions.length }} 题
            </small>
          </button>
        </div>
      </a-card>

      <div
        ref="contentRef"
        class="assessment-layout__content assessment-layout__content--scroll"
        @scroll="handleContentScroll"
      >
        <section
          v-for="section in groupedSections"
          :key="section.key"
          :ref="(el) => setSectionRef(section.key, el)"
          class="assessment-section"
        >
          <a-card class="panel-card assessment-section__summary" :bordered="false">
            <div class="assessment-section__summary-head">
              <div>
                <div class="assessment-section__summary-title">{{ section.title }}</div>
                <p class="panel-description">
                  当前维度下共 {{ section.questions.length }} 个题目，请按实际情况评分并补充证据备注。
                </p>
              </div>
              <a-button
                type="text"
                class="assessment-section__summary-toggle"
                @click="toggleSectionCollapsed(section.key)"
              >
                <span class="assessment-section__summary-toggle-text">
                  {{ collapsedSections[section.key] ? '展开' : '折叠' }}
                </span>
                <span
                  class="assessment-section__summary-arrow"
                  :class="{ 'is-collapsed': collapsedSections[section.key] }"
                >
                  ▾
                </span>
              </a-button>
            </div>
          </a-card>

          <template v-if="!collapsedSections[section.key]">
            <QuestionCard
              v-for="(question, index) in section.questions"
              :key="question.id"
              :index="index"
              :question="question"
              :answer="store.answers[question.id]"
              @change="onChangeAnswer"
            />
          </template>
        </section>
      </div>
    </section>
  </div>
</template>
