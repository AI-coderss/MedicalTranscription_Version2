import os
import json
import re
import logging
from typing import Any, Dict, List, Union

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

import qdrant_client
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_qdrant import Qdrant
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
   "https://medicaltranscription-version2.onrender.com"
])

# -------------------- VECTOR STORE --------------------
def get_vector_store():
    client = qdrant_client.QdrantClient(
        url=QDRANT_HOST,
        api_key=QDRANT_API_KEY,
        timeout=60.0
    )
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    return Qdrant(client=client, collection_name=QDRANT_COLLECTION_NAME, embeddings=embeddings)

# -------------------- RAG CHAIN --------------------
def build_claims_chain():
    """
    Retrieves clinical context (ICD-10 hints, payer rules, labs/radiology guidance, etc.)
    and asks the LLM to produce a STRICT JSON object.
    """
    retriever = get_vector_store().as_retriever()
    llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=OPENAI_API_KEY)

    system = """
You are a medical claims review assistant. Your job is to analyze a clinical encounter transcript
plus extracted visit fields and produce a structured recommendation for CLAIMS REVIEW.

Follow these rules:
- Consider differential diagnoses and assign **probabilities** (0–100) that sum loosely to <= 100
  (do not force exactly 100 if uncertain).
- Suggest **ICD-10** codes for each diagnosis (best-guess only).
- Recommend appropriate **laboratory tests** (with brief rationale and optional code if known).
- Recommend **radiology** only if clinically indicated. If not indicated, return the string "N/A".
  Otherwise return a list of items with (name/modality/rationale).
- Suggest **other services** (e.g., referrals, procedures) with rationale.
- Include a short **notes** field for caveats or payer-policy highlights from retrieved context.
- OUTPUT MUST BE STRICT, VALID JSON. NO MARKDOWN. NO EXTRA TEXT.
- JSON schema:

{
  "diagnoses": [
    { "name": "string", "icd10": "string", "probability": 0 }
  ],
  "labs": [
    { "name": "string", "code": "string (optional)", "rationale": "string (optional)" }
  ],
  "radiology": "N/A" | [
    { "name": "string", "modality": "string (optional)", "rationale": "string (optional)" }
  ],
  "other_services": [
    { "name": "string", "category": "string (optional)", "rationale": "string (optional)" }
  ],
  "notes": "string"
}

Return ONLY that JSON.
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("user", "Transcript:\n{transcript}\n\nExtracted Fields JSON:\n{fields_json}\n\nUse retrieved guidelines/policies/coding help from the context to support your output.")
    ])

    combine_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever, combine_chain)

claims_chain = build_claims_chain()

# -------------------- HELPERS --------------------
def safe_json_extract(text: str) -> Dict[str, Any]:
    """
    Extract first JSON object from text; fallback to an empty schema.
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

    # find the first {...} block
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        # maybe the model returned array at top?
        try:
            j = json.loads(text)
            if isinstance(j, dict):
                return j
            # if it's not dict, wrap as notes
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
    Body:
    {
      "transcript": "full clinical conversation",
      "fields": { ... your extracted fields ... }
    }
    """
    body = request.get_json(force=True, silent=True) or {}
    transcript = (body.get("transcript") or "").strip()
    fields = body.get("fields") or {}

    if not transcript:
      return jsonify({"error": "Missing transcript"}), 400

    fields_json = json.dumps(fields, ensure_ascii=False)

    try:
        result = claims_chain.invoke({
            "transcript": transcript,
            "fields_json": fields_json
        })
        # result["answer"] contains the model output since we're using stuff_documents_chain
        raw = result.get("answer") or ""
        parsed = safe_json_extract(raw)

        # sanitize probability numeric range
        for d in parsed.get("diagnoses", []):
            try:
                p = d.get("probability", 0)
                if isinstance(p, str) and p.endswith("%"):
                    p = p[:-1]
                p = int(round(float(p)))
            except Exception:
                p = 0
            p = max(0, min(100, p))
            d["probability"] = p

        return jsonify(parsed)
    except Exception as e:
        log.exception("claims-review error")
        return jsonify({"error": str(e)}), 500

# -------------------- MAIN --------------------
if __name__ == "__main__":
    # Run on 5050 to match the frontend default
    app.run(host="0.0.0.0", port=5050, debug=True)
