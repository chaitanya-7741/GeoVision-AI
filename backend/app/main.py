from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from .services.land_use import analyze_land_use
from .services.s3_service import upload_image


app = FastAPI(
    title="GeoVision AI",
    description="Cloud-Based Satellite Image Analysis System",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Root
# ============================================================

@app.get("/")
def root():

    return {
        "message": "GeoVision AI Backend is running",
        "status": "success"
    }


# ============================================================
# Health
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# Analyze Satellite Image
# ============================================================

@app.post("/api/analyze")
async def analyze_image(
    file: UploadFile = File(...)
):

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/tiff"
    ]

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    if file.content_type not in allowed_types:

        return {
            "success": False,
            "message": "Unsupported image format"
        }

    try:

        # ----------------------------------------------------
        # Read image
        # ----------------------------------------------------

        contents = await file.read()
        s3_location = upload_image(
            io.BytesIO(contents),
            file.filename or "upload",
            file.content_type
        )

        image = Image.open(
            io.BytesIO(contents)
        )
        image_format = image.format
        image = image.convert("RGB")

        width, height = image.size

        # ----------------------------------------------------
        # Run land-use analysis
        # ----------------------------------------------------

        analysis = analyze_land_use(
            image
        )

        # ----------------------------------------------------
        # Return result
        # ----------------------------------------------------

        return {
            "success": True,
            "filename": file.filename,
            "s3_bucket": s3_location["bucket"],
            "s3_key": s3_location["key"],
            "s3_region": s3_location["region"],
            "image_format": image_format,
            "width": width,
            "height": height,
            "classification_image": analysis["classification_image"],
"overlay_image": analysis["overlay_image"],
"water_mask": analysis["water_mask"],
"crop_mask": analysis["crop_mask"],
            "analysis_method": (
                "HSV-based Computer Vision"
            ),

            "categories": analysis["categories"],

            "total_pixels": (
                analysis["total_pixels"]
            ),

            "water_percentage": (
                analysis["water_percentage"]
            ),

            "land_percentage": (
                analysis["land_percentage"]
            ),

            "message": (
                "Satellite land-use analysis "
                "completed successfully"
            )
        }

    except Exception as e:

        return {
            "success": False,
            "message": f"Analysis failed: {str(e)}"
        }