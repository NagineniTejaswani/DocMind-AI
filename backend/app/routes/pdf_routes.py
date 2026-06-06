from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
import shutil
import uuid
from app.ingest import process_and_store_pdf, generate_collection_name, collection_exists, delete_collection
from app.query import answer_question, clear_history
from app.config import UPLOAD_DIR, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB

router = APIRouter(prefix="/api", tags=["PDF Operations"])

class AskRequest(BaseModel):
    question: str
    collection_name: str
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ClearHistoryRequest(BaseModel):
    session_id: str

@router.get("/health")
def health_check():
    return {"status": "running", "message": "DocMind AI API is live!"}

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB."
        )

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    collection_name = generate_collection_name(file.filename)

    if collection_exists(collection_name):
        return {
            "message": "PDF already processed",
            "collection_name": collection_name,
            "filename": file.filename
        }

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    try:
        chunks_count = process_and_store_pdf(
            pdf_path=str(file_path),
            collection_name=collection_name
        )
    except ValueError as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Failed to process PDF. Please try another file.")
    finally:
        if file_path.exists():
            file_path.unlink()

    return {
        "message": "PDF processed successfully",
        "collection_name": collection_name,
        "filename": file.filename,
        "chunks_stored": chunks_count
    }

@router.post("/ask")
async def ask_question_endpoint(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if not collection_exists(request.collection_name):
        raise HTTPException(
            status_code=404,
            detail="Document not found. Please upload the PDF first."
        )

    result = answer_question(
        question=request.question,
        collection_name=request.collection_name,
        session_id=request.session_id
    )
    return {"question": result["question"], "answer": result["answer"]}

@router.post("/clear-history")
async def clear_conversation_history(request: ClearHistoryRequest):
    clear_history(request.session_id)
    return {"message": "Conversation history cleared"}

@router.get("/verify-collection/{collection_name}")
def verify_collection(collection_name: str):
    exists = collection_exists(collection_name)
    if not exists:
        raise HTTPException(
            status_code=404,
            detail="Collection not found. PDF may have been cleared."
        )
    return {"exists": True, "collection_name": collection_name}

@router.delete("/collection/{collection_name}")
def delete_collection_endpoint(collection_name: str):
    if not collection_exists(collection_name):
        raise HTTPException(
            status_code=404,
            detail="Collection not found."
        )
    delete_collection(collection_name)
    return {"message": "Collection deleted successfully", "collection_name": collection_name}