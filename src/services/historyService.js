import * as mockHistory from './mock/mockHistory';
import { getCurrentUserId } from './authService';

const userId = () => getCurrentUserId();

export const getDiagnoses = () => mockHistory.getAll(userId());

export const getDiagnosisById = (id) => mockHistory.getById(id, userId());

export const saveDiagnosis = (diagnosis) => mockHistory.save(diagnosis, userId());

export const deleteDiagnosis = (id) => mockHistory.remove(id, userId());

export const clearAllDiagnoses = () => mockHistory.clearAll(userId());
