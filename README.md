# Subtitle Generator

A web application that generates subtitles from audio files using OpenAI's Whisper model. The application supports multiple subtitle formats (SRT, VTT, ASS) and translation capabilities.

## Features

- Audio file upload and processing
- Automatic subtitle generation using Whisper AI
- Support for multiple subtitle formats (SRT, VTT, ASS)
- Translation support for generated subtitles
- Modern and responsive UI
- Real-time progress tracking

## Tech Stack

- Frontend: React.js with Next.js
- Backend: FastAPI (Python)
- AI: OpenAI Whisper
- Translation: Google Translate API

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- FFmpeg installed on your system
- Git

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the project root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Upload an audio file (supported formats: MP3, WAV, M4A)
3. Select your desired subtitle format
4. Choose target language for translation (optional)
5. Click "Generate Subtitles"
6. Download the generated subtitle file

## API Endpoints

- `POST /api/upload`: Upload audio file
- `POST /api/generate-subtitles`: Generate subtitles
- `GET /api/download/{filename}`: Download subtitle file

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 