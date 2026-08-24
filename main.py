import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai

app = FastAPI(title="JARVIS AI Core")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "online", "system": "JARVIS Core"}

@app.post("/api/chat")
def chat_with_jarvis(request: ChatRequest):
    if not client:
        raise HTTPException(status_status=500, detail="GEMINI_API_KEY non configurata.")
    
    try:
        system_instruction = "Sei JARVIS, un assistente IA avanzato. Rispondi in modo conciso, professionale e diretto in italiano."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.message,
            config={'system_instruction': system_instruction}
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
