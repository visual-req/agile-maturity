<script setup lang="ts">
import { computed } from 'vue'
import type { MaturityLevel } from '@/types/assessment'

const props = defineProps<{
  level: MaturityLevel
}>()

const color = computed(() => {
  if (props.level === '优化') return 'success'
  if (props.level === '稳定') return 'processing'
  if (props.level === '发展中') return 'warning'
  return 'error'
})
</script>

<template>
  <a-tag :color="color">{{ level }}</a-tag>
</template>
