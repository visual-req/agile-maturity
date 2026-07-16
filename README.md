# 敏捷和DevOps成熟度

一个基于 `Vue 3 + TypeScript + Vite + Ant Design Vue` 的前端评估工具，用于评估客户在 `Agile(Scrum)` 与 `DevOps` 方面的成熟度，并生成可视化报告与改进建议。

## 功能特性

- 支持 Agile / Scrum 与 DevOps 双域成熟度评估
- 支持仅 Agile、仅 DevOps、双评估三种模式
- 支持客户、团队、行业、规模、评估人、评估日期等评估配置
- 支持长列表问卷、维度锚点导航、滚动定位
- 支持维度卡片折叠、顶部操作区折叠
- 支持报告展示综合得分、维度得分、优势、风险与改进建议
- 支持导出 TXT 摘要、PDF 报告、Word 报告

## 技术栈

- Vue 3
- TypeScript
- Vite
- Ant Design Vue
- Vue Router
- Pinia
- Vitest
- ECharts / vue-echarts
- html2canvas
- jsPDF

## 页面结构

- `/`
  - 工作台首页
- `/assessment/new`
  - 评估配置页
- `/assessment/run`
  - 问卷评估页
- `/report`
  - 结果报告页

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发环境

默认端口为 `9880`：

```bash
npm run dev
```

### 类型检查

```bash
npm run check
```

### 单元测试

```bash
npm run test
```

### 构建生产版本

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run preview
```

## 项目结构

```text
src/
  components/        通用组件
  data/              评估题库
  pages/             页面级组件
  router/            路由定义
  stores/            Pinia 状态管理
  types/             类型定义
  utils/             评分与报告逻辑
public/              静态资源与 logo
docs/                项目文档
```

## 评分说明

- 每个题目按 `1-5 分` 评分
- 按题目权重计算维度得分
- 维度分数换算为百分制
- 最终输出：
  - Agile 得分
  - DevOps 得分
  - 综合得分
  - 成熟度等级
  - 优势、风险与改进建议

## 文档

- [docs/README.md](file:///Users/stephenwang/Documents/trae_projects/agile_maturity/docs/README.md)
- [docs/assessment-model.md](file:///Users/stephenwang/Documents/trae_projects/agile_maturity/docs/assessment-model.md)
- [docs/user-guide.md](file:///Users/stephenwang/Documents/trae_projects/agile_maturity/docs/user-guide.md)

## License

本项目使用 MIT License，详见 [LICENSE](file:///Users/stephenwang/Documents/trae_projects/agile_maturity/LICENSE)。
