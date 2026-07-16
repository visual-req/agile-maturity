import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AssessmentSetupPage from '@/pages/AssessmentSetupPage.vue'
import AssessmentRunPage from '@/pages/AssessmentRunPage.vue'
import ReportPage from '@/pages/ReportPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { title: '成熟度评估工作台' },
  },
  {
    path: '/assessment/new',
    name: 'assessment-setup',
    component: AssessmentSetupPage,
    meta: { title: '评估配置' },
  },
  {
    path: '/assessment/run',
    name: 'assessment-run',
    component: AssessmentRunPage,
    meta: { title: '问卷评估' },
  },
  {
    path: '/report',
    name: 'report',
    component: ReportPage,
    meta: { title: '结果报告' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
