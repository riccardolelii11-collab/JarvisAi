import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI(title="JARVIS AI Core")

# Configura la chiave API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "online", "system": "JARVIS Core"}

@app.post("/api/chat")
def chat_with_jarvis(request: ChatRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY non configurata.")
    
    try:
        # Usa il modello stabile e veloce
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction="Sei JARVIS, un assistente IA avanzato. Rispondi in modo conciso, professionale e diretto in italiano."
        )
        response = model.generate_content(request.message)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
