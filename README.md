# 📄 PDF2Sheet – Automated Invoice Extraction Demo

**PDF2Sheet** is a lightweight demo that automatically detects *shipping invoice PDFs* in a Google Drive folder, extracts structured information using an **OpenRouter LLM**, and writes the results into a **Google Sheet**.

It provides a simple, low-cost automation pipeline using:
- **Google Apps Script** (Drive scanning + Sheet generation)
- **FastAPI backend** (PDF decoding + text extraction + LLM call)
- **OpenRouter** (affordable LLM models for structured extraction)

---

## 🚀 Features

- Automatically detects new PDFs inside Google Drive  
- Extracts text from PDF using **PyMuPDF**  
- Uses OpenRouter LLMs to convert raw text → structured JSON  
- Creates a Google Sheet with standardized fields  
- Fully extensible for other document types and prompts  

---

# 📁 Project Structure
/apps_script
pdf2sheet.gs # Google Apps Script

/backend
backend.py # FastAPI backend
requirements.txt # Python dependencies

---

# 🔧 How to Use

This project has two components:

1. **Apps Script** → Monitors a Drive folder and sends PDFs to the backend  
2. **Backend** → Extracts text, calls LLM, returns structured data  

Follow the steps below.

---

# 1️⃣ Set Up the Apps Script (Drive → Backend → Sheets)

1. Go to: https://script.google.com/  
2. Create a new project  
3. Paste the contents of `pdf2sheet.gs`  
4. Fill in the following constants:

   ```js
   const FOLDER_ID = '...';        // Drive folder that receives PDFs
   const SHEETS_FOLDER_ID = '...'; // Drive folder for generated spreadsheets
   const BACKEND_URL = '...';      // URL of FastAPI endpoint (/handle_pdf)```
  
---

# 🔧 How to Use

This project has two components:

1. **Apps Script** → Monitors a Drive folder and sends PDFs to the backend  
2. **Backend** → Extracts text, calls LLM, returns structured data  

Follow the steps below.

---

# 1️⃣ Set Up the Apps Script (Drive → Backend → Sheets)

1. Go to: https://script.google.com/  
2. Create a new project  
3. Paste the contents of `pdf2sheet.gs`  
4. Fill in the following constants:

   ```js
   const FOLDER_ID = '...';        // Drive folder that receives PDFs
   const SHEETS_FOLDER_ID = '...'; // Drive folder for generated spreadsheets
   const BACKEND_URL = '...';      // URL of FastAPI endpoint (/handle_pdf)
   ```

Use the Drive URL to get folder IDs
Use ngrok or your cloud server for BACKEND_URL

Set up a trigger:
Triggers → Add Trigger → Time-driven → Every 5 minutes

Now the script will:

Look for PDFs in FOLDER_ID

Send any new PDF to the backend

Create a spreadsheet in SHEETS_FOLDER_ID

2️⃣ Run the Backend Locally

Inside /backend:

Install dependencies
pip install -r requirements.txt

Set your OpenRouter API key
export OPENROUTER_API_KEY="your_key_here"

Start the backend
uvicorn backend:app --host 0.0.0.0 --port 8000

Expose it to the Internet with ngrok
ngrok http 8000


Copy the generated URL (e.g. https://xyz.ngrok-free.app/handle_pdf)
and paste it into the Apps Script BACKEND_URL.

That’s it — your pipeline is now fully operational.
3️⃣ Deploy in the Cloud (Optional, Low Cost)

Cheap, easy hosting providers for FastAPI:

Platform	Notes
Render.com	Good free tier, easiest deployment
Railway.app	Cheap and simple
Fly.io	Free resources available
Cloud Run (Google)	Extremely cheap for low traffic
Azure Container Apps	Also cost-efficient

You only need:

backend.py

requirements.txt

(optional) a Dockerfile

✏️ Customizing the Extraction Logic
Modify the LLM prompt

Inside backend.py, update the prompt to:

Expect different fields

Use a different schema

Extract other types of documents

The included prompt is designed for shipping invoices, but you can adapt it for:

generic invoices

receipts

bills of lading

contracts

logistics documents

any text-based PDF

Modify the generated Google Sheet

In createSheetFromInvoice() (Apps Script):

Change headers

Change row mapping

Add/remove fields

This allows you to reuse the project for any document pipeline.

📬 Summary

PDF2Sheet is a clean demonstration of:

Monitoring a Drive folder

Processing PDFs on-the-fly

Extracting structured data with a low-cost LLM

Auto-generating Google Sheets

Fast to deploy, easy to modify, cheap to run.



