import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { datasetApi } from '../../services/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess: (dataset: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataset = await datasetApi.uploadFile(file);
      onUploadSuccess(dataset);
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading
                ? 'Uploading...'
                : isDragActive
                ? 'Drop the file here'
                : 'Upload CSV or Excel file'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop your file here, or click to browse
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>CSV, XLS, XLSX</span>
            </div>
            <span>•</span>
            <span>Max 10MB</span>
          </div>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
          </div>
          <div className="mt-2">
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="text-sm text-red-700">
                <p className="font-medium">{file.name}</p>
                <ul className="list-disc list-inside">
                  {errors.map((error) => (
                    <li key={error.code}>{error.message}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;