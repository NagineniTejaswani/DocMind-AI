import os
import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.models import embedding_model, chroma_client
from app.config import CHUNK_SIZE, CHUNK_OVERLAP

def get_or_create_collection(collection_name: str):
    return chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )

def embed_and_store(chunks: list[str], collection_name: str):
    collection = get_or_create_collection(collection_name)
    embeddings = embedding_model.encode(chunks)
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        documents=chunks
    )
    return collection

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Opens a PDF file and extracts all text from every page
    Returns one big string with all the text
    """
    full_text = ""
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            
            if page_text:
                full_text += page_text + "\n"
    

    return full_text


def chunk_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = splitter.split_text(text)
    
    return chunks

def generate_collection_name(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    name = name.lower()
    name = "".join(c if c.isalnum() else "_" for c in name)
    if len(name) < 3:
        name = name + "_doc"
    return name

def collection_exists(collection_name: str) -> bool:
    existing = chroma_client.list_collections()
    return collection_name in [col.name for col in existing]

def delete_collection(collection_name: str):
    """
    Deletes existing collection so we can reprocess with new chunk settings
    """
    try:
        chroma_client.delete_collection(collection_name)
        print(f"Deleted collection: {collection_name}")
    except Exception as e:
        print(f"Collection not found, nothing to delete: {e}")


def process_and_store_pdf(pdf_path: str, collection_name: str):
    print(f"\n--- Starting PDF Processing ---")
    
    text = extract_text_from_pdf(pdf_path)
    print(f"Step 1 done — Extracted {len(text)} characters")

    if len(text.strip()) == 0:
        raise ValueError("PDF appears to be empty or scanned. Only text-based PDFs are supported.")

    chunks = chunk_text(text)
    print(f"Step 2 done — Created {len(chunks)} chunks")

    if len(chunks) == 0:
        raise ValueError("No chunks created from PDF. File may be too small or unreadable.")

    embed_and_store(chunks, collection_name)
    print(f"Step 3 done — Stored in ChromaDB")

    print(f"--- PDF Processing Complete ---\n")
    return len(chunks)