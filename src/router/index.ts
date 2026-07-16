import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: '成熟度评估工作台' },
  },
  {
    path: '/assessment/new',
    name: 'assessment-setup',
    component: () => import('@/pages/AssessmentSetupPage.vue'),
    meta: { title: '评估配置' },
  },
  {
    path: '/assessment/run',
    name: 'assessment-run',
    component: () => import('@/pages/AssessmentRunPage.vue'),
    meta: { title: '问卷评估' },
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('@/pages/ReportPage.vue'),
    meta: { title: '结果报告' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue'),
    meta: { title: '评估说明' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
