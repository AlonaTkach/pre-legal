from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from fastapi import HTTPException

from .catalog import find_template, load_catalog, read_template_markdown
from .chat import ChatResult, Message, run_chat
from .config import STATIC_DIR
from .db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Recreate the temporary database from scratch on every startup.
    init_db()
    yield


app = FastAPI(title="pre-legal API", lifespan=lifespan)

# Allow the Next.js dev server to call the API during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/catalog")
def catalog() -> dict:
    return load_catalog()


@app.get("/api/template/{template_id}")
def template(template_id: str) -> dict:
    meta = find_template(template_id)
    markdown = read_template_markdown(template_id)
    if not meta or markdown is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"id": meta["id"], "name": meta["name"], "markdown": markdown}


@app.post("/api/auth/login")
def login(_: LoginRequest) -> dict:
    # PL-4: placeholder only. No authentication yet (real auth in PL-7).
    return {"ok": True, "placeholder": True}


class ChatRequest(BaseModel):
    messages: list[Message]


@app.post("/api/chat")
def chat(req: ChatRequest) -> ChatResult:
    return run_chat(req.messages)


# Serve the built frontend (Next.js static export) if present. Mounted last so
# it does not shadow the /api routes.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
