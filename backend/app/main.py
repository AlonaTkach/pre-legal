from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import auth, documents
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Auth ---------------------------------------------------------------

class Credentials(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    email: str


def current_user_id(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user_id = auth.user_id_for_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid session")
    return user_id


@app.post("/api/auth/signup", response_model=AuthResponse)
def signup(creds: Credentials) -> AuthResponse:
    if len(creds.password) < 6:
        raise HTTPException(status_code=400, detail="Password too short")
    user_id = auth.create_user(creds.email, creds.password)
    if user_id is None:
        raise HTTPException(status_code=409, detail="Email already registered")
    return AuthResponse(token=auth.create_session(user_id), email=creds.email)


@app.post("/api/auth/login", response_model=AuthResponse)
def login(creds: Credentials) -> AuthResponse:
    user_id = auth.authenticate(creds.email, creds.password)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return AuthResponse(token=auth.create_session(user_id), email=creds.email)


# --- Catalog / templates ------------------------------------------------

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


# --- Chat ---------------------------------------------------------------

class ChatRequest(BaseModel):
    messages: list[Message]


@app.post("/api/chat")
def chat(req: ChatRequest) -> ChatResult:
    return run_chat(req.messages)


# --- Saved documents ----------------------------------------------------

class SaveDocumentRequest(BaseModel):
    name: str
    document_type: str
    fields: dict[str, str]


@app.post("/api/documents")
def create_document(
    req: SaveDocumentRequest, user_id: int = Depends(current_user_id)
) -> dict:
    doc_id = documents.save_document(user_id, req.name, req.document_type, req.fields)
    return {"id": doc_id}


@app.get("/api/documents")
def list_documents(user_id: int = Depends(current_user_id)) -> list[dict]:
    return documents.list_documents(user_id)


@app.get("/api/documents/{document_id}")
def get_document(document_id: int, user_id: int = Depends(current_user_id)) -> dict:
    doc = documents.get_document(user_id, document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


# Serve the built frontend (Next.js static export) if present. Mounted last so
# it does not shadow the /api routes.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
