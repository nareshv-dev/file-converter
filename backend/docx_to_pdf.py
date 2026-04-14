import tempfile
import os
from docx2pdf import convert

def convert_docx_to_pdf(docx_bytes: bytes) -> bytes:
    # docx2pdf requires file paths
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_docx:
        temp_docx.write(docx_bytes)
        temp_docx_path = temp_docx.name
        
    temp_pdf_path = temp_docx_path.replace(".docx", ".pdf")
    
    try:
        # Convert docx to pdf. Note: docx2pdf requires MS Word to be installed on Windows
        convert(temp_docx_path, temp_pdf_path)
        
        with open(temp_pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        return pdf_bytes
    finally:
        # Clean up temporary files immediately
        if os.path.exists(temp_docx_path):
            os.remove(temp_docx_path)
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
