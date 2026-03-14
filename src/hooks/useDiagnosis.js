import { useState, useCallback } from 'react';
import { analyzeImage } from '../services/inferenceService';

function useDiagnosis() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const selectImage = useCallback((file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, []);

  const analyze = useCallback(async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const diagnosis = await analyzeImage(imageFile);
      setResult(diagnosis);
    } catch (err) {
      setError('Erro ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile]);

  const reset = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    imageFile,
    imagePreview,
    result,
    isAnalyzing,
    error,
    selectImage,
    analyze,
    reset,
  };
}

export default useDiagnosis;
