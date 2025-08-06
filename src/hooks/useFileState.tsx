import { useState } from 'react';

export const useFileState = () => {
  const [fileIsLoading, setFileIsLoading] = useState(false);
  const [fileRejected, setFileRejected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileDate, setFileDate] = useState('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const setFileAcceptedState = (file: File, currentDate: Date) => {
    setFileName(file.name);
    const dateField = new Date(currentDate);
    const fileDate = dateField.toLocaleString('fr-BE');
    setFileDate(fileDate);
    setCurrentFile(file);
    setFileIsLoading(false);
    setFileRejected(false);
  };

  const setFileRejectedState = () => {
    setFileIsLoading(false);
    setFileRejected(true);
    setCurrentFile(null);
  };

  const resetFileState = () => {
    setFileName('');
    setFileDate('');
    setCurrentFile(null);
    setFileIsLoading(false);
    setFileRejected(false);
  };

  return {
    fileIsLoading,
    fileRejected,
    fileName,
    fileDate,
    currentFile,
    setFileIsLoading,
    setFileRejected,
    setFileAcceptedState,
    setFileRejectedState,
    resetFileState,
  };
};
