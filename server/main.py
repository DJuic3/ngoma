import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .dataset_stub import get_dataset_summary, load_dataset
from .model_stub import generate_music

app = FastAPI(title='Ngoma API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

generated_path = os.path.join(os.path.dirname(__file__), 'generated')
app.mount('/generated', StaticFiles(directory=generated_path), name='generated')

class GenerateRequest(BaseModel):
    prompt: str
    style: str = 'modern'
    length_seconds: int = 30

class GenerateResponse(BaseModel):
    status: str
    message: str
    audioUrl: str | None = None

class DatasetInfo(BaseModel):
    name: str
    description: str
    sourceUrl: str

class DatasetSummary(BaseModel):
    datasets: list[DatasetInfo]
    sampleInstruments: list[str]
    sampleStyles: list[str]

class DatasetLoadRequest(BaseModel):
    dataset: str

class DatasetLoadResponse(BaseModel):
    status: str
    message: str

@app.get('/api/ping')
async def ping():
    return {'status': 'ok', 'message': 'Ngoma backend is alive'}

@app.get('/api/datasets', response_model=DatasetSummary)
async def list_datasets():
    return get_dataset_summary()

@app.post('/api/datasets/load', response_model=DatasetLoadResponse)
async def load_dataset_endpoint(request: DatasetLoadRequest):
    return load_dataset(request.dataset)

@app.post('/api/generate', response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    return generate_music(request.prompt, style=request.style, length_seconds=request.length_seconds)
