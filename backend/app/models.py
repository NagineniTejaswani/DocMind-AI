from sentence_transformers import SentenceTransformer
import chromadb
from app.config import CHROMA_PATH

print("Loading embedding model...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
print("Models and DB client ready.")