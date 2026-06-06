from sentence_transformers import SentenceTransformer
import chromadb
from app.config import CHROMA_PATH

_embedding_model = None
_chroma_client = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading embedding model...")
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Embedding model ready.")
    return _embedding_model

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
        print("ChromaDB client ready.")
    return _chroma_client