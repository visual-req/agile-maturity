<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)

const items = computed(() => [
  { key: '/', label: '工作台' },
  { key: '/assessment/new', label: '评估配置' },
  { key: '/assessment/run', label: '问卷评估' },
  { key: '/report', label: '结果报告' },
  { key: '/about', label: '评估说明' },
])

const onSelect = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<template>
  <a-layout class="app-shell">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :width="252"
      breakpoint="lg"
      collapsed-width="64"
      class="app-shell__sider"
      :trigger="null"
    >
      <div class="brand-block" :class="{ 'is-collapsed': collapsed }">
        <img src="/logo.svg" alt="敏捷和DevOps成熟度" class="brand-block__logo" />
        <template v-if="!collapsed">
          <div class="brand-block__eyebrow">Assessment Studio</div>
          <div class="brand-block__title">Agile & DevOps</div>
          <div class="brand-block__subtitle">成熟度评估工作台</div>
        </template>
      </div>
      <a-menu
        :selected-keys="[route.path]"
        mode="inline"
        theme="light"
        class="app-shell__menu"
        @select="onSelect"
      >
        <a-menu-item
          v-for="item in items"
          :key="item.key"
        >
          {{ item.label }}
        </a-menu-item>
      </a-menu>
      <div v-if="!collapsed" class="sider-footer">
        以结构化问卷、可视化结果和改进建议，支撑客户成熟度诊断与行动规划。
      </div>
    </a-layout-sider>

    <a-layout class="app-shell__main">
      <a-layout-header class="app-shell__header">
        <div style="display:flex;align-items:center;gap:12px;">
          <a-button
            type="text"
            class="sider-trigger-btn"
            @click="collapsed = !collapsed"
          >
            <span v-if="collapsed">☰</span>
            <span v-else>✕</span>
          </a-button>
          <div>
            <div class="app-shell__header-label">咨询交付场景</div>
            <h1 class="app-shell__header-title">{{ route.meta.title ?? '成熟度评估' }}</h1>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content class="app-shell__content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
