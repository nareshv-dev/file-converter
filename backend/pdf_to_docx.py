import tempfile
import os
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_bytes: bytes) -> bytes:
    # pdf2docx requires file paths, so we use temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        temp_pdf.write(pdf_bytes)
        temp_pdf_path = temp_pdf.name
        
    temp_docx_path = temp_pdf_path + ".docx"
    
    try:
        cv = Converter(temp_pdf_path)
        cv.convert(temp_docx_path, start=0, end=None)
        cv.close()
        
        with open(temp_docx_path, "rb") as f:
            docx_bytes = f.read()
            
        return docx_bytes
    finally:
        # Clean up temporary files immediately
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
        if os.path.exists(temp_docx_path):
            os.remove(temp_docx_path)
