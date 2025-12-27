// src/config/appwrite.ts
import { ProcessedPdfData } from "../types";

export const uploadPdf = async (file: File): Promise<ProcessedPdfData> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to process PDF");
    }

    // Normalize backend { grades: [...] } to expected { semesters: [...] }
    if ("grades" in data) {
      return {
        semesters: [
          {
            semesterName: "Học kỳ 1",
            courses: data.grades,
          },
        ],
      };
    }

    // Already in the correct format
    return data as ProcessedPdfData;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error instanceof Error ? error : new Error("Failed to process PDF");
  }
};
