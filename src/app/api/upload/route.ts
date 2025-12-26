import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Appwrite-Project',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

export async function OPTIONS() {
  return NextResponse.json('ok', { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'No file provided or invalid file type' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF files are allowed' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send PDF to Appwrite function with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    let data: any;
    try {
      const response = await fetch('https://69478a26003b6dfde997.syd.appwrite.run/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Appwrite function returned ${response.status}: ${errorData}`);
      }

      data = await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request to Appwrite function timed out');
      }
      throw error;
    }

    //-------------------------------------------------------------------
    // ⬇️ Extra logic: fill in missing semester and cumulative summaries
    //-------------------------------------------------------------------
    const semesters = Array.isArray(data.semesters) ? data.semesters : [];
    let totalCreditsAccumulated = 0;
    let totalWeightedScore = 0;

    semesters.forEach((sem: any) => {
      const courses = Array.isArray(sem.courses) ? sem.courses : [];
      let semesterCredits = 0;
      let semesterWeighted = 0;

      courses.forEach((course: any) => {
        const credits = Number(course.credits) || 0;
        const totalScore = Number(course.scores?.totalScore) || 0;
        semesterCredits += credits;
        semesterWeighted += totalScore * credits;

        totalCreditsAccumulated += credits;
        totalWeightedScore += totalScore * credits;
      });

      sem.semesterSummary = {
        ...sem.semesterSummary,
        totalCredits: semesterCredits,
        averageScore: semesterCredits > 0 ? +(semesterWeighted / semesterCredits).toFixed(2) : 0,
        numberOfCourses: courses.length,
      };
    });

    // Final cumulative summary
    const cumulativeGpa =
      totalCreditsAccumulated > 0
        ? +(totalWeightedScore / totalCreditsAccumulated).toFixed(2)
        : 0;

    data.cumulativeSummary = {
      totalCreditsAccumulated,
      cumulativeGpa,
    };

    //-------------------------------------------------------------------
    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process PDF. Please try again later.'
      },
      {
        status: error.status || 500,
        headers: corsHeaders
      }
    );
  }
}
