import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import type { Semester, Subject } from '../types';

// Set the worker source to use the matching version from CDN
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';



export interface ParsedGrade {
  maHP: string;
  tenHP: string;
  tinChi: string;
  diemQT: string;
  diemGK: string;
  diemTH: string;
  diemCK: string;
  diemHP: string;
}

const cleanText = (text: string): string => {
  // Replace multiple spaces with single space and normalize line breaks
  return text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
};

// Helper to check if a line contains a semester header
const isSemesterLine = (line: string): boolean => {
  return /Học kỳ\s*\d+\s*-\s*Năm học\s*\d{4}-\d{4}/i.test(line);
};

// Helper to extract semester name from line
const extractSemesterName = (line: string): string => {
  const match = line.match(/(Học kỳ\s*\d+\s*-\s*Năm học\s*\d{4}-\d{4})/i);
  return match ? match[0] : `Học kỳ ${Math.floor(Math.random() * 10) + 1}`; // Fallback name if pattern not found
};

export interface ParsedSemester {
  name: string;
  subjects: ParsedGrade[];
}

export const parseGradesFromPDF = async (data: Uint8Array): Promise<Semester[]> => {
  // Convert Uint8Array to ArrayBuffer to ensure compatibility
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const result: Array<{ name: string; subjects: Omit<Subject, 'id'>[] }> = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const textItems = (textContent.items as TextItem[]).map((item) => ({
      str: item.str,
      transform: item.transform,
      width: item.width,
      height: item.height,
    }));

    textItems.sort((a, b) => {
      const aY = a.transform[5];
      const bY = b.transform[5];
      if (aY !== bY) return bY - aY;
      return a.transform[4] - b.transform[4];
    });

    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    textItems.forEach((item) => {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        lines.push(cleanText(currentLine));
        currentLine = '';
      }
      currentLine += (currentLine ? ' ' : '') + item.str;
      lastY = y;
    });

    if (currentLine) lines.push(cleanText(currentLine));

    // Find the semester line
    const semesterLine = lines.find(isSemesterLine);
    const semesterName = semesterLine ? extractSemesterName(semesterLine) : `Học kỳ ${result.length + 1}`;

    const grades: ParsedGrade[] = [];

    // Process each line looking for grade entries
    lines.forEach(line => {
      // Look for course code pattern (e.g., CSBU107, MATH101, etc.)
      const courseCodeMatch = line.match(/^([A-Z]{2,4}\d{3,4})/);
      if (courseCodeMatch) {
        // Split by spaces and filter out empty strings
        const parts = line.split(/\s+/).filter(Boolean);
        const gradeValues: number[] = [];

        // Extract numeric values that could be grades (0-10)
        for (let i = 0; i < parts.length; i++) {
          // Handle both comma and dot as decimal separators
          const num = parseFloat(parts[i].replace(',', '.'));
          if (!isNaN(num) && num >= 0 && num <= 10) {
            gradeValues.push(num);
          }
        }

        if (gradeValues.length >= 1) {
          // Find credit value (usually after course name, before grades)
          let creditIndex = -1;
          for (let i = 0; i < parts.length; i++) {
            // Match numbers with optional decimal point
            const creditMatch = parts[i].match(/^(\d+)([.,]\d+)?$/);
            if (creditMatch && i > 0) { // Ensure it's not the course code
              // Check if this is likely a credit value (usually 1-4 digits, often whole numbers)
              const potentialCredit = parseFloat(creditMatch[0].replace(',', '.'));
              if (potentialCredit > 0 && potentialCredit <= 10) {
                creditIndex = i;
                break;
              }
            }
          }

          const credit = creditIndex !== -1 ? parts[creditIndex] : '0';
          const courseCode = courseCodeMatch[1];
          // Extract course name (everything between course code and credit value)
          const courseNameStart = courseCodeMatch[0].length;
          const courseNameEnd = creditIndex !== -1 ? 
            line.indexOf(parts[creditIndex], courseNameStart) : 
            line.length;
          
          let courseName = line.substring(courseNameStart, courseNameEnd).trim();
          // Clean up the course name
          courseName = courseName
            .replace(/^[\s\-:]+/, '')  // Remove leading separators
            .replace(/[\s\-:]+$/, '')  // Remove trailing separators
            .replace(/\s+/g, ' ')       // Normalize spaces
            .trim();

          // Map grade values to their respective fields
          // Note: This is a simple mapping, might need adjustment based on actual PDF structure
          const diemQT = gradeValues[0]?.toString() || '0';
          const diemGK = gradeValues[1]?.toString() || '0';
          const diemTH = gradeValues[2]?.toString() || '0';
          const diemCK = gradeValues[3]?.toString() || '0';
          
          console.log('Parsed course:', {
            courseCode,
            courseName,
            credit: creditIndex !== -1 ? parts[creditIndex] : '0',
            diemQT,
            diemGK,
            diemTH,
            diemCK
          });

          grades.push({
            maHP: courseCode,
            tenHP: courseName,
            tinChi: credit,
            diemQT,
            diemGK,
            diemTH,
            diemCK,
            diemHP: '0',
          });
        }
      }
    });

    if (grades.length > 0) result.push({ name: semesterName, subjects: grades });
  }

  // After processing all pages, convert the result to the expected format
  return result.map((semester, index) => ({
    id: `sem-${Date.now()}-${index}`,
    name: semester.name,
    subjects: semester.subjects.map(subject => ({
      maHP: subject.maHP,
      tenHP: subject.tenHP,
      tinChi: subject.tinChi,
      diemQT: subject.diemQT,
      diemGK: subject.diemGK,
      diemTH: subject.diemTH,
      diemCK: subject.diemCK,
      min_diemQT: '0',
      min_diemGK: '0',
      min_diemTH: '0',
      min_diemCK: '0',
      weight_diemQT: '0.2',
      weight_diemGK: '0.2',
      weight_diemTH: '0.2',
      weight_diemCK: '0.4',
      expectedScore: '0',
      diemHP: subject.diemHP || '0',
    } as Subject))
  } as Semester));
};
