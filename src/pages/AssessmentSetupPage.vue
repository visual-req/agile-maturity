<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAssessmentStore } from '@/stores/assessment'
import type { AssessmentMode, AssessmentProfile } from '@/types/assessment'

const router = useRouter()
const store = useAssessmentStore()

const formState = reactive<AssessmentProfile>({ ...store.profile })

watch(
  () => store.profile,
  (value) => {
    Object.assign(formState, value)
  },
  { deep: true },
)

const modeOptions: Array<{ label: string, value: AssessmentMode }> = [
  { label: '双评估（推荐）', value: 'full' },
  { label: '仅 Agile / Scrum', value: 'agile' },
  { label: '仅 DevOps', value: 'devops' },
]

const teamSizeOptions = ['10 人以内', '10-30 人', '30-100 人', '100 人以上']
const industryOptions = ['互联网', '金融', '制造', '零售', '政企', '医疗', '其他']

const submit = () => {
  store.updateProfile({ ...formState })
  store.clearAnswers()
  store.report = null
  message.success('评估配置已保存，开始进入问卷评估。')
  router.push('/assessment/run')
}
</script>

<template>
  <div class="page-stack">
    <section class="page-grid page-grid--wide">
      <a-card class="panel-card" :bordered="false">
        <template #title>创建评估任务</template>
        <a-form
          layout="vertical"
          class="setup-form"
        >
          <div class="form-grid">
            <a-form-item label="客户名称" required>
              <a-input v-model:value="formState.customerName" placeholder="例如：华北某制造集团" />
            </a-form-item>
            <a-form-item label="团队名称" required>
              <a-input v-model:value="formState.teamName" placeholder="例如：数字化平台团队" />
            </a-form-item>
            <a-form-item label="行业">
              <a-select v-model:value="formState.industry" placeholder="请选择行业">
                <a-select-option
                  v-for="item in industryOptions"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="团队规模">
              <a-select v-model:value="formState.teamSize" placeholder="请选择团队规模">
                <a-select-option
                  v-for="item in teamSizeOptions"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="评估人">
              <a-input v-model:value="formState.assessor" placeholder="请输入咨询顾问或负责人姓名" />
            </a-form-item>
            <a-form-item label="评估日期">
              <a-date-picker
                v-model:value="formState.assessmentDate"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </a-form-item>
          </div>

          <a-form-item label="评估范围">
            <a-radio-group v-model:value="formState.mode" option-type="button" button-style="solid">
              <a-radio-button
                v-for="option in modeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-alert
            type="info"
            show-icon
            message="评分说明"
            description="每个题目按 1-5 分评估，系统会结合权重计算维度得分，并生成成熟度等级和改进建议。"
          />

          <div class="setup-actions">
            <a-button size="large" @click="router.push('/')">
              返回工作台
            </a-button>
            <a-button
              type="primary"
              size="large"
              @click="submit"
              :disabled="!formState.customerName || !formState.teamName"
            >
              开始问卷评估
            </a-button>
          </div>
        </a-form>
      </a-card>

      <a-card class="panel-card" :bordered="false">
        <template #title>评估方法说明</template>
        <div class="insight-list">
          <div class="insight-item">
            <strong>Agile / Scrum</strong>
            <span>关注角色职责、事件执行、工件透明度、团队协作与持续改进。</span>
          </div>
          <div class="insight-item">
            <strong>DevOps</strong>
            <span>关注代码管理、持续集成、测试自动化、环境一致性、发布治理与反馈闭环。</span>
          </div>
          <div class="insight-item">
            <strong>输出结果</strong>
            <span>系统会生成总分、等级判定、维度洞察和短中长期改进建议。</span>
          </div>
        </div>
      </a-card>
    </section>
  </div>
</template>
