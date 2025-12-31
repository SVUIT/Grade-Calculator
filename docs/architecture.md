# Grade Calculator - Architecture Documentation

## Overview
This is a grade calculator application that allows students to track their grades and calculate what scores they need to achieve their desired GPA.

## Core Concepts

### Subject Data Model

Each subject has two types of score fields:

1. **Actual Scores** (`progressScore`, `midtermScore`, `practiceScore`, `finalScore`)
   - These are the scores the student has actually received
   - Should be displayed in the table when no expected score calculation is active
   - Can be empty strings `""` if not yet entered

2. **Minimum Required Scores** (`minProgressScore`, `minMidtermScore`, `minPracticeScore`, `minFinalScore`)
   - These are CALCULATED values, not user input
   - Only populated when a student enters an "expected score" (điểm kỳ vọng)
   - Show what minimum score is needed in empty fields to achieve the expected grade
   - **MUST be empty strings `""` by default**, never `"0"`

### Display Logic (SubjectRow.tsx)

The score cells use conditional display logic:

```typescript
// Line 232-233
const hasMinScore = minScore && minScore.toString().trim() !== "";

// Line 270
{hasMinScore ? minScore : score}
```

**How it works:**
- If `minScore` exists and is not empty → display `minScore` (with purple background)
- Otherwise → display actual `score`

**CRITICAL:** This means:
- ✅ Empty string `""` → displays actual score
- ❌ String `"0"` → displays as minimum score (wrong!)
- The string `"0"` is truthy in JavaScript, so it will be treated as a valid minimum score

### Expected Score Feature

When a user enters an expected score:
1. The system calculates what scores are needed in unfilled fields
2. These calculated values are stored in `min*Score` fields
3. The table displays these minimum scores with visual indicators:
   - Purple background if ≤ 10
   - Red text if > 10 (impossible to achieve)

### PDF Import Rules

When importing from PDF (`Home.tsx`, lines 66-92):

**✅ CORRECT:**
```typescript
minProgressScore: "",
minPracticeScore: "",
minMidtermScore: "",
minFinalScore: "",
```

**❌ WRONG:**
```typescript
minProgressScore: "0",  // This will cause all scores to display as 0!
```

**Why:** The minimum score fields should only be populated by the expected score calculation logic, never by default initialization.

## PDF Import Architecture

The PDF import feature uses **Appwrite Functions** for server-side processing to extract grade data from PDF files. The source code of the function can be found here: https://github.com/SVUIT/grades-pdf-extractor

### Architecture Overview

```
User uploads PDF → Frontend (Home.tsx) → Appwrite Function → PDF Parser → Structured Data → Frontend Display
```

### Components

1. **Frontend Upload Handler** (`src/pages/Home.tsx`, `handlePdfUpload`)
   - Handles file selection from user
   - Calls `uploadPdf()` from appwrite config
   - Transforms returned data into Subject format
   - Updates state with parsed semesters

2. **Appwrite Integration** (`src/config/appwrite.ts`, `uploadPdf`)
   - Sends PDF file to Appwrite Function endpoint
   - Receives structured JSON response
   - Returns `ProcessedPdfData` type

3. **Appwrite Function** (Server-side)
   - Receives PDF file via HTTP POST
   - Uses PDF parsing library to extract text
   - Parses grade tables and semester information
   - Returns structured JSON with semesters and courses

### Data Flow

```typescript
// 1. User uploads PDF file
<input type="file" accept=".pdf" onChange={handlePdfUpload} />

// 2. Frontend sends to Appwrite Function
const data: ProcessedPdfData = await uploadPdf(file);

// 3. Appwrite Function returns structured data
{
  semesters: [
    {
      semesterName: "Học kỳ 1 (2023-2024)",
      courses: [
        {
          courseCode: "IT001",
          courseNameVi: "Nhập môn lập trình",
          credits: 4,
          scores: {
            progressScore: 8.5,
            midtermScore: 7.0,
            practiceScore: 9.0,
            finaltermScore: 8.0,
            totalScore: 8.2
          }
        }
      ]
    }
  ]
}

// 4. Frontend transforms to Subject format (Home.tsx)
subjects: sem.courses.map((c, i): Subject => ({
  // ... actual scores from PDF
  progressScore: c.scores?.progressScore?.toString() || "",
  
  // ... CRITICAL: min scores must be empty
  minProgressScore: "",
  
  // ... default weights
  progressWeight: "20",
}))
```

