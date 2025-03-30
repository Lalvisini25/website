import PDFDocument from "pdfkit";
import path from 'path';
import fs from 'fs';

export const generateFeedbackPDF = (text, filename, __dirname) => {
  // Return a new promise
  return new Promise((resolve, reject) => {
    // Define the path to the font file
    const fontPath = path.join(__dirname, '..', 'fonts', 'CAVOLINI.TTF')
    // Define the path for the output PDF file
    const pdfPath = path.join('uploads', filename)

    // Create a new PDF document
    const doc = new PDFDocument()
    // Create a writable stream to the PDF path
    const stream = fs.createWriteStream(pdfPath)
    // Pipe the PDF document to the stream
    doc.pipe(stream)
    // Register a custom font for the document
    doc.registerFont('Cavolini', fontPath)
    // Set font, color, and size for the text, then add the text
    doc.font('Cavolini').fillColor('red').fontSize(14).text(text, {
      width: 450,
      align: 'left',
    })
    // Finalize the PDF file
    doc.end()
    // Resolve the promise when the stream finishes
    stream.on('finish', () => resolve('/' + pdfPath))
    // Reject the promise if there's an error
    stream.on('error', reject)
  })
}