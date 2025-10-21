# DSAH Claims Review Server (RAG)
# Notes:
# - Accepts /claims-review and /claims-review/
# - CORS enabled for your two frontend hosts + localhost
# - Robust RAG: retrieve context -> single LLM prompt with {context}
# - Clear JSON errors; OPTIONS handled for preflight

import os
import json
import re
import logging
from typing import Any, Dict, List

from dotenv import load_dotenv
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# Qdrant + LangChain
from qdrant_client import QdrantClient
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_core.prompts import ChatPromptTemplate

# ---------- ENV ----------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment.")

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME")

# ---------- LOG ----------
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("claims-review")

# ---------- APP ----------
app = Flask(__name__)
# Allow both with/without trailing slashes
app.url_map.strict_slashes = False

# CORS
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "https://medicaltranscription-version2-tests.onrender.com",
        "https://medicaltranscription-version2.onrender.com",
    ]}},
)

# ---------- LLM ----------
llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=OPENAI_API_KEY)

# ---------- VECTOR STORE (optional but preferred) ----------
retriever = None
if QDRANT_HOST and QDRANT_COLLECTION_NAME:
    try:
        qclient = QdrantClient(url=QDRANT_HOST, api_key=QDRANT_API_KEY, timeout=60.0)
        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        vstore = QdrantVectorStore(
            client=qclient,
            collection_name=QDRANT_COLLECTION_NAME,
            embedding=embeddings,
        )
        retriever = vstore.as_retriever(search_kwargs={"k": 6})
        log.info("Qdrant retriever is ready (collection=%s)", QDRANT_COLLECTION_NAME)
    except Exception as e:
        log.exception("Qdrant initialization failed; continuing WITHOUT retrieval: %s", e)
else:
    log.warning("Qdrant env not fully set; continuing WITHOUT retrieval")

def retrieve_context(query: str, k: int = 6) -> str:
    """Fetch relevant text from the vector store; return empty string on any failure."""
    if not retriever or not query:
        return ""
    try:
        docs = retriever.get_relevant_documents(query)
        parts: List[str] = []
        for d in docs or []:
            content = getattr(d, "page_content", "")
            if content:
                parts.append(content)
        return "\n\n".join(parts)
    except Exception as e:
        log.exception("retrieve_context error: %s", e)
        return ""

# ---------- PROMPT (with {context}) ----------
SYSTEM_PROMPT = """
You are a medical claims review assistant. Analyze the clinical encounter transcript
and extracted visit fields, then produce a STRICT JSON object for CLAIMS REVIEW.

Use the retrieved clinical/coding context below for compliance, ICD-10 selection,
and appropriate services.

CONTEXT:
{context}

REQUIREMENTS:
- Provide differential diagnoses with probabilities (0–100).
- Provide ICD-10 codes for each diagnosis.
- Recommend appropriate LAB tests (brief rationale; code optional).
- Recommend RADIOLOGY only if indicated. If NOT indicated, return the string "N/A".
- Suggest other services (referrals/procedures) with rationale.
- Include a short 'notes' for caveats or payer-policy highlights.
- OUTPUT MUST BE STRICT, VALID JSON. NO MARKDOWN. NO EXTRA TEXT.

Return JSON matching EXACTLY this schema:

{{
  "diagnoses": [
    {{ "name": "string", "icd10": "string", "probability": 0 }}
  ],
  "labs": [
    {{ "name": "string", "code": "string (optional)", "rationale": "string (optional)" }}
  ],
  "radiology": "N/A" | [
    {{ "name": "string", "modality": "string (optional)", "rationale": "string (optional)" }}
  ],
  "other_services": [
    {{ "name": "string", "category": "string (optional)", "rationale": "string (optional)" }}
  ],
  "notes": "string"
}}
"""

USER_PROMPT = """
Transcript:
{transcript}

Extracted Fields JSON:
{fields_json}

Respond with JSON only.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("user", USER_PROMPT),
])

# ---------- HELPERS ----------
def safe_json_extract(text: str) -> Dict[str, Any]:
    default = {
        "diagnoses": [],
        "labs": [],
        "radiology": "N/A",
        "other_services": [],
        "notes": ""
    }
    if not text:
        return default

    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        try:
            j = json.loads(text)
            if isinstance(j, dict):
                return j
            default["notes"] = f"Model returned non-dict JSON: {type(j)}"
            return default
        except Exception:
            default["notes"] = "Model returned non-JSON text."
            return default

    try:
        return json.loads(m.group(0))
    except Exception as e:
        default["notes"] = f"JSON parse error: {str(e)}"
        return default

def normalize_probabilities(parsed: Dict[str, Any]) -> Dict[str, Any]:
    for d in parsed.get("diagnoses", []):
        try:
            p = d.get("probability", 0)
            if isinstance(p, str) and p.endswith("%"):
                p = p[:-1]
            p = int(round(float(p)))
        except Exception:
            p = 0
        d["probability"] = max(0, min(100, p))
    return parsed

# ---------- ROUTES ----------
@app.get("/")
def root():
    return jsonify({"ok": True, "service": "claims-review", "version": "v1"})

@app.get("/api/health")
def health():
    return {"ok": True}

@app.route("/claims-review", methods=["POST", "OPTIONS"])
def claims_review():
    # Satisfy preflight quickly
    if request.method == "OPTIONS":
        resp = make_response("", 204)
        return resp

    body = request.get_json(force=True, silent=True) or {}
    transcript = (body.get("transcript") or "").strip()
    fields = body.get("fields") or {}

    if not transcript:
        return jsonify({"error": "Missing transcript"}), 400

    # Build retrieval context (resilient)
    context_text = retrieve_context(transcript[:4000], k=6)
    fields_json = json.dumps(fields, ensure_ascii=False)

    try:
        messages = prompt.format_messages(
            context=context_text,
            transcript=transcript,
            fields_json=fields_json
        )
        result = llm.invoke(messages)
        raw = getattr(result, "content", "") or str(result)
        parsed = normalize_probabilities(safe_json_extract(raw))
        return jsonify(parsed)
    except Exception as e:
        log.exception("claims-review LLM error")
        return jsonify({"error": str(e)}), 500

# ---------- MAIN ----------
if __name__ == "__main__":
    # Local dev only; in production use gunicorn:  gunicorn app:app
    app.run(host="0.0.0.0", port=5050, debug=True)

