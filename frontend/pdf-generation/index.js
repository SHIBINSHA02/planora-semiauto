import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load timetable JSON
const timetable = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample.json'), 'utf-8'));

// Convert logo.png to base64
const logoBase64 = fs.readFileSync(path.join(__dirname, 'logo.png')).toString('base64');

// Fonts
const fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, 'fonts/Roboto-Bold.ttf'),
    italics: path.join(__dirname, 'fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, 'fonts/Roboto-BoldItalic.ttf')
  }
};

const printer = new PdfPrinter(fonts);

// Helper: convert slot to styled text
function slotToStyledText(slot) {
  if (!slot) return { text: 'Free', italics: true, color: 'gray' };
  return slot.map(item => ({
    text: `${item.subject} (${item.teacher_id})\n`,
    bold: true,
    color: 'black'
  }));
}

// Prepare table body
const header = ["Day", "Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5", "Slot 6"];
let body = [header];

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
timetable.allocation.forEach((daySlots, i) => {
  const row = [dayNames[i] || `Day ${i + 1}`];
  daySlots.forEach(slot => {
    const cell = slotToStyledText(slot);
    row.push(Array.isArray(cell) ? { stack: cell } : cell);
  });
  body.push(row);
});

// PDF document definition
const docDefinition = {
  content: [
    {
      columns: [
        { text: 'PLANORA', style: 'mainHeader' },
        {
          image: 'data:image/png;base64,' + logoBase64,
          width: 60,
          alignment: 'right'
        }
      ]
    },
    { text: `\nClassroom: ${timetable.classroom}`, style: 'classHeader', margin: [0, 0, 0, 10] },
    {
      table: {
        headerRows: 1,
        body: body
      },
      layout: {
        fillColor: (rowIndex) => (rowIndex === 0 ? '#CCCCCC' : null)
      }
    }
  ],
  styles: {
    mainHeader: { fontSize: 20, bold: true },
    classHeader: { fontSize: 16, bold: true, alignment: 'center' }
  },
  defaultStyle: { font: 'Roboto' }
};

// Generate PDF
const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, 'timetable.pdf')));
pdfDoc.end();

console.log('✅ PDF generated: timetable.pdf');
