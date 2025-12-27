// src/config/appwrite.ts
export const uploadPdf = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to process PDF');
    }

    return data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error instanceof Error ? error : new Error('Failed to process PDF');
  }
};

// Keep the existing AcademicRecord interface and other code
interface AcademicRecord {
  totalCredits: number;
  gpa: number;
  hasFGrade: boolean;
  completedThesis: boolean;
  thesisScore?: number;
  englishProficiency: {
    type: "IELTS" | "TOEFL" | "TOEIC" | "VSTEP" | "UIT";
    score: number;
  };
  completedMilitaryTraining: boolean;
  completedPhysicalEducation: boolean;
  completedSoftSkills: boolean;
  isUnderDisciplinaryAction: boolean;
}

export const checkGraduationEligibility = (
  record: AcademicRecord
): { eligible: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  if (record.totalCredits < 130)
    reasons.push(`Not enough credits (${record.totalCredits}/130 required)`);
  if (record.gpa < 2.0)
    reasons.push(`GPA too low (${record.gpa.toFixed(2)}/4.00 required)`);
  if (record.hasFGrade)
    reasons.push("Has F grade in one or more courses");
  if (
    !record.completedThesis ||
    (record.thesisScore !== undefined && record.thesisScore < 5.0)
  )
    reasons.push("Thesis or alternative requirements not met");

  const englishRequirements = {
    IELTS: 5.5,
    TOEFL: 61,
    TOEIC: 600,
    VSTEP: 3.5,
    UIT: 60,
  };
  const { type, score } = record.englishProficiency;
  if (score < englishRequirements[type])
    reasons.push("English proficiency requirement not met");

  if (!record.completedMilitaryTraining)
    reasons.push("Military training not completed");
  if (!record.completedPhysicalEducation)
    reasons.push("Physical education not completed");
  if (!record.completedSoftSkills)
    reasons.push("Soft skills requirement not met");
  if (record.isUnderDisciplinaryAction)
    reasons.push("Student is under disciplinary action");

  return { eligible: reasons.length === 0, reasons };
};