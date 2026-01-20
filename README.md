# GoodNotes Audio Extractor

A web application to extract audio recordings from GoodNotes files (.goodnotes) and download them as a ZIP archive.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)

## Features

- 📤 Drag-and-drop file upload
- 🎵 Extracts all audio files from GoodNotes documents
- 📦 Downloads extracted audio as a ZIP file
- 🐳 Docker and Docker Compose support
- 🎨 Modern, responsive UI with dark mode

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd goodnotes-audio-extractor

# Build and run
docker-compose up --build -d

# Open in browser
open http://localhost:3000
```

### Using Docker

```bash
# Build the image
docker build -t goodnotes-extractor .

# Run the container
docker run -p 3000:3000 goodnotes-extractor
```

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

## Usage

1. Open the application in your browser
2. Drag and drop your `.goodnotes` file(s) onto the upload zone
3. Wait for the extraction to complete
4. Click "Download ZIP" to get your audio files

## How It Works

GoodNotes files are ZIP archives containing an `attachments/` folder with media files. This app:

1. Opens the `.goodnotes` file as a ZIP archive
2. Finds audio files in the `attachments/` folder (files >1MB)
3. Packages all audio files into a downloadable ZIP

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **File Processing**: JSZip

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts    # File upload endpoint
│   │   │   └── download/[sessionId]/route.ts  # ZIP download
│   │   ├── page.tsx               # Main UI
│   │   └── layout.tsx             # App layout
│   ├── components/
│   │   └── UploadZone.tsx         # Upload component
│   └── lib/
│       └── extractor.ts           # Extraction logic
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## License

MIT
