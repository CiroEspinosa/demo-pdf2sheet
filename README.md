
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

## 📁 Project Structure
/apps_script
pdf2sheet.gs # Google Apps Script

/backend
backend.py # FastAPI backend
requirements.txt # Python dependencies

---

## 🔧 How to Use

## 1️⃣ Set Up the Apps Script (Drive → Backend → Sheets)

1. Go to: https://script.google.com/  
2. Create a new project  
3. Paste the contents of `pdf2sheet.gs`  
4. Fill in the following constants:

   ```js
   const FOLDER_ID = '...';        // Drive folder that receives PDFs
   const SHEETS_FOLDER_ID = '...'; // Drive folder for generated spreadsheets
   const BACKEND_URL = 'https://abc.ngrok-free.dev/handle_pdf';      // URL of FastAPI endpoint (/handle_pdf) (see with ngrok http 8000)
   ```
   <img width="643" height="328" alt="image" src="https://github.com/user-attachments/assets/09e699c3-13e7-48d5-925c-a67e1e635430" />

5. Set up a trigger:
Triggers → Add Trigger → Time-driven → Every 5 minutes

Now the script will:
Look for PDFs in FOLDER_ID
Send any new PDF to the backend
Create a spreadsheet in SHEETS_FOLDER_ID

## 2️⃣ Run the Backend Locally

Inside /backend:

1. Install dependencies
pip install -r requirements.txt

2. Set your OpenRouter API key
export OPENROUTER_API_KEY="your_key_here"

3. Start the backend
uvicorn backend:app --host 0.0.0.0 --port 8000

4. Expose it to the Internet with ngrok
ngrok http 8000

5. Copy the generated URL (e.g. https://xyz.ngrok-free.app/handle_pdf)
and paste it into the Apps Script BACKEND_URL.

## 3️⃣ Deploy in the Cloud (Optional, Low Cost)

Easy hosting providers optionsfor FastAPI:
* Render.com
* Railway.app
* Fly.io
* Cloud Run (Google)
* Azure Container Apps

You only need:

* backend.py
* requirements.txt
* (optional) a Dockerfile

## 📬 Summary

Demo-PDF2Sheet is a clean demonstration of:

* Monitoring a Drive folder
* Processing PDFs on-the-fly
* Extracting structured data with a low-cost LLM
* Auto-generating Google Sheets

<img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/2bbd001d-83f7-4df6-a921-830a9721b25d" />

<img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/610a1c96-52ad-46d8-95f2-8a719b75c48c" />

### This demo project can be easily adapted to process other types of documents by modifying the LLM prompt, selecting a different model, or updating the spreadsheet-generation logic.



