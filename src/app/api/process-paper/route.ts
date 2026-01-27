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

        // pdf-parse v2.4.5 exports PDFParse as a named export
        const { PDFParse } = await import('pdf-parse');
        const data = await PDFParse(buffer);

        return NextResponse.json({
            text: data.text,
            metadata: data.metadata,
            numPages: data.numpages,
            info: data.info
        });
    } catch (error: any) {
        console.error('PDF processing error:', error);
        return NextResponse.json({ error: 'Failed to process PDF: ' + error.message }, { status: 500 });
    }
}
