import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file was provided.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.toLowerCase().includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'The uploaded PDF file is empty (0 bytes).' }, { status: 400 });
    }

    // Bypass Turbopack static AST dynamic import rewriting by using runtime native require
    const nativeRequire = eval('require');
    const pdfModule = nativeRequire('pdf-parse');

    let extractedText = '';
    let pageCount = 1;

    if (pdfModule && typeof pdfModule.PDFParse === 'function') {
      // pdf-parse v2 API: uses PDFParse class
      const parser = new pdfModule.PDFParse({ data: buffer });
      try {
        const textResult = await parser.getText();
        extractedText = textResult?.text ? textResult.text.trim() : '';
        pageCount = textResult?.total || 1;
        try {
          const info = await parser.getInfo();
          if (info?.total) {
            pageCount = info.total;
          }
        } catch {
          // Ignore info read error, fallback to textResult.total
        }
      } finally {
        await parser.destroy();
      }
    } else if (typeof pdfModule === 'function') {
      // pdf-parse v1 API: default function export
      const parsedData = await pdfModule(buffer);
      extractedText = parsedData?.text ? parsedData.text.trim() : '';
      pageCount = parsedData?.numpages || 1;
    } else if (pdfModule?.default && typeof pdfModule.default === 'function') {
      // ES Module default export for v1
      const parsedData = await pdfModule.default(buffer);
      extractedText = parsedData?.text ? parsedData.text.trim() : '';
      pageCount = parsedData?.numpages || 1;
    } else {
      throw new Error('Unsupported pdf-parse module format.');
    }

    // Clean multiple consecutive blank lines and page footer artifacts (e.g., "-- 1 of 1 --")
    extractedText = extractedText.replace(/-- \d+ of \d+ --/g, '');
    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    if (!extractedText || extractedText.length < 15) {
      // In case PDF is image-scanned or has minimal selectable text
      extractedText = `Extracted from PDF: ${file.name}\n\nNote: The uploaded PDF appears to contain mostly scanned images or minimal selectable text. You can edit this text box to paste or refine your lecture notes directly, and the AI will still generate comprehensive MCQs, flashcards, and topic summaries!`;
    }

    const words = extractedText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      text: extractedText,
      pageCount,
      wordCount: words,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error('Error parsing PDF in /api/parse-pdf:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to parse PDF document.',
        fallbackNotice: 'You can also paste your notes directly in the text area.'
      },
      { status: 500 }
    );
  }
}
