"""Scoring logic ported from TypeScript to Python.
Mirrors src/utils/scoring.ts for server-side report generation."""

from typing import Optional

LEVEL_RANGES = [
    (34, "初始"),
    (59, "发展中"),
    (79, "稳定"),
    (100, "优化"),
]

RECOMMENDATION_LIBRARY = {
    "Scrum 角色与职责": [
        {"phase": "短期", "title": "明确角色边界", "detail": "澄清 Product Owner、Scrum Master 与团队的职责，统一待办列表维护规则。"},
        {"phase": "中期", "title": "建立角色协同节奏", "detail": "设置需求梳理、障碍管理和冲刺目标同步机制，减少职责空转。"},
        {"phase": "长期", "title": "形成组织级 Scrum 角色培养机制", "detail": "通过教练辅导和社区实践复制成熟团队经验。"},
    ],
    "事件执行": [
        {"phase": "短期", "title": "标准化 Scrum 事件模板", "detail": "为计划会、站会、评审会、回顾会定义输入、输出与时间盒。"},
        {"phase": "中期", "title": "跟踪回顾行动项闭环", "detail": "对回顾输出建立 owner 和截止时间，确保改进行动真正落地。"},
        {"phase": "长期", "title": "让事件成为经营节奏", "detail": "把迭代节奏和交付指标联动，形成持续改进的管理机制。"},
    ],
    "工件透明度": [
        {"phase": "短期", "title": "统一工件定义", "detail": "完善 DoR、DoD、看板列定义和工件状态说明，减少认知偏差。"},
        {"phase": "中期", "title": "提升可视化透明度", "detail": "将冲刺目标、依赖和阻塞项纳入看板，支持团队共同决策。"},
        {"phase": "长期", "title": "打通组织级可视化", "detail": "将团队工件透明度与项目组合视角联动，支持跨团队协同。"},
    ],
    "协作文化": [
        {"phase": "短期", "title": "引入跨职能同步机制", "detail": "让产品、研发、测试在需求澄清和风险评估阶段共同参与。"},
        {"phase": "中期", "title": "增强反馈安全感", "detail": "在回顾和复盘中建立问题可说、问题可改的团队氛围。"},
        {"phase": "长期", "title": "构建自组织团队文化", "detail": "逐步将计划、改进和执行权下沉到团队，提升响应变化能力。"},
    ],
    "度量与改进": [
        {"phase": "短期", "title": "建立核心交付指标", "detail": "优先采集迭代完成率、缺陷趋势、交付周期等关键度量。"},
        {"phase": "中期", "title": "将数据用于回顾决策", "detail": "在回顾中结合指标分析根因，制定针对性的流程改进行动。"},
        {"phase": "长期", "title": "形成持续改进驾驶舱", "detail": "沉淀跨团队对比指标和改进策略，支持组织层经营分析。"},
    ],
    "代码管理": [
        {"phase": "短期", "title": "统一代码评审与分支策略", "detail": "明确主干保护、PR 模板和最小评审要求。"},
        {"phase": "中期", "title": "强化质量门禁", "detail": "将静态检查、代码规范和基础测试纳入合并前检查。"},
        {"phase": "长期", "title": "推广主干开发能力", "detail": "逐步缩短分支生命周期，提升交付吞吐和集成效率。"},
    ],
    "持续集成": [
        {"phase": "短期", "title": "补齐自动构建链路", "detail": "确保每次提交都自动触发构建、检查和结果反馈。"},
        {"phase": "中期", "title": "优化流水线时长与稳定性", "detail": "识别瓶颈步骤，提升构建缓存和并行执行能力。"},
        {"phase": "长期", "title": "形成组织级 CI 模板", "detail": "沉淀可复用流水线模板，降低团队接入成本。"},
    ],
    "测试自动化": [
        {"phase": "短期", "title": "优先覆盖关键链路", "detail": "从核心业务流程和高风险模块开始补齐自动化测试。"},
        {"phase": "中期", "title": "把测试纳入发布门禁", "detail": "将自动化测试结果作为发布前必经条件，减少上线回归风险。"},
        {"phase": "长期", "title": "建设分层测试体系", "detail": "持续完善单测、接口、端到端测试的职责边界与协同。"},
    ],
    "制品管理": [
        {"phase": "短期", "title": "统一制品归档与命名规则", "detail": "明确构建产物的版本标识、留存周期和仓库归档方式。"},
        {"phase": "中期", "title": "打通流水线与制品仓库", "detail": "确保制品由流水线自动上传、传递和发布。"},
        {"phase": "长期", "title": "建立组织级制品治理体系", "detail": "沉淀制品追溯、审计、复用和回滚机制。"},
    ],
    "配置管理": [
        {"phase": "短期", "title": "梳理配置项与敏感信息", "detail": "识别不同环境的配置差异，清理硬编码与手工维护项。"},
        {"phase": "中期", "title": "推进配置集中管理", "detail": "通过配置中心或密钥管理服务统一管理参数与敏感信息。"},
        {"phase": "长期", "title": "实现配置可追踪可回滚", "detail": "将配置纳入版本控制、审批审计和发布验证。"},
    ],
    "环境一致性": [
        {"phase": "短期", "title": "梳理环境差异项", "detail": "盘点开发、测试、生产环境的配置差异和高发问题。"},
        {"phase": "中期", "title": "推动环境模板化", "detail": "通过容器、脚本或模板统一环境配置和部署参数。"},
        {"phase": "长期", "title": "实现环境即代码", "detail": "以标准化配置和自动化校验降低环境漂移。"},
    ],
    "发布治理": [
        {"phase": "短期", "title": "标准化发布清单", "detail": "明确审批、检查、回滚和通知项，降低人工发布失误。"},
        {"phase": "中期", "title": "提升发布自动化与可追踪性", "detail": "让发布记录、变更说明和回滚操作可留痕、可审计。"},
        {"phase": "长期", "title": "建设高频安全发布能力", "detail": "通过灰度、蓝绿或金丝雀模式提升发布频率与稳定性。"},
    ],
    "监控反馈与安全左移": [
        {"phase": "短期", "title": "补齐监控和告警覆盖", "detail": "优先建立服务健康度、错误率和核心业务指标告警。"},
        {"phase": "中期", "title": "将安全检查前移", "detail": "把依赖扫描、漏洞检测和基线校验纳入流水线。"},
        {"phase": "长期", "title": "形成闭环运营机制", "detail": "将监控、故障复盘和安全治理纳入持续改进周期。"},
    ],
}


