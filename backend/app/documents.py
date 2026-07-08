import json

from .db import get_connection


def save_document(
    user_id: int, name: str, document_type: str, fields: dict[str, str]
) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO documents (user_id, name, document_type, fields_json)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, name, document_type, json.dumps(fields)),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def _row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "document_type": row["document_type"],
        "fields": json.loads(row["fields_json"]),
        "created_at": row["created_at"],
    }


def list_documents(user_id: int) -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    finally:
        conn.close()
    return [_row_to_dict(r) for r in rows]


def get_document(user_id: int, document_id: int) -> dict | None:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?",
            (document_id, user_id),
        ).fetchone()
    finally:
        conn.close()
    return _row_to_dict(row) if row else None
