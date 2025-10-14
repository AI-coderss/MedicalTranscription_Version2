
import os
import json
import re
import logging
from typing import Any, Dict

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# ✅ Correct Qdrant + LangChain imports
from qdrant_client import QdrantClient
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore

from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# -------------------- ENV & LOG --------------------
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment.")

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME")
if not QDRANT_HOST or not QDRANT_COLLECTION_NAME:
    raise ValueError("QDRANT_HOST and QDRANT_COLLECTION_NAME must be set.")

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("claims-review")

# -------------------- APP --------------------
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://medicaltranscription-version2-tests.onrender.com",
    "https://medicaltranscription-version2.onrender.com",
   
])

# -------------------- VECTOR STORE --------------------
def get_vector_store() -> QdrantVectorStore:
    """
    Build a LangChain Qdrant vector store against an existing collection.
    """
    client = QdrantClient(
        url=QDRANT_HOST,
        api_key=QDRANT_API_KEY,
        timeout=60.0
    )
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return QdrantVectorStore(
        client=client,
        collection_name=QDRANT_COLLECTION_NAME,
        embedding=embeddings,
    )

# -------------------- RAG CHAIN --------------------
def build_claims_chain():
    """
    Retrieval pipeline:
      - Retriever uses 'input' to fetch relevant context.
      - Stuff chain combines retrieved docs into {context} and feeds the prompt
        along with {transcript} and {fields_json}.
    """
    retriever = get_vector_store().as_retriever()
    llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=OPENAI_API_KEY)

    # ⚠️ IMPORTANT:
    # - Include {context} in the prompt (required).
    # - Escape literal braces in the JSON schema with {{ }} so the template engine
    #   doesn't treat them as variables.
    system = """
You are a medical claims review assistant. Analyze the clinical encounter transcript
and extracted visit fields, then produce a STRICT JSON object for CLAIMS REVIEW.

Use the retrieved clinical/coding context below to guide compliance, ICD-10 selection,
and appropriate services:

CONTEXT:
{context}

REQUIREMENTS:
- Consider differential diagnoses and assign probabilities (0–100).
- Provide ICD-10 codes for each diagnosis (best-guess).
- Recommend appropriate LAB tests (brief rationale and optional code).
- Recommend RADIOLOGY only if indicated. If NOT indicated, return the string "N/A".
- Suggest OTHER SERVICES (e.g., referrals/procedures) with rationale.
- Include a short 'notes' field for caveats or payer-policy highlights.
- OUTPUT MUST BE STRICT, VALID JSON. NO MARKDOWN. NO EXTRA TEXT.

Return JSON matching EXACTLY this schema (note: braces are literal):

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

    user = """
Transcript:
{transcript}

Extracted Fields JSON:
{fields_json}

Respond with JSON only.
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("user", user),
    ])

    combine_chain = create_stuff_documents_chain(
        llm=llm,
        prompt=prompt
        # (Optional) document_variable_name="context"  # default is "context"
    )
    return create_retrieval_chain(retriever, combine_chain)

claims_chain = build_claims_chain()

# -------------------- HELPERS --------------------
def safe_json_extract(text: str) -> Dict[str, Any]:
    """
    Extract the first JSON object from model output; otherwise return
    a safe default skeleton and note the issue in 'notes'.
    """
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
        # Try if whole text is JSON already
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

# -------------------- ROUTES --------------------
@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/claims-review")
def claims_review():
    """
    POST body:
    {
      "transcript": "full clinical conversation text",
      "fields": { ... extracted fields object ... }
    }
    """
    body = request.get_json(force=True, silent=True) or {}
    transcript = (body.get("transcript") or "").strip()
    fields = body.get("fields") or {}

    if not transcript:
        return jsonify({"error": "Missing transcript"}), 400

    fields_json = json.dumps(fields, ensure_ascii=False)

    try:
        # 'input' drives the retriever; pass transcript so retrieval matches the case.
        result = claims_chain.invoke({
            "input": transcript,
            "transcript": transcript,
            "fields_json": fields_json
        })

        raw = result.get("answer") or ""  # stuff chain returns text here
        parsed = safe_json_extract(raw)

        # Normalize probabilities to 0–100 integers
        for d in parsed.get("diagnoses", []):
            try:
                p = d.get("probability", 0)
                if isinstance(p, str) and p.endswith("%"):
                    p = p[:-1]
                p = int(round(float(p)))
            except Exception:
                p = 0
            d["probability"] = max(0, min(100, p))

        return jsonify(parsed)
    except Exception as e:
        log.exception("claims-review error")
        return jsonify({"error": str(e)}), 500

# -------------------- MAIN --------------------
if __name__ == "__main__":
    # Run on 5050 by default
    app.run(host="0.0.0.0", port=5050, debug=True)
