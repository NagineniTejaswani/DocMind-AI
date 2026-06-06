import os
import chromadb
from app.config import CHROMA_PATH

_chroma_client = None
_embedding_model = None

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    return _chroma_client

def get_embeddings(texts: list[str]) -> list[list[float]]:
    HF_TOKEN = os.getenv("HF_TOKEN")
    USE_HF_API = os.getenv("USE_HF_API", "false").lower() == "true"
    
    if USE_HF_API and HF_TOKEN:
        # Production — use HuggingFace API
        import requests
        API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": texts, "options": {"wait_for_model": True}},
            timeout=30
        )
        if response.status_code != 200:
            raise ValueError(f"HuggingFace API error: {response.status_code}")
        result = response.json()
        if isinstance(result, dict) and "error" in result:
            raise ValueError(f"HuggingFace model error: {result['error']}")
        return result
    else:
        # Local development — use sentence-transformers
        global _embedding_model
        if _embedding_model is None:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        return _embedding_model.encode(texts).tolist()