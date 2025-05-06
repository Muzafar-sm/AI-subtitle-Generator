import uvicorn
import os

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1
    )

@app.post("/api/generate-subtitles")
async def generate_subtitles(
    filename: str = Query(...),
    target_language: str = "en",
    output_format: str = "srt",
    translate: bool = False
):
    # Debug: Print the upload directory and file path
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    file_path = os.path.join(upload_dir, filename)
    print(f"Looking for file at: {file_path}")
    print(f"File exists: {os.path.exists(file_path)}")
    print(f"Directory contents: {os.listdir(upload_dir)}")
    
    # Rest of your code... 