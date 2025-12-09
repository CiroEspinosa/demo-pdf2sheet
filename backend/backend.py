from fastapi import FastAPI
from pydantic import BaseModel
import base64
import fitz  # PyMuPDF
import requests
import os

# Set your OpenRouter API Key
OPENROUTER_API_KEY = ""
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

app = FastAPI()

class PDFPayload(BaseModel):
    fileId: str
    fileName: str
    pdf: str

@app.post("/handle_pdf")
def handle_pdf(payload: PDFPayload):
    try:
        print(f"Received PDF: {payload.fileName} (ID {payload.fileId})")

        # Decode PDF
        try:
            pdf_bytes = base64.b64decode(payload.pdf)
        except Exception as e:
            print("Error decoding PDF:", e)
            return {"status":"error","detail":"Error decoding PDF: "+str(e)}

        # Extract text
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            full_text = "".join([page.get_text() for page in doc])
        except Exception as e:
            print("Error extracting text from PDF:", e)
            return {"status":"error","detail":"Error extracting text: "+str(e)}

        print(f"Text extracted ({len(full_text)} characters), sending to OpenRouter...")

        # Prompt
        prompt = f"""
        Extract structured invoice data from the text below.
        If the text does not contain the required data, return null, do not hallucinate.
        Return this structure, with the following fields exactly:

        {{
        "invoice_number",
        "invoice_date",
        "due_date",
        "total_amount",
        "shipments": [
            {{
            "waybill_number",
            "ship_date",
            "shipper_name",
            "shipper_company",
            "receiver_name",
            "piece_count",
            "billed_weight",
            "shipment_total_cost",
            "contents"
            }}
        ]
        }}

        Text:
        {full_text}

        """

        # Call OpenRouter
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        payload_or = {
            "model": "gpt-4o-mini",  # free or demo model
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            resp = requests.post(OPENROUTER_URL, headers=headers, json=payload_or)
            resp.raise_for_status()
            data_str = resp.json()["choices"][0]["message"]["content"]
            print("OpenRouter responded with structured data.")
        except Exception as e:
            print("Error sending to OpenRouter:", e, resp.text if 'resp' in locals() else "")
            return {"status":"error","detail":"OpenRouter Error: "+str(e)}

        return {"status": "ok", "parsed_data": data_str, "full_text": full_text}

    except Exception as e:
        print("General error in handle_pdf:", e)
        return {"status":"error","detail":"General error: "+str(e)}
