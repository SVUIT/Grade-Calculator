import { Client, Functions, Storage } from "node-appwrite";

const sanitizeFilename = (filename: string): string => {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
};

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setSelfSigned(true);

if (process.env.NEXT_PUBLIC_APPWRITE_API_KEY) {
  client.setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY);
}

const functions = new Functions(client);
const storage = new Storage(client);



export const uploadPdfDirect = async (file: File): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const payload = {
      file: base64Data,
      filename: sanitizeFilename(file.name),
      key: process.env.NEXT_PUBLIC_GRADES_PDF_EXTRACTOR_KEY || "",
    };

    const functionUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/functions/${
      process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID
    }/executions`;

    try {
      const response = (await functions.createExecution(
        process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID || "",
        JSON.stringify(payload),
        false
      )) as any;

      if (response.response) {
        try {
          const responseData =
            typeof response.response === "string"
              ? JSON.parse(response.response)
              : response.response;

          if (responseData.semesters || responseData.courseCode) {
            return responseData;
          } else if (responseData.error) {
            throw new Error(responseData.error);
          } else {
            return responseData;
          }
        } catch (e) {
          return { response: response.response };
        }
      }

      return response;
    } catch (error) {
      try {
        const fetchResponse = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project":
              process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
            "X-Appwrite-Key":
              process.env.NEXT_PUBLIC_APPWRITE_API_KEY || "",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: errorText };
          }
          throw new Error(
            `HTTP error! status: ${fetchResponse.status}, message: ${
              errorData.message || "Unknown error"
            }`
          );
        }

        const data = await fetchResponse.json();

        if (data.response) {
          try {
            const parsedResponse =
              typeof data.response === "string"
                ? JSON.parse(data.response)
                : data.response;
            if (parsedResponse.semesters || parsedResponse.courseCode) {
              return parsedResponse;
            }
            return parsedResponse;
          } catch (e) {
            return data;
          }
        }

        return data;
      } catch (fetchError) {
        throw new Error(
          `Both Appwrite client and direct fetch failed: ${
            fetchError instanceof Error ? fetchError.message : "Unknown error"
          }`
        );
      }
    }
  } catch (error) {
    throw error;
  }
};

const uploadPdfViaStorage = async (file: File): Promise<any> => {
  try {
    const fileId = `temp_${Date.now()}_${file.name}`;
    const uploadedFile = await storage.createFile("default", fileId, file);

    const response = (await functions.createExecution(
      process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID || "",
      JSON.stringify({
        fileId: uploadedFile.$id,
        filename: sanitizeFilename(file.name),
        key: process.env.NEXT_PUBLIC_APPWRITE_API_KEY,
      }),
      false
    )) as {
      status: string;
      stderr?: string;
      stdout?: string;
      response?: string;
      error?: string;
    };

    try {
      await storage.deleteFile("default", uploadedFile.$id);
    } catch (cleanupError) {}

    return response;
  } catch (error) {
    throw new Error(
      `Storage upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const uploadPdf = async (file: File): Promise<any> => {
  if (file.size <= 5 * 1024 * 1024) {
    try {
      return await uploadPdfDirect(file);
    } catch (error) {
      return uploadPdfViaStorage(file);
    }
  }
  return uploadPdfViaStorage(file);
};

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
  if (record.totalCredits < 130) {
    reasons.push(`Not enough credits (${record.totalCredits}/130 required)`);
  }
  if (record.gpa < 2.0) {
    reasons.push(`GPA too low (${record.gpa.toFixed(2)}/4.00 required)`);
  }
  if (record.hasFGrade) {
    reasons.push("Has F grade in one or more courses");
  }
  if (
    !record.completedThesis ||
    (record.thesisScore !== undefined && record.thesisScore < 5.0)
  ) {
    reasons.push("Thesis or alternative requirements not met");
  }

  const { type, score } = record.englishProficiency;
  const englishPassed =
    (type === "IELTS" && score >= 5.5) ||
    (type === "TOEFL" && score >= 61) ||
    (type === "TOEIC" && score >= 600) ||
    (type === "VSTEP" && score >= 3.5) ||
    (type === "UIT" && score >= 60);

  if (!englishPassed) {
    reasons.push("English proficiency requirement not met");
  }

  if (!record.completedMilitaryTraining) {
    reasons.push("Military training not completed");
  }
  if (!record.completedPhysicalEducation) {
    reasons.push("Physical education not completed");
  }
  if (!record.completedSoftSkills) {
    reasons.push("Soft skills requirement not met");
  }
  if (record.isUnderDisciplinaryAction) {
    reasons.push("Student is under disciplinary action");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
};
