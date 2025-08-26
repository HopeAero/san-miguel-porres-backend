// Types minimalistas para cálculos de calificaciones
// Diseñados para ser reutilizables tanto en frontend como backend

export interface EvaluationForCalculation {
  evaluationId: number;
  percentage: number;
  qualification: number | null;
  didNotPresent: boolean;
}

export interface CourtForCalculation {
  courtId: number;
  evaluations: EvaluationForCalculation[];
}

export interface LapseForCalculation {
  lapseNumber: number;
  courts: CourtForCalculation[];
}

export interface StudentQualificationsForCalculation {
  lapses: LapseForCalculation[];
}

// Types para resultados de cálculos
export interface CourtGradeResult {
  courtId: number;
  grade: number | null;
  totalPercentage: number;
}

export interface LapseGradeResult {
  lapseNumber: number;
  grade: number | null;
  courts: CourtGradeResult[];
  totalPercentage: number;
}

export interface FinalGradeResult {
  finalGrade: number | null;
  lapses: LapseGradeResult[];
  completedLapses: number;
}