def get_level_by_score(score: int) -> str:
    for max_score, level in LEVEL_RANGES:
        if score <= max_score:
            return level
    return "优化"


def calculate_dimension_scores(questions: list, answers: dict) -> list:
    """Calculate scores per dimension based on weighted answers."""
    from collections import OrderedDict
    
    grouped: dict[str, list] = OrderedDict()
    for q in questions:
        key = f"{q['domain']}:{q['dimension']}"
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(q)
    
    result = []
    for _, qs in grouped.items():
        total_weight = sum(q["weight"] for q in qs)
        weighted = 0
        for q in qs:
            answer = answers.get(q["id"])
            if answer:
                weighted += answer["score"] * q["weight"]
        score = 0 if total_weight == 0 else round((weighted / total_weight) * 20)
        result.append({
            "domain": qs[0]["domain"],
            "dimension": qs[0]["dimension"],
            "score": score,
            "level": get_level_by_score(score),
        })
    return result


def _domain_score(dimension_scores: list, domain: str) -> int:
    filtered = [d for d in dimension_scores if d["domain"] == domain]
    if not filtered:
        return 0
    return round(sum(d["score"] for d in filtered) / len(filtered))


def _dedupe_recommendations(items: list) -> list:
    seen = set()
    result = []
    for item in items:
        key = f"{item['phase']}-{item['title']}"
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result


def build_report(profile: dict, questions: list, answers: dict) -> dict:
    dimension_scores = calculate_dimension_scores(questions, answers)
    
    mode = profile.get("mode", "full")
    agile_score = 0 if mode == "devops" else _domain_score(dimension_scores, "agile")
    devops_score = 0 if mode == "agile" else _domain_score(dimension_scores, "devops")
    
    bases = [s for s in [agile_score, devops_score] if s > 0]
    overall_score = round(sum(bases) / len(bases)) if bases else 0
    
    strengths = [
        f"{d['dimension']}表现稳健，已达到{d['level']}水平。"
        for d in dimension_scores if d["score"] >= 80
    ][:3]
    
    risks = sorted(
        [d for d in dimension_scores if d["score"] < 60],
        key=lambda d: d["score"]
    )
    risks = [f"{d['dimension']}得分较低，当前为{d['level']}阶段。" for d in risks][:4]
    
    recommendations = []
    for d in dimension_scores:
        if d["score"] < 75 and d["dimension"] in RECOMMENDATION_LIBRARY:
            recommendations.extend(RECOMMENDATION_LIBRARY[d["dimension"]])
    recommendations = _dedupe_recommendations(recommendations)[:9]
    
    if not strengths and questions:
        strengths.append("当前整体实践已具备一定基础，可围绕高频协作场景继续提升稳定性。")
    if not risks and questions:
        risks.append("当前未发现明显短板，建议继续关注跨团队协同与自动化深度。")
    
    from datetime import datetime
    
    return {
        "profile": profile,
        "agileScore": agile_score,
        "devopsScore": devops_score,
        "overallScore": overall_score,
        "overallLevel": get_level_by_score(overall_score),
        "dimensionScores": dimension_scores,
        "strengths": strengths,
        "risks": risks,
        "recommendations": recommendations,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
