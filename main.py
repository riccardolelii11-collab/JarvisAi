import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI(title="JARVIS AI Core")

# Configurazione CORS per consentire le chiamate dal frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chat.tagliaetrasforma.it",
        "http://chat.tagliaetrasforma.it",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurazione Gemini
api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

client = genai.Client(api_key=api_key) if api_key else None


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "JARVIS Core",
        "model": model_name
    }


@app.post("/api/chat")
def chat_with_jarvis(request: ChatRequest):
    if not client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY non configurata."
        )

    try:
        system_instruction = (
            "Sei JARVIS, un assistente IA avanzato. "
            "Rispondi in modo conciso, professionale e diretto in italiano."
        )

        response = client.models.generate_content(
            model=model_name,
            contents=request.message,
            config={
                "system_instruction": system_instruction
            }
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
