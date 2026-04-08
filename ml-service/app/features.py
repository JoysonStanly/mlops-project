from __future__ import annotations

import base64
import io
import re
from collections import Counter
from dataclasses import dataclass

import pdfplumber


TOKEN_PATTERN = re.compile(r'[A-Za-z_][A-Za-z0-9_]*|\b\d+\b')


@dataclass
class FeatureSet:
    code_complexity: float
    comment_ratio: float
    repetition_score: float
    text_perplexity: float
    average_line_length: float
    function_count: float
    naming_diversity: float
    text: str


def extract_text(file_name: str, file_type: str, text_content: str | None, base64_content: str | None) -> str:
    if text_content:
      return text_content

    if not base64_content:
      raise ValueError('Either textContent or base64Content is required')

    decoded = base64.b64decode(base64_content)

    if file_name.lower().endswith('.pdf') or 'pdf' in file_type.lower():
      with pdfplumber.open(io.BytesIO(decoded)) as pdf:
        pages = [page.extract_text() or '' for page in pdf.pages]
      return '\n'.join(pages)

    return decoded.decode('utf-8', errors='ignore')


def compute_features(text: str) -> FeatureSet:
    lines = [line.rstrip() for line in text.splitlines() if line.strip()]
    total_lines = max(len(lines), 1)
    comment_lines = sum(1 for line in lines if line.lstrip().startswith(('#', '//', '/*', '*')))
    comment_ratio = comment_lines / total_lines
    average_line_length = sum(len(line) for line in lines) / total_lines

    tokens = TOKEN_PATTERN.findall(text)
    token_counts = Counter(tokens)
    repeated_tokens = sum(count - 1 for count in token_counts.values() if count > 1)
    repetition_score = min(1.0, repeated_tokens / max(len(tokens), 1))

    function_count = len(re.findall(r'\b(def|function)\b|=>', text))

    variable_like_tokens = [token for token in tokens if token and token[0].isalpha()]
    naming_diversity = len(set(variable_like_tokens)) / max(len(variable_like_tokens), 1)

    branching_keywords = ['if', 'else', 'for', 'while', 'case', 'catch', 'except', 'switch', 'elif']
    complexity_hits = sum(text.count(keyword) for keyword in branching_keywords)
    code_complexity = min(1.0, complexity_hits / max(total_lines / 3, 1))

    unique_tokens = len(set(tokens))
    lexical_density = unique_tokens / max(len(tokens), 1)
    text_perplexity = max(5.0, 120.0 * (1.0 - lexical_density + repetition_score / 2))

    return FeatureSet(
        code_complexity=round(code_complexity, 4),
        comment_ratio=round(comment_ratio, 4),
        repetition_score=round(repetition_score, 4),
        text_perplexity=round(text_perplexity, 4),
        average_line_length=round(min(1.0, average_line_length / 120.0), 4),
        function_count=round(min(1.0, function_count / max(total_lines / 8, 1)), 4),
        naming_diversity=round(min(1.0, naming_diversity), 4),
        text=text,
    )


def feature_vector(features: FeatureSet) -> list[float]:
    return [
        features.code_complexity,
        features.comment_ratio,
        features.repetition_score,
        features.text_perplexity / 150.0,
        features.average_line_length,
        features.function_count,
        features.naming_diversity,
    ]


def effort_from_features(features: FeatureSet, ai_probability: float) -> float:
    raw_score = (
        100.0
        - (ai_probability * 55.0)
        + (features.comment_ratio * 18.0)
        + (features.code_complexity * 14.0)
        + (features.function_count * 8.0)
        + (features.naming_diversity * 10.0)
    )
    return round(max(0.0, min(100.0, raw_score)), 2)


def feedback_for(ai_probability: float, effort_score: float) -> str:
    if ai_probability >= 0.8:
        return 'Likely AI-generated with moderate effort'
    if ai_probability >= 0.6:
        return 'Mixed signals: review structure, repetition, and stylistic consistency'
    if effort_score >= 75:
        return 'Likely human-authored with strong effort indicators'
    return 'Authentic-looking submission with moderate quality signals'
