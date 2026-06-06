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
    USE_HF_API = os.getenv("USE_HF_API", "false").lower() == "true"
    
    if USE_HF_API:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        embeddings = []
        for text in texts:
            response = client.embeddings.create(
                model="nomic-embed-text-v1_5",
                input=text
            )
            embeddings.append(response.data[0].embedding)
        return embeddings
    else:
        global _embedding_model
        if _embedding_model is None:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        return _embedding_model.encode(texts).tolist()