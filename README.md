# GoodNotes Audio Extractor

Extract audio recordings from GoodNotes documents (.goodnotes) and download them as a ZIP.

## Render Free optimization

The original application uploaded the entire GoodNotes document to Next.js and processed it in server memory. Render Free has only 512 MB RAM, and large uploads could take a long time or exhaust memory.

The app now performs extraction and ZIP creation directly in the visitor's browser. No GoodNotes files are sent to the server. Render only needs to serve the Next.js app.

The former server upload and download endpoints respond with HTTP 410.

## Features

- Drag and drop one or more GoodNotes exports
- Extract recordings (same original heuristic: attachments larger than 1 MB)
- Show stages and progress for reading, extracting attachments and creating ZIP
- Detect invalid archives and display actionable error messages
- Rename duplicate audio files safely
- Avoid CPU-intensive recompression of MP4 recordings
- Show a memory warning for files over 200 MB

## Getting started

With Docker Compose, run:

    docker compose -f docker-compose.prod.yml up --build -d

Or locally:

    npm ci
    npm run dev

Then open http://localhost:3000.

## How it works

JSZip opens the GoodNotes ZIP archive in the browser, inspects the attachments folder, extracts attachments over 1 MB, then generates a ZIP Blob with STORE compression. The user downloads the Blob directly without visiting a server endpoint.

## Limitations

JSZip buffers content in browser memory. Processing very large files can still exceed the browser or device memory. For large documents, try processing one at a time on a desktop browser. Render Free may take longer to load the site after 15 minutes of idle time; that is unrelated to extraction.

## Stack

Next.js 16, TypeScript, React, Tailwind CSS, JSZip, Docker.

Apache License 2.0.
