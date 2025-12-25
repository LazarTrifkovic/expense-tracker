import os
from fastapi import FastAPI

app = FastAPI()


@app.get("/api-key")
def get_api_key():
    api_key = os.getenv("api_key_openai")
    return {"api_key": api_key}
