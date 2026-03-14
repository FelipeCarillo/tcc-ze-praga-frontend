import * as mockHistory from './mock/mockHistory';

export const getDiagnoses = () => mockHistory.getAll();

export const getDiagnosisById = (id) => mockHistory.getById(id);

export const saveDiagnosis = (diagnosis) => mockHistory.save(diagnosis);

export const deleteDiagnosis = (id) => mockHistory.remove(id);
