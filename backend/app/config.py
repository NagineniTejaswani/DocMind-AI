from pathlib import Path

# Single source of truth for all paths and settings
BASE_DIR = Path(__file__).parent.parent  # points to backend/

CHROMA_PATH = BASE_DIR / "chroma_db"
UPLOAD_DIR = BASE_DIR / "uploaded_files"

# Ensure directories exist
CHROMA_PATH.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

# Chunking settings
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
N_RESULTS = 8

# Upload settings
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024