<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AssessmentQuestion, QuestionAnswer } from '@/types/assessment'

const props = defineProps<{
  answer?: QuestionAnswer
  index: number
  question: AssessmentQuestion
}>()

const emit = defineEmits<{
  change: [payload: { questionId: string, score: number, note: string }]
}>()

const note = ref(props.answer?.note ?? '')
const score = ref<number | undefined>(props.answer?.score)

watch(
  () => props.answer,
  (value) => {
    note.value = value?.note ?? ''
    score.value = value?.score
  },
  { deep: true },
)

const label = computed(() => `${props.index + 1}. ${props.question.title}`)

const updateScore = (value: number) => {
  score.value = value
  emit('change', {
    questionId: props.question.id,
    score: value,
    note: note.value,
  })
}

const updateNote = () => {
  if (!score.value) {
    return
  }
  emit('change', {
    questionId: props.question.id,
    score: score.value,
    note: note.value,
  })
}
</script>

<template>
  <a-card class="question-card" :bordered="false">
    <div class="question-card__head">
      <div>
        <div class="question-card__dimension">{{ question.dimension }}</div>
        <h3 class="question-card__title">{{ label }}</h3>
      </div>
      <a-tag color="gold">{{ question.weight.toFixed(1) }} 权重</a-tag>
    </div>

    <p class="question-card__description">{{ question.description }}</p>
    <div class="question-card__hint">建议证据：{{ question.evidenceHint }}</div>

    <a-radio-group
      :value="score"
      button-style="solid"
      class="question-card__options"
      @update:value="updateScore"
    >
      <a-radio-button
        v-for="option in question.options"
        :key="option.score"
        :value="option.score"
      >
        <div class="question-card__option-title">{{ option.label }}</div>
        <div class="question-card__option-text">{{ option.description }}</div>
      </a-radio-button>
    </a-radio-group>

    <a-textarea
      v-model:value="note"
      :rows="3"
      placeholder="补充观察、证据或现状备注"
      class="question-card__note"
      @blur="updateNote"
    />
  </a-card>
</template>
