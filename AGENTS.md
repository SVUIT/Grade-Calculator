# AI Agent Guide

This document provides guidance for AI agents (like Claude, GPT, Gemini) working on this codebase. It highlights critical patterns, common pitfalls, and context that may not be immediately obvious from code alone.

## 🎯 Quick Context

This is a **grade calculator web app** built with React + TypeScript. Students can:
- Track grades across semesters
- Calculate weighted averages
- Import grades from PDF files (via Appwrite Functions)
- Calculate what scores they need to achieve a desired GPA

## 🚨 Critical Patterns to Understand

### 1. The Two Types of Score Fields

**This is the #1 source of bugs. Read carefully.**

Each subject has **two separate sets** of score fields:

```typescript
interface Subject {
  // ACTUAL SCORES - what the student received
  progressScore: string;      // User input or PDF import
  midtermScore: string;
  practiceScore: string;
  finalScore: string;
  
  // MINIMUM SCORES - calculated, NOT user input
  minProgressScore: string;   // What's needed to achieve expected score
  minMidtermScore: string;
  minPracticeScore: string;
  minFinalScore: string;
}
```

**Display Logic (SubjectRow.tsx line 270):**
```typescript
{hasMinScore ? minScore : score}
```

**Critical Rules:**
1. Min scores MUST be initialized as `""` (empty string), **NEVER `"0"`**
2. The string `"0"` is truthy in JavaScript → will display as min score
3. Min scores are ONLY populated when calculating expected scores
4. When importing from PDF, min scores should be `""`

**Why this matters:**
- If you set `minProgressScore: "0"`, the table will display `0` instead of the actual score
- This is the bug that was just fixed in the PDF import logic

### 2. PDF Import Architecture

PDF import uses **Appwrite Functions** (server-side processing):

```
User → Frontend → Appwrite Function → PDF Parser → Structured JSON → Frontend
```

**Source code:** https://github.com/SVUIT/grades-pdf-extractor

**When transforming PDF data to Subject format:**
```typescript
// ✅ CORRECT
{
  progressScore: c.scores?.progressScore?.toString() || "",
  minProgressScore: "",  // Empty string!
}

// ❌ WRONG
{
  progressScore: c.scores?.progressScore?.toString() || "",
  minProgressScore: "0",  // Will cause display bug!
}
```

### 3. Expected Score Feature

When a user enters an "expected score" (điểm kỳ vọng):
1. System calculates what scores are needed in empty fields
2. Stores calculated values in `min*Score` fields
3. Table displays these with visual indicators (purple background)

**Function:** `calcRequiredScores()` in `src/utils/gradeUtils.ts`

## 📁 Key Files to Understand

### Frontend Core
- **`src/types/index.ts`** - Type definitions (read the comments!)
- **`src/utils/gradeUtils.ts`** - Score calculations
- **`src/components/GradeTable/SubjectRow.tsx`** - Display logic (line 270 is critical)
- **`src/pages/Home.tsx`** - PDF import handler (lines 64-95)

### Backend
- **`src/config/appwrite.ts`** - Appwrite client and PDF upload
- **Appwrite Function** (external repo) - Server-side PDF parsing

## 🔍 Common Tasks & How to Approach Them

### Adding a New Feature
1. Read `docs/architecture.md` first
2. Check if it affects score handling (actual vs min scores)
3. Update types if needed
4. Add inline comments for non-obvious logic
5. Test with both manual entry and PDF import

### Fixing a Bug
1. Understand if it's related to actual vs min scores
2. Check the display logic in SubjectRow.tsx
3. Verify PDF import transformation in Home.tsx
4. Add a comment explaining WHY the bug occurred
5. Update `docs/architecture.md` if it's a new pitfall

### Modifying PDF Import
1. Remember: min scores must be `""`
2. Actual scores can be `""` if not in PDF
3. Don't default to `0` unless it's truly the score
4. Test that scores display correctly (not all zeros)
5. Verify Appwrite function is returning expected format

### Changing Score Calculations
1. Read `calcSubjectScore()` and `calcRequiredScores()` first
2. Understand the weighted average formula
3. Remember weights are stored as strings (e.g., `"20"` for 20%)
4. Test edge cases (empty scores, 0 weights, >10 scores)
5. Update testing checklist in architecture.md

## ⚠️ Common Pitfalls for AI Agents

### 1. String vs Number Confusion
- Scores are stored as **strings**, not numbers
- Empty score = `""`, not `0` or `null`
- Convert to number for calculations: `Number(score)`
- The string `"0"` is truthy!

### 2. Assuming `0` is Falsy
```typescript
// ❌ WRONG - "0" is truthy
if (minScore) { /* ... */ }

// ✅ CORRECT
if (minScore && minScore.trim() !== "") { /* ... */ }
```

### 3. Initializing Min Scores
```typescript
// ❌ WRONG - will cause display bug
minProgressScore: "0"

// ✅ CORRECT
minProgressScore: ""
```

### 4. Confusing Score Types
- `progressScore` = actual score (user input/PDF)
- `minProgressScore` = calculated minimum needed
- They are NOT the same thing!

### 5. PDF Import Defaults
```typescript
// ❌ WRONG - will display 0 if score is missing
progressScore: c.scores?.progressScore?.toString() || "0"

// ✅ CORRECT - empty if missing
progressScore: c.scores?.progressScore?.toString() || ""
```

## 🧪 Testing Guidance

Before submitting changes, verify:

**Manual Entry:**
- [ ] Create new subject → scores are empty
- [ ] Enter scores → display correctly
- [ ] Add expected score → min scores calculate and show

**PDF Import:**
- [ ] Import PDF → actual scores display (not 0s)
- [ ] Min scores are empty after import
- [ ] Can add expected scores after import

**Integration:**
- [ ] Import PDF → add expected score → calculates correctly
- [ ] Import PDF → edit score → updates calculations

## 🤖 AI-Specific Tips

### When Analyzing Code
1. Always check if a field is actual score or min score
2. Look for the display logic pattern: `{hasMinScore ? minScore : score}`
3. Trace data flow: PDF → Appwrite → Home.tsx → Subject → Display

### When Making Changes
1. Search for all usages of the field you're changing
2. Check both actual and min score variants
3. Verify initialization in multiple places (manual, PDF, defaults)
4. Consider the display logic impact

### When Explaining to Users
1. Clarify actual vs min scores upfront
2. Use concrete examples (e.g., "if you set minScore to '0'...")
3. Reference specific line numbers when helpful
4. Link to architecture.md for deeper context

## 📚 Additional Resources

- **Full Architecture:** `docs/architecture.md`
- **Documentation Strategy:** `docs/documentation-strategy.md`
- **PDF Parser Source:** https://github.com/SVUIT/grades-pdf-extractor
- **Main README:** `../README.md`

## 💡 Philosophy

This codebase values:
1. **Explicit over implicit** - Comments explain WHY, not just WHAT
2. **Type safety** - TypeScript types document contracts
3. **Clear separation** - Actual scores ≠ Min scores
4. **Documentation** - Context for both humans and AI

When in doubt, read `docs/architecture.md` or ask the user for clarification.

---

**Last Updated:** 2025-12-28  
**Maintained by:** Development team  
