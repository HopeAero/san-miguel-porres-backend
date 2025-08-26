import {
  EvaluationForCalculation,
  CourtForCalculation,
  LapseForCalculation,
  StudentQualificationsForCalculation,
  CourtGradeResult,
  LapseGradeResult,
  FinalGradeResult,
} from './types/calculation.types';

/**
 * Obtiene la nota efectiva de una evaluación
 * - Si no presentó O está sin calificar, vale 0
 * - Sino, usa la calificación registrada
 */
const getEffectiveScore = (evaluation: EvaluationForCalculation): number => {
  if (evaluation.didNotPresent || evaluation.qualification === null) {
    return 0;
  }
  return evaluation.qualification;
};

/**
 * Calcula la nota acumulada de un corte
 * Los porcentajes se normalizan dentro del corte
 */
export const calculateCourtGrade = (court: CourtForCalculation): CourtGradeResult => {
  const { courtId, evaluations } = court;
  
  // Sumar todos los porcentajes del corte
  const totalPercentage = evaluations.reduce((sum, evaluation) => sum + evaluation.percentage, 0);
  
  if (totalPercentage === 0) {
    return {
      courtId,
      grade: null,
      totalPercentage: 0,
    };
  }
  
  // Calcular la nota ponderada
  let totalWeightedScore = 0;
  
  evaluations.forEach(evaluation => {
    const normalizedWeight = evaluation.percentage / totalPercentage;
    const score = getEffectiveScore(evaluation);
    totalWeightedScore += score * normalizedWeight;
  });
  
  return {
    courtId,
    grade: totalWeightedScore,
    totalPercentage,
  };
};

/**
 * Calcula la nota acumulada de un lapso
 * Considera todos los cortes del lapso con sus porcentajes originales
 */
export const calculateLapseGrade = (lapse: LapseForCalculation): LapseGradeResult => {
  const { lapseNumber, courts } = lapse;
  
  // Obtener todas las evaluaciones del lapso
  const allEvaluations = courts.flatMap(court => court.evaluations);
  
  // Sumar todos los porcentajes del lapso
  const totalPercentage = allEvaluations.reduce((sum, evaluation) => sum + evaluation.percentage, 0);
  
  // Calcular notas de cada corte
  const courtResults = courts.map(court => calculateCourtGrade(court));
  
  if (totalPercentage === 0) {
    return {
      lapseNumber,
      grade: null,
      courts: courtResults,
      totalPercentage: 0,
    };
  }
  
  // Calcular la nota ponderada del lapso completo
  let totalWeightedScore = 0;
  
  allEvaluations.forEach(evaluation => {
    const normalizedWeight = evaluation.percentage / totalPercentage;
    const score = getEffectiveScore(evaluation);
    totalWeightedScore += score * normalizedWeight;
  });
  
  return {
    lapseNumber,
    grade: totalWeightedScore,
    courts: courtResults,
    totalPercentage,
  };
};

/**
 * Calcula la nota final de un estudiante
 * Es el promedio simple de todos los lapsos que tengan nota
 */
export const calculateFinalGrade = (student: StudentQualificationsForCalculation): FinalGradeResult => {
  const { lapses } = student;
  
  // Calcular notas de cada lapso
  const lapseResults = lapses.map(lapse => calculateLapseGrade(lapse));
  
  // Filtrar lapsos que tienen nota válida
  const validLapses = lapseResults.filter(result => result.grade !== null);
  
  if (validLapses.length === 0) {
    return {
      finalGrade: null,
      lapses: lapseResults,
      completedLapses: 0,
    };
  }
  
  // Calcular promedio simple de los lapsos
  const totalLapseScore = validLapses.reduce((sum, lapse) => sum + (lapse.grade || 0), 0);
  const finalGrade = totalLapseScore / validLapses.length;
  
  return {
    finalGrade,
    lapses: lapseResults,
    completedLapses: validLapses.length,
  };
};
