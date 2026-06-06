import os
import chromadb
import requests
from app.config import CHROMA_PATH

_chroma_client = None

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return _chroma_client

def get_embeddings(texts: list[str]) -> list[list[float]]:
    COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")
    
    response = requests.post(
        "https://api.cohere.ai/v1/embed",
        headers={
            "Authorization": f"Bearer {COHERE_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "texts": texts,
            "model": "embed-english-v3.0",
            "input_type": "search_document"
        },
        timeout=30
    )
    
    response.raise_for_status()
    return response.json()["embeddings"]