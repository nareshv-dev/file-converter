import io
from PIL import Image

def convert_images_to_pdf(image_files: list) -> bytes:
    """
    image_files: list of bytes representing image files
    """
    images = []
    
    for img_bytes in image_files:
        img = Image.open(io.BytesIO(img_bytes))
        # Convert to RGB to ensure compatibility for PDF format
        if img.mode != 'RGB':
            img = img.convert('RGB')
        images.append(img)
        
    if not images:
        raise ValueError("No images provided")
        
    output = io.BytesIO()
    
    # Save multiple images into a single PDF
    if len(images) == 1:
        images[0].save(output, format='PDF')
    else:
        images[0].save(output, format='PDF', save_all=True, append_images=images[1:])
        
    return output.getvalue()
