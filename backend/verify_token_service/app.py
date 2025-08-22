# app.py
import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import uvicorn
from utils import (
    get_current_user_id
)


IS_PROD = False


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"message": "running"}


@app.get("/auth/verify-token")
async def login(user_id: int = Depends(get_current_user_id)):
    if user_id:
        return {"user_id": user_id}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


if __name__ == "__main__":
    if IS_PROD:
        handler = Mangum(app, lifespan="off")  # Lambda entry point
    else:
        uvicorn.run("app:app", host="0.0.0.0", port=8004, reload=True)