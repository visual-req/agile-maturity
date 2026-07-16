<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, RadarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, RadarComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { DimensionScore } from '@/types/assessment'

use([CanvasRenderer, BarChart, GridComponent, LegendComponent, RadarChart, RadarComponent, TooltipComponent])

const props = defineProps<{
  items: DimensionScore[]
}>()

const radarOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {},
  legend: {
    bottom: 0,
    textStyle: { color: '#4b5563' },
  },
  radar: {
    indicator: props.items.map((item) => ({
      name: item.dimension,
      max: 100,
    })),
    splitArea: {
      areaStyle: {
        color: ['rgba(239, 246, 255, 0.8)', 'rgba(255, 255, 255, 0.96)'],
      },
    },
    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.65)' } },
    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.42)' } },
    name: { color: '#374151' },
  },
  series: [
    {
      name: '成熟度',
      type: 'radar',
      data: [
        {
          value: props.items.map((item) => item.score),
          areaStyle: { color: 'rgba(59, 130, 246, 0.18)' },
          lineStyle: { color: '#22d3c5', width: 2 },
          itemStyle: { color: '#ffd166' },
        },
      ],
    },
  ],
}))

const barOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  grid: { left: 16, right: 16, top: 12, bottom: 16, containLabel: true },
  xAxis: {
    type: 'value',
    max: 100,
    axisLabel: { color: '#6b7280' },
    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.28)' } },
  },
  yAxis: {
    type: 'category',
    data: props.items.map((item) => item.dimension),
    axisLabel: { color: '#374151' },
    axisLine: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: props.items.map((item) => ({
        value: item.score,
        itemStyle: {
          color: item.score >= 80 ? '#2ec4b6' : item.score >= 60 ? '#ffd166' : '#ff7b72',
          borderRadius: [0, 10, 10, 0],
        },
      })),
      barWidth: 18,
    },
  ],
}))
</script>

<template>
  <div class="report-charts">
    <a-card class="panel-card" :bordered="false">
      <template #title>成熟度雷达图</template>
      <v-chart class="report-chart" :option="radarOption" autoresize />
    </a-card>
    <a-card class="panel-card" :bordered="false">
      <template #title>维度得分对比</template>
      <v-chart class="report-chart report-chart--bar" :option="barOption" autoresize />
    </a-card>
  </div>
</template>
