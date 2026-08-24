from fastapi import FastAPI

app = FastAPI(
    title="JARVIS AI Core",
    description="Sistema Centrale per JARVIS AI",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {
        "system": "JARVIS AI Core",
        "status": "Online",
        "security_level": "Protected"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
