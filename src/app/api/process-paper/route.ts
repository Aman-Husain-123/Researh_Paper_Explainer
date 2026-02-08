import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // pdf-parse import fix
        const pdfParseModule = await import('pdf-parse');

        let text = '';
        let metadata = {};
        let numPages = 0;
        let info = {};

        // Handle new version (v2.x) which uses a class-based API
        if (pdfParseModule.PDFParse) {
            const parser = new pdfParseModule.PDFParse(new Uint8Array(buffer));
            const result = await parser.getText();
            text = result.text;
            numPages = result.total || 0;
            try {
                const pdfInfo = await parser.getInfo();
                info = pdfInfo;
            } catch (e) {
                console.warn('Failed to get PDF info:', e);
            }
        }
        // Handle legacy version (v1.x) or versions that export a function
        else {
            const pdfParse = (pdfParseModule as any).default || (typeof pdfParseModule === 'function' ? pdfParseModule : null);

            if (typeof pdfParse === 'function') {
                const data = await pdfParse(buffer);
                text = data.text;
                metadata = data.metadata;
                numPages = data.numpages;
                info = data.info;
            } else {
                throw new Error('pdf-parse: No valid parser found in module');
            }
        }

        return NextResponse.json({
            text,
            metadata,
            numPages,
            info
        });
    } catch (error: any) {
        console.error('PDF processing error:', error);
        return NextResponse.json({ error: 'Failed to process PDF: ' + error.message }, { status: 500 });
    }
}
