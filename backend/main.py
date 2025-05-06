from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import whisper
import os
import tempfile
import srt
from datetime import timedelta
from typing import Optional, List
import json
from pathlib import Path
from subtitle_converter import SubtitleConverter
from translator import SubtitleTranslator
from pydantic import BaseModel

app = FastAPI(title="Subtitle Generator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize models
whisper_model = whisper.load_model("base")
translator = SubtitleTranslator()

class SubtitleEdit(BaseModel):
    index: int
    start: float
    end: float
    text: str

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {"filename": file.filename, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-subtitles")
async def generate_subtitles(
    filename: str,
    target_language: Optional[str] = "en",
    output_format: str = "srt",
    translate: bool = False
):
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Transcribe audio using Whisper
        result = whisper_model.transcribe(
            str(file_path),
            language=target_language,
            task="transcribe"
        )

        # Convert to subtitle format
        subtitles = []
        for i, segment in enumerate(result["segments"], start=1):
            subtitle = {
                "index": i,
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            }
            subtitles.append(subtitle)

        # Translate if requested
        if translate and target_language != "en":
            subtitles = await translator.translate_subtitles(
                subtitles,
                target_language
            )

        # Generate subtitle file in requested format
        output_filename = f"{Path(filename).stem}.{output_format}"
        output_path = UPLOAD_DIR / output_filename
        
        SubtitleConverter.convert_format(
            "srt",
            output_format,
            subtitles,
            output_path
        )

        return {
            "status": "success",
            "subtitle_file": output_filename,
            "subtitles": subtitles
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/edit-subtitles")
async def edit_subtitles(
    filename: str,
    edits: List[SubtitleEdit],
    output_format: str = "srt"
):
    try:
        # Read existing subtitles
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        with open(file_path, "r", encoding="utf-8") as f:
            subtitles = json.load(f)

        # Apply edits
        for edit in edits:
            for sub in subtitles:
                if sub["index"] == edit.index:
                    sub["start"] = edit.start
                    sub["end"] = edit.end
                    sub["text"] = edit.text
                    break

        # Generate new subtitle file
        output_filename = f"{Path(filename).stem}_edited.{output_format}"
        output_path = UPLOAD_DIR / output_filename
        
        SubtitleConverter.convert_format(
            "srt",
            output_format,
            subtitles,
            output_path
        )

        return {
            "status": "success",
            "subtitle_file": output_filename,
            "subtitles": subtitles
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    media_type = {
        "srt": "application/x-subrip",
        "vtt": "text/vtt",
        "ass": "text/x-ssa"
    }.get(Path(filename).suffix[1:], "application/octet-stream")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 