### Why Appwrite Functions?

1. **Server-side processing** - PDF parsing is CPU-intensive and requires libraries not available in browser
2. **Security** - File processing happens in controlled environment
3. **Scalability** - Offloads processing from client
4. **Consistency** - Same parsing logic for all users

### Configuration

The Appwrite function endpoint is configured in `src/config/appwrite.ts`. Make sure to set up:
- Appwrite project ID
- Function endpoint URL
- API keys (if required)

### Error Handling

The PDF import includes error handling for:
- Invalid PDF format
- Parsing failures
- Network errors
- Malformed data

Errors are displayed to the user via the `pdfError` state in `Home.tsx`.

### Important Notes for PDF Import

1. **Always initialize min scores as empty strings** - See "PDF Import Rules" section
2. **Actual scores can be empty** - If PDF doesn't have a score, use `""` not `0`
3. **Credits default to "0"** - If not in PDF, but this should be rare
4. **Weights use defaults** - 20/20/20/40 split unless course catalog has different defaults

## Common Pitfalls

### 1. Initializing min scores to "0"
- **Problem:** All scores will display as 0 instead of actual scores
- **Solution:** Always initialize min scores as empty strings `""`

### 2. Confusing actual scores with minimum scores
- **Actual scores:** What the student got
- **Minimum scores:** What the student needs (calculated)

### 3. Treating 0 as falsy
- The string `"0"` is truthy in JavaScript
- Use explicit checks: `value !== "" && value != null`

## File Structure

### Frontend
- `src/types/index.ts` - Subject, Semester, and PDF data type definitions
- `src/utils/gradeUtils.ts` - Score calculation logic (weighted averages, required scores)
- `src/components/GradeTable/SubjectRow.tsx` - Score display logic and conditional rendering
- `src/pages/Home.tsx` - Main page with PDF import handler and data initialization
- `src/config/appwrite.ts` - Appwrite client configuration and PDF upload function

### Backend (Appwrite)
- Appwrite Function (server-side) - PDF parsing and text extraction
- `src/app/api/upload/route.ts` - Next.js API route (if using local processing as fallback)

## Key Functions

### `calcSubjectScore(subject)` - gradeUtils.ts
Calculates the weighted average score for a subject based on component scores and weights.

### `calcRequiredScores(subject, expectedScore)` - gradeUtils.ts
Calculates minimum required scores for unfilled components to achieve the expected score.

### `hasAllScores(subject)` - gradeUtils.ts
Checks if all four component scores are filled in.

## Testing Checklist

### Manual Entry Tests
When making changes to score handling:
- [ ] Create a new subject manually - scores should be empty
- [ ] Enter scores manually - should display correctly
- [ ] Enter an expected score - minimum scores should calculate and display
- [ ] Fill in an actual score - should replace the minimum score display
- [ ] Clear expected score - should return to showing actual scores

### PDF Import Tests
When making changes to PDF parsing or import:
- [ ] Import a valid PDF - actual scores should display correctly (not 0s)
- [ ] Verify min scores are empty strings after import
- [ ] Check that semester names are parsed correctly
- [ ] Verify course codes and names are accurate
- [ ] Confirm credits are imported (or default to "0")
- [ ] Test error handling with invalid/corrupted PDF
- [ ] Verify Appwrite function is responding correctly
- [ ] Check network error handling

### Integration Tests
- [ ] Import PDF, then add expected scores - should calculate correctly
- [ ] Import PDF, edit a score manually - should update calculations
- [ ] Import multiple PDFs in sequence - should replace data correctly
- [ ] Verify localStorage persistence after PDF import
