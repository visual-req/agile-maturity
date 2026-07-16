-- Database schema for Agile & DevOps Maturity Assessment

CREATE DATABASE IF NOT EXISTS agile_maturity
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE agile_maturity;

-- Assessment profiles
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(128) NOT NULL,
    team_name VARCHAR(128) NOT NULL DEFAULT '',
    industry VARCHAR(64) NOT NULL DEFAULT '',
    team_size VARCHAR(64) NOT NULL DEFAULT '',
    assessor VARCHAR(64) NOT NULL DEFAULT '',
    assessment_date VARCHAR(16) NOT NULL DEFAULT '',
    mode VARCHAR(16) NOT NULL DEFAULT 'full',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual question answers
CREATE TABLE IF NOT EXISTS answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    score INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_assessment_question (assessment_id, question_id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generated reports
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id VARCHAR(64) NOT NULL UNIQUE,
    profile JSON NOT NULL,
    agile_score INT NOT NULL DEFAULT 0,
    devops_score INT NOT NULL DEFAULT 0,
    overall_score INT NOT NULL DEFAULT 0,
    overall_level VARCHAR(16) NOT NULL DEFAULT '',
    dimension_scores JSON NOT NULL,
    strengths JSON NOT NULL,
    risks JSON NOT NULL,
    recommendations JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessment history snapshots
CREATE TABLE IF NOT EXISTS history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(128) NOT NULL UNIQUE,
    customer_name VARCHAR(128) NOT NULL,
    mode VARCHAR(16) NOT NULL DEFAULT 'full',
    overall_score INT NOT NULL DEFAULT 0,
    overall_level VARCHAR(16) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes
CREATE INDEX idx_assessments_customer ON assessments(customer_name);
CREATE INDEX idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX idx_answers_assessment ON answers(assessment_id);
CREATE INDEX idx_history_created ON history(created_at DESC);
