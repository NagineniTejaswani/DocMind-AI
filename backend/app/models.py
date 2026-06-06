import os
import chromadb
from app.config import CHROMA_PATH

_chroma_client = None

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return _chroma_client

def get_embeddings(texts: list[str]) -> list[list[float]]:
    import requests

    HF_TOKEN = os.getenv("HF_TOKEN", "")
    API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
    
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": texts, "options": {"wait_for_model": True}},
        timeout=60
    )
    
    response.raise_for_status()
    result = response.json()
    
    if isinstance(result, list) and len(result) > 0:
        if isinstance(result[0], list):
            return result
        if isinstance(result[0], dict) and "embedding" in result[0]:
            return [item["embedding"] for item in result]
    
    raise RuntimeError(f"Unexpected response from HuggingFace: {result}")