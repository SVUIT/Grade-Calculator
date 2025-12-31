# Grade Calculator

A compact, browser-based grade management app built with React and TypeScript. Track semesters and subjects and calculate weighted averages with local persistence — no account required.


Quick start

Prerequisites: Node 18+ and a package manager (npm, pnpm, or yarn).

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Useful scripts

- `npm run dev` — start the development server (HMR)
- `npm run build` — compile TypeScript and build for production (`tsc -b && vite build`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint across the project

Usage

1. Click the Add Semester row to append a new semester.
2. Use the searchable dropdown to add a course from the catalog or create a custom subject.
3. Click a subject to open the advanced editor and set scores/weights per component.
4. Review the Summary rows for weighted semester averages and the overall average.
5. Close the app or reload the page — your data is automatically saved to `localStorage`.

Developer notes

- State and persistence: `src/hooks/useGradeApp.ts`
- Grade and score calculations: `src/utils/gradeUtils.ts`
- Course catalog: `src/assets/courses_weighted.json`

**Documentation:** See the [`docs/`](./docs) folder for detailed technical documentation.

If you add or change fields related to scores or weights, add tests or manually verify behavior in the UI to avoid regressions.


