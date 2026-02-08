const { PDFParse } = require('pdf-parse');

async function test() {
    const parser = new PDFParse(); // This failed before with verbosity error
    console.log('Parser instance:', parser);
}
test();
