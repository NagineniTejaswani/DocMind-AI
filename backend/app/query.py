from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.models import get_embeddings, get_chroma_client
from app.config import N_RESULTS
from dotenv import load_dotenv
from pathlib import Path
import requests

load_dotenv(Path(__file__).parent.parent / ".env")

llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

conversation_histories: dict[str, list] = {}

def get_or_create_history(session_id: str) -> list:
    if session_id not in conversation_histories:
        conversation_histories[session_id] = []
    return conversation_histories[session_id]

def clear_history(session_id: str):
    if session_id in conversation_histories:
        conversation_histories[session_id] = []

def retrieve_relevant_chunks(question: str, collection_name: str, n_results: int = N_RESULTS) -> list[str]:
    COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")
    
    response = requests.post(
        "https://api.cohere.ai/v1/embed",
        headers={
            "Authorization": f"Bearer {COHERE_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "texts": [question],
            "model": "embed-english-v3.0",
            "input_type": "search_query"
        },
        timeout=30
    )
    
    response.raise_for_status()
    question_embedding = response.json()["embeddings"]
    
    collection = get_chroma_client().get_collection(collection_name)
    results = collection.query(
        query_embeddings=question_embedding,
        n_results=n_results
    )
    return results['documents'][0]

def generate_answer(question: str, context_chunks: list[str], session_id: str) -> str:
    context = "\n\n---\n\n".join(context_chunks)
    history = get_or_create_history(session_id)

    messages = [
    SystemMessage(content=f"""You are DocMind AI, a helpful and friendly document assistant.

If the user sends a greeting like hi, hello, hey or thanks — respond naturally and warmly. Let them know you are ready to help them explore their document.

For all other questions, answer using ONLY the context provided below.
Read ALL sections completely before answering.
Combine information across sections into one complete answer.
If the answer is not in the context, say something like: "I could not find that information in the uploaded document. Try rephrasing your question or ask something else about the document."
Do not use outside knowledge for document questions. Be precise, clear and friendly.

Context from document:
{context}""")
]

    messages.extend(history)
    messages.append(HumanMessage(content=question))

    response = llm.invoke(messages)
    answer = response.content

    history.append(HumanMessage(content=question))
    history.append(AIMessage(content=answer))

    return answer

def answer_question(question: str, collection_name: str, session_id: str) -> dict:
    chunks = retrieve_relevant_chunks(question, collection_name)
    answer = generate_answer(question, chunks, session_id)
    return {"question": question, "answer": answer}