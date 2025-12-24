import { Client, Functions, type Models } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const functions = new Functions(client);

// File upload utility
export const uploadPdf = async (file: File): Promise<any> => {
  try {
    // Convert file to base64
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

    // Call the Appwrite function
    const response = await functions.createExecution(
      import.meta.env.VITE_APPWRITE_FUNCTION_ID,
      JSON.stringify({
        file: fileData,
        filename: file.name,
        key: import.meta.env.VITE_GRADES_PDF_EXTRACTOR_KEY
      }),
      true
    ) as Models.Execution & { stderr?: string; response?: string };

    if (response.status === 'failed') {
      throw new Error(response.stderr || 'Function execution failed');
    }

    return response.response ? JSON.parse(response.response) : {};
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof TypeError) {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    }
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during file upload');
  }
};

interface AcademicRecord {
  totalCredits: number;
  gpa: number;
  hasFGrade: boolean;
  completedThesis: boolean;
  thesisScore?: number;
  englishProficiency: {
    type: 'IELTS' | 'TOEFL' | 'TOEIC' | 'VSTEP' | 'UIT';
    score: number;
  };
  completedMilitaryTraining: boolean;
  completedPhysicalEducation: boolean;
  completedSoftSkills: boolean;
  isUnderDisciplinaryAction: boolean;
}

export const checkGraduationEligibility = (record: AcademicRecord): { eligible: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // 1. Check credit and GPA requirements
  if (record.totalCredits < 130) {
    reasons.push(`Not enough credits (${record.totalCredits}/130 required)`);
  }
  if (record.gpa < 2.0) {
    reasons.push(`GPA too low (${record.gpa.toFixed(2)}/4.00 required)`);
  }
  if (record.hasFGrade) {
    reasons.push('Has F grade in one or more courses');
  }

  // 2. Check thesis or alternative requirements
  if (!record.completedThesis || (record.thesisScore !== undefined && record.thesisScore < 5.0)) {
    reasons.push('Thesis or alternative requirements not met');
  }

  // 3. Check English proficiency
  const { type, score } = record.englishProficiency;
  const englishPassed = 
    (type === 'IELTS' && score >= 5.5) ||
    (type === 'TOEFL' && score >= 61) ||
    (type === 'TOEIC' && score >= 600) ||
    (type === 'VSTEP' && score >= 3.5) || // B1 level
    (type === 'UIT' && score >= 60); // Assuming 60 is passing for UIT test

  if (!englishPassed) {
    reasons.push('English proficiency requirement not met');
  }

  // 4. Check additional requirements
  if (!record.completedMilitaryTraining) {
    reasons.push('Military training not completed');
  }
  if (!record.completedPhysicalEducation) {
    reasons.push('Physical education not completed');
  }
  if (!record.completedSoftSkills) {
    reasons.push('Soft skills requirement not met');
  }

  // 5. Check disciplinary status
  if (record.isUnderDisciplinaryAction) {
    reasons.push('Student is under disciplinary action');
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
};