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
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={GEMINI_API_KEY}"
    
    embeddings = []
    for text in texts:
        response = requests.post(
            url,
            json={
                "model": "models/embedding-001",
                "content": {"parts": [{"text": text}]}
            },
            timeout=30
        )
        response.raise_for_status()
        embedding = response.json()["embedding"]["values"]
        embeddings.append(embedding)
    
    return embeddings