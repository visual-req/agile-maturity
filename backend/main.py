"""FastAPI backend for Agile & DevOps Maturity Assessment."""

import json
import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_db, init_db
from scoring import build_report

app = FastAPI(title="Agile & DevOps Maturity API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Question bank (mirrors frontend data) ----------
# Loaded from a JSON snapshot of the frontend question bank.
# We store it as a static embedded dict so the backend can compute reports.
QUESTION_BANK = [
    # Agile dimensions
    {"id": "agile-role-1", "domain": "agile", "dimension": "Scrum 角色与职责", "title": "团队是否明确了 Product Owner、Scrum Master 和开发团队的角色与职责？", "weight": 1},
    {"id": "agile-role-2", "domain": "agile", "dimension": "Scrum 角色与职责", "title": "Scrum Master 是否有效消除团队障碍并促进流程改进？", "weight": 1},
    {"id": "agile-role-3", "domain": "agile", "dimension": "Scrum 角色与职责", "title": "Product Owner 是否稳定维护和管理产品待办列表？", "weight": 1},
    {"id": "agile-event-1", "domain": "agile", "dimension": "事件执行", "title": "团队是否按时执行 Sprint Planning 并产出清晰的冲刺目标？", "weight": 1},
    {"id": "agile-event-2", "domain": "agile", "dimension": "事件执行", "title": "每日站会是否高效且聚焦在同步与障碍发现？", "weight": 1},
    {"id": "agile-event-3", "domain": "agile", "dimension": "事件执行", "title": "回顾会议是否产出具体改进行动并跟踪闭环？", "weight": 1},
    {"id": "agile-artifact-1", "domain": "agile", "dimension": "工件透明度", "title": "冲刺目标和待办列表是否对团队和干系人保持透明？", "weight": 1},
    {"id": "agile-artifact-2", "domain": "agile", "dimension": "工件透明度", "title": "团队是否使用统一的完成定义（DoD）？", "weight": 1},
    {"id": "agile-artifact-3", "domain": "agile", "dimension": "工件透明度", "title": "进度和阻塞项是否在看板或类似工具上可视化？", "weight": 1},
    {"id": "agile-culture-1", "domain": "agile", "dimension": "协作文化", "title": "团队是否具备跨职能协作能力？", "weight": 1},
    {"id": "agile-culture-2", "domain": "agile", "dimension": "协作文化", "title": "团队成员是否能够在回顾中坦诚反馈并讨论问题？", "weight": 1},
    {"id": "agile-culture-3", "domain": "agile", "dimension": "协作文化", "title": "团队是否持续推动自组织和责任分担？", "weight": 1},
    {"id": "agile-metric-1", "domain": "agile", "dimension": "度量与改进", "title": "团队是否建立了核心交付指标？", "weight": 1},
    {"id": "agile-metric-2", "domain": "agile", "dimension": "度量与改进", "title": "是否使用数据驱动回顾和流程改进？", "weight": 1},
    {"id": "agile-metric-3", "domain": "agile", "dimension": "度量与改进", "title": "改进措施是否经过验证并形成制度化？", "weight": 1},
    # DevOps dimensions
    {"id": "devops-scm-1", "domain": "devops", "dimension": "代码管理", "title": "团队是否使用统一的代码分支策略？", "weight": 1},
    {"id": "devops-scm-2", "domain": "devops", "dimension": "代码管理", "title": "所有代码变更是否经过评审和门禁检查？", "weight": 1},
    {"id": "devops-scm-3", "domain": "devops", "dimension": "代码管理", "title": "代码流转过程是否可以追溯？", "weight": 1},
    {"id": "devops-ci-1", "domain": "devops", "dimension": "持续集成", "title": "每次提交是否自动触发构建和检查？", "weight": 1},
    {"id": "devops-ci-2", "domain": "devops", "dimension": "持续集成", "title": "流水线反馈是否快速且可靠？", "weight": 1},
    {"id": "devops-ci-3", "domain": "devops", "dimension": "持续集成", "title": "团队是否及时修复失败的构建？", "weight": 1},
    {"id": "devops-test-1", "domain": "devops", "dimension": "测试自动化", "title": "是否有分层自动化测试覆盖核心业务？", "weight": 1},
    {"id": "devops-test-2", "domain": "devops", "dimension": "测试自动化", "title": "自动化测试结果是否作为发布门禁？", "weight": 1},
    {"id": "devops-test-3", "domain": "devops", "dimension": "测试自动化", "title": "测试用例是否持续维护并与业务对齐？", "weight": 1},
    {"id": "devops-artifact-1", "domain": "devops", "dimension": "制品管理", "title": "构建产物是否统一存储在制品仓库？", "weight": 1},
    {"id": "devops-artifact-2", "domain": "devops", "dimension": "制品管理", "title": "制品是否由流水线自动上传和传递？", "weight": 1},
    {"id": "devops-artifact-3", "domain": "devops", "dimension": "制品管理", "title": "制品是否支持版本追溯和安全回滚？", "weight": 1},
    {"id": "devops-config-1", "domain": "devops", "dimension": "配置管理", "title": "应用配置是否集中管理并版本化？", "weight": 1},
    {"id": "devops-config-2", "domain": "devops", "dimension": "配置管理", "title": "敏感信息是否通过密钥管理服务保护？", "weight": 1},
    {"id": "devops-config-3", "domain": "devops", "dimension": "配置管理", "title": "配置变更是否可审计和可追溯？", "weight": 1},
    {"id": "devops-env-1", "domain": "devops", "dimension": "环境一致性", "title": "各环境配置差异是否已被有效管理？", "weight": 1},
    {"id": "devops-env-2", "domain": "devops", "dimension": "环境一致性", "title": "环境是否通过容器或模板化方式标准化？", "weight": 1},
    {"id": "devops-env-3", "domain": "devops", "dimension": "环境一致性", "title": "是否避免了环境漂移导致的线上问题？", "weight": 1},
    {"id": "devops-release-1", "domain": "devops", "dimension": "发布治理", "title": "发布流程是否标准化并具备审批机制？", "weight": 1},
    {"id": "devops-release-2", "domain": "devops", "dimension": "发布治理", "title": "是否具备灰度发布或金丝雀发布能力？", "weight": 1},
    {"id": "devops-release-3", "domain": "devops", "dimension": "发布治理", "title": "发布变更是否可追踪和可回滚？", "weight": 1},
    {"id": "devops-monitor-1", "domain": "devops", "dimension": "监控反馈与安全左移", "title": "是否建立了应用监控和关键告警？", "weight": 1},
    {"id": "devops-monitor-2", "domain": "devops", "dimension": "监控反馈与安全左移", "title": "安全检查是否已前移至开发和构建阶段？", "weight": 1},
    {"id": "devops-monitor-3", "domain": "devops", "dimension": "监控反馈与安全左移", "title": "故障复盘和监控反馈是否进入持续改进循环？", "weight": 1},
]


def _get_questions(mode: str) -> list:
    if mode == "full":
        return QUESTION_BANK
    return [q for q in QUESTION_BANK if q["domain"] == mode]


# ---------- Pydantic models ----------

class ProfileModel(BaseModel):
    customerName: str
    teamName: str = ""
    industry: str = ""
    teamSize: str = ""
    assessor: str = ""
    assessmentDate: str = ""
    mode: str = "full"

class AnswerModel(BaseModel):
    questionId: str
    score: int
    note: str = ""

class AnswersPayload(BaseModel):
    answers: list[AnswerModel]

class CreateAssessmentPayload(BaseModel):
    profile: ProfileModel

class AssessmentResponse(BaseModel):
    id: str
    profile: dict
    answers: list[dict]
    completed: bool
    completionRate: int

class ReportResponse(BaseModel):
    assessmentId: str
    profile: dict
    agileScore: int
    devopsScore: int
    overallScore: int
    overallLevel: str
    dimensionScores: list
    strengths: list[str]
    risks: list[str]
    recommendations: list
    createdAt: str

class HistoryItem(BaseModel):
    id: str
    customerName: str
    mode: str
    overallScore: int
    overallLevel: str
    createdAt: str


@app.on_event("startup")
def startup():
    init_db()


# ---------- Assessment CRUD ----------

@app.post("/api/assessments", status_code=201)
def create_assessment(payload: CreateAssessmentPayload):
    assessment_id = str(uuid.uuid4())
    p = payload.profile.model_dump()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO assessments (id, customer_name, team_name, industry,
               team_size, assessor, assessment_date, mode)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (assessment_id, p["customerName"], p["teamName"], p["industry"],
             p["teamSize"], p["assessor"], p["assessmentDate"], p["mode"]),
        )
    return {"id": assessment_id}


@app.get("/api/assessments/{assessment_id}")
def get_assessment(assessment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments WHERE id = %s", (assessment_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(404, "评估记录未找到")
        
        cursor.execute("SELECT question_id, score, note FROM answers WHERE assessment_id = %s", (assessment_id,))
        answer_rows = cursor.fetchall()
        
        questions = _get_questions(row["mode"])
        answered = sum(1 for q in questions if any(a["question_id"] == q["id"] and a["score"] for a in answer_rows))
        completion_rate = round(answered / len(questions) * 100) if questions else 0
        
        return {
            "id": row["id"],
            "profile": {
                "customerName": row["customer_name"],
                "teamName": row["team_name"],
                "industry": row["industry"],
                "teamSize": row["team_size"],
                "assessor": row["assessor"],
                "assessmentDate": str(row["assessment_date"]),
                "mode": row["mode"],
            },
            "answers": [{"questionId": a["question_id"], "score": a["score"], "note": a["note"]} for a in answer_rows],
            "completed": completion_rate == 100,
            "completionRate": completion_rate,
        }


@app.put("/api/assessments/{assessment_id}")
def update_profile(assessment_id: str, payload: ProfileModel):
    p = payload.model_dump()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE assessments SET customer_name=%s, team_name=%s, industry=%s,
               team_size=%s, assessor=%s, assessment_date=%s, mode=%s
               WHERE id=%s""",
            (p["customerName"], p["teamName"], p["industry"],
             p["teamSize"], p["assessor"], p["assessmentDate"], p["mode"], assessment_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(404, "评估记录未找到")
    return {"ok": True}


@app.delete("/api/assessments/{assessment_id}")
def delete_assessment(assessment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assessments WHERE id = %s", (assessment_id,))
        if cursor.rowcount == 0:
            raise HTTPException(404, "评估记录未找到")
    return {"ok": True}


# ---------- Answers ----------

@app.put("/api/assessments/{assessment_id}/answers")
def save_answers(assessment_id: str, payload: AnswersPayload):
    with get_db() as conn:
        cursor = conn.cursor()
        for a in payload.answers:
            cursor.execute(
                """INSERT INTO answers (assessment_id, question_id, score, note)
                   VALUES (%s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE score=VALUES(score), note=VALUES(note)""",
                (assessment_id, a.questionId, a.score, a.note),
            )
    return {"ok": True}


# ---------- Report ----------

@app.post("/api/assessments/{assessment_id}/report")
def generate_report(assessment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments WHERE id = %s", (assessment_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(404, "评估记录未找到")
        
        profile = {
            "customerName": row["customer_name"],
            "teamName": row["team_name"],
            "industry": row["industry"],
            "teamSize": row["team_size"],
            "assessor": row["assessor"],
            "assessmentDate": str(row["assessment_date"]),
            "mode": row["mode"],
        }
        
        cursor.execute("SELECT question_id, score, note FROM answers WHERE assessment_id = %s", (assessment_id,))
        answer_rows = cursor.fetchall()
        answers = {a["question_id"]: {"score": a["score"], "note": a["note"]} for a in answer_rows}
        
        questions = _get_questions(row["mode"])
        report = build_report(profile, questions, answers)
        
        cursor.execute(
            """INSERT INTO reports (assessment_id, profile, agile_score, devops_score,
               overall_score, overall_level, dimension_scores, strengths, risks, recommendations)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               ON DUPLICATE KEY UPDATE
               profile=VALUES(profile), agile_score=VALUES(agile_score),
               devops_score=VALUES(devops_score), overall_score=VALUES(overall_score),
               overall_level=VALUES(overall_level), dimension_scores=VALUES(dimension_scores),
               strengths=VALUES(strengths), risks=VALUES(risks),
               recommendations=VALUES(recommendations)""",
            (assessment_id, json.dumps(profile, ensure_ascii=False),
             report["agileScore"], report["devopsScore"],
             report["overallScore"], report["overallLevel"],
             json.dumps(report["dimensionScores"], ensure_ascii=False),
             json.dumps(report["strengths"], ensure_ascii=False),
             json.dumps(report["risks"], ensure_ascii=False),
             json.dumps(report["recommendations"], ensure_ascii=False)),
        )
        
        # Save to history
        history_id = f"{profile['customerName']}-{report['createdAt']}"
        cursor.execute(
            """INSERT IGNORE INTO history (record_id, customer_name, mode, overall_score, overall_level, created_at)
               VALUES (%s, %s, %s, %s, %s, NOW())""",
            (history_id, profile["customerName"], row["mode"], report["overallScore"], report["overallLevel"]),
        )
        
        return {"assessmentId": assessment_id, **report}


@app.get("/api/assessments/{assessment_id}/report")
def get_report(assessment_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE assessment_id = %s", (assessment_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(404, "报告未生成")
        return {
            "assessmentId": assessment_id,
            "profile": json.loads(row["profile"]),
            "agileScore": row["agile_score"],
            "devopsScore": row["devops_score"],
            "overallScore": row["overall_score"],
            "overallLevel": row["overall_level"],
            "dimensionScores": json.loads(row["dimension_scores"]),
            "strengths": json.loads(row["strengths"]),
            "risks": json.loads(row["risks"]),
            "recommendations": json.loads(row["recommendations"]),
            "createdAt": str(row["created_at"]),
        }


# ---------- History ----------

@app.get("/api/reports/history")
def get_history():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM history ORDER BY created_at DESC LIMIT 20")
        rows = cursor.fetchall()
        return [
            {
                "id": r["record_id"],
                "customerName": r["customer_name"],
                "mode": r["mode"],
                "overallScore": r["overall_score"],
                "overallLevel": r["overall_level"],
                "createdAt": str(r["created_at"]),
            }
            for r in rows
        ]


# ---------- Health ----------

@app.get("/api/health")
def health():
    return {"status": "ok"}
