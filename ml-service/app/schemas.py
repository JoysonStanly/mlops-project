from pydantic import BaseModel, Field
from typing import Optional


class PredictRequest(BaseModel):
    fileName: str = Field(min_length=1)
    fileType: str = Field(min_length=1)
    textContent: Optional[str] = None
    base64Content: Optional[str] = None


class FeaturesResponse(BaseModel):
    code_complexity: float
    comment_ratio: float
    repetition_score: float
    text_perplexity: float
    average_line_length: float
    function_count: float
    naming_diversity: float


class PredictResponse(BaseModel):
    ai_probability: float
    effort_score: float
    prediction: str
    explanation: str
    feedback: str
    model_version: str
    features: FeaturesResponse
