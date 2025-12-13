export interface Subject {
  maHP: string;
  tenHP: string;
  tinChi: string;
  diemQT: string;
  diemGK: string;
  diemTH: string;
  diemCK: string;
  min_diemQT: string;
  min_diemGK: string;
  min_diemTH: string;
  min_diemCK: string;
  weight_diemQT: string;
  weight_diemGK: string;
  weight_diemTH: string;
  weight_diemCK: string;
  diemHP: string;
  expectedScore: string;
  [key: string]: any; // Allow indexing for dynamic field updates
}

export interface Semester {
  id?: string;
  name: string;
  subjects: Subject[];
}

export interface SubjectData {
  code: string;
  name: string;
}

export interface SubjectsData {
  [category: string]: SubjectData[];
}