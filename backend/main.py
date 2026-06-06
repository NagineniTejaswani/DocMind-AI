from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from app.routes.pdf_routes import router

app = FastAPI(
    title="DocMind AI API",
    description="Upload PDFs and ask questions about them",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
        "http://localhost:5173",        # local React dev
        "http://localhost:3000",        # alternate local
        "https://doc-mind-ai-omega.vercel.app",  # production Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes from pdf_routes.py
app.include_router(router)