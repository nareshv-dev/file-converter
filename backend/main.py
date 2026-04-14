from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from pdf_to_docx import convert_pdf_to_docx
from docx_to_pdf import convert_docx_to_pdf
from images_to_pdf import convert_images_to_pdf

app = FastAPI(title="File Converter API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

@app.post("/api/convert/pdf-to-docx")
async def api_pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
        
    try:
        pdf_bytes = await file.read()
        docx_bytes = convert_pdf_to_docx(pdf_bytes)
        
        # Determine output filename
        out_filename = file.filename
        if out_filename.lower().endswith('.pdf'):
            out_filename = out_filename[:-4] + ".docx"
        else:
            out_filename += ".docx"
            
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{out_filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/docx-to-pdf")
async def api_docx_to_pdf(file: UploadFile = File(...)):
    valid_extensions = (".doc", ".docx")
    if not any(file.filename.lower().endswith(ext) for ext in valid_extensions):
        raise HTTPException(status_code=400, detail="File must be a DOC or DOCX")
        
    try:
        docx_bytes = await file.read()
        pdf_bytes = convert_docx_to_pdf(docx_bytes)
        
        out_filename = file.filename
        for ext in valid_extensions:
            if out_filename.lower().endswith(ext):
                out_filename = out_filename[:-len(ext)] + ".pdf"
                break
        else:
            out_filename += ".pdf"
            
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{out_filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed. Note: docx to pdf requires MS Word to be installed on the server. Error: {str(e)}")

@app.post("/api/convert/images-to-pdf")
async def api_images_to_pdf(files: List[UploadFile] = File(...)):
    valid_extensions = (".png", ".jpg", ".jpeg")
    
    try:
        images_bytes = []
        for file in files:
            if not any(file.filename.lower().endswith(ext) for ext in valid_extensions):
                continue
            content = await file.read()
            images_bytes.append(content)
            
        if not images_bytes:
            raise HTTPException(status_code=400, detail="No valid image files provided. Supported: jpg, png, jpeg")
            
        pdf_bytes = convert_images_to_pdf(images_bytes)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="converted_images.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
