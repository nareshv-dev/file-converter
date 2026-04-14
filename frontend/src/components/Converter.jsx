import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, FileType, FileImage, 
  ArrowRight, Download, Trash2, 
  Loader2, AlertCircle, CheckCircle2,
  FileText, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const CONVERSION_TYPES = [
  { id: 'pdf-to-docx', label: 'PDF to DOCX', icon: FileType, accept: { 'application/pdf': ['.pdf'] } },
  { id: 'docx-to-pdf', label: 'DOCX to PDF', icon: FileText, accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] } },
  { id: 'images-to-pdf', label: 'Images to PDF', icon: FileImage, accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] }, multiple: true },
];

export default function Converter() {
  const [conversionType, setConversionType] = useState(CONVERSION_TYPES[0]);
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorDesc, setErrorDesc] = useState(null);
  const [history, setHistory] = useState([]);
  const [conversionResult, setConversionResult] = useState(null);

  const resetAll = () => {
    setFiles([]);
    setConversionResult(null);
    setErrorDesc(null);
  };

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setErrorDesc(null);
    if (conversionResult) setConversionResult(null);
    
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === "file-too-large") {
        setErrorDesc("File exceeds the 10MB size limit.");
      } else if (error.code === "file-invalid-type") {
        setErrorDesc(`Invalid file type. Make sure it matches the selected format.`);
      } else {
        setErrorDesc("Error uploading file.");
      }
      return;
    }

    if (conversionType.multiple) {
      setFiles(prev => [...prev, ...acceptedFiles]);
    } else {
      setFiles([acceptedFiles[0]]);
    }
  }, [conversionType, conversionResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: conversionType.accept,
    maxSize: MAX_SIZE,
    multiple: conversionType.multiple || false,
  });

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    setProgress(0);
    setErrorDesc(null);
    setConversionResult(null);

    const interval = setInterval(() => {
      setProgress(old => {
        if (old >= 90) return 90;
        return old + 10;
      });
    }, 300);

    const formData = new FormData();
    if (conversionType.multiple && conversionType.id === 'images-to-pdf') {
      files.forEach(f => formData.append('files', f));
    } else {
      formData.append('file', files[0]);
    }

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/convert/${conversionType.id}`, formData, {
        responseType: 'blob',
      });

      clearInterval(interval);
      setProgress(100);

      const contentDisposition = response.headers['content-disposition'];
      let filename = conversionType.id === 'pdf-to-docx' ? 'converted_file.docx' : 'converted_file.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Navigate to success state instead of resetting
      setConversionResult({ url, filename });

      // Add to session history
      setHistory(prev => [{
        id: Date.now(),
        filename,
        type: previewType(conversionType.id),
        date: new Date().toLocaleTimeString(),
        url
      }, ...prev]);

      setIsConverting(false);
      setProgress(0);
      
      // Note: We no longer auto trigger download in the browser natively 
      // The user must click the prominent Download button to fetch it.

    } catch (err) {
      clearInterval(interval);
      setIsConverting(false);
      setProgress(0);
      let errMsg = "Conversion failed. Ensure backend is running.";
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          errMsg = json.detail || errMsg;
        } catch { /* empty */ }
      }
      setErrorDesc(errMsg);
    }
  };

  const previewType = (id) => {
    return CONVERSION_TYPES.find(c => c.id === id)?.label || id;
  };

  return (
    <div className="w-full max-w-4xl z-10 flex flex-col gap-8">
      {/* Type Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit mx-auto shadow-inner backdrop-blur-sm">
        {CONVERSION_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => {
              setConversionType(type);
              resetAll();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              conversionType.id === type.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <type.icon size={18} /> {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 items-start">
        {/* Main Work Area */}
        <motion.div 
          layout
          className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 backdrop-blur-lg"
        >
          {errorDesc && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-3"
            >
              <AlertCircle size={20} /> <span className="font-medium text-sm">{errorDesc}</span>
            </motion.div>
          )}

          {conversionResult ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Conversion Successful!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium break-all px-4">
                  {conversionResult.filename}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-4">
                <a 
                  href={conversionResult.url}
                  download={conversionResult.filename}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 rounded-xl py-4 font-bold text-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Download size={24} /> Download File
                </a>
                <button 
                  onClick={resetAll}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-4 font-bold text-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} /> Convert Another
                </button>
              </div>
            </motion.div>
          ) : files.length === 0 ? (
            <div 
              {...getRootProps()} 
              className={`border-3 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[300px] bg-slate-50/50 dark:bg-slate-950/50
                ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-900/80'}
              `}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6 text-indigo-500 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                <FileUp size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {isDragActive ? "Drop your files here!" : "Click or drag files"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm text-center">
                Supported: {conversionType.id === 'images-to-pdf' ? 'JPG, PNG up to 10MB' : conversionType.label.split(' to ')[0] + ' up to 10MB'}
              </p>
              
              <button disabled className="mt-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-medium text-sm shadow-md pointer-events-none">
                Browse Files
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col min-h-[300px] justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                    Ready to convert
                  </h3>
                  <button 
                    onClick={resetAll}
                    className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Trash2 size={16} /> Clear All
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
                       <ConversionIcon type={conversionType.id} />
                       <div className="flex-1 overflow-hidden">
                         <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                       </div>
                    </div>
                  ))}
                  
                  {conversionType.multiple && (
                     <div {...getRootProps()} className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer text-center group transition-colors">
                        <input {...getInputProps()} />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-500">
                          + Add more images
                        </p>
                     </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                {isConverting ? (
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                       <span className="flex items-center gap-2">
                         <Loader2 className="animate-spin" size={16} /> Converting...
                       </span>
                       <span>{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                       />
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleConvert}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 rounded-xl py-4 font-bold text-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    Convert to {conversionType.id.split('-to-')[1].toUpperCase()} <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* History Area */}
        <div className="bg-white/60 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 backdrop-blur-lg flex flex-col h-full lg:max-h-[440px]">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" /> Current Session
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Files are not stored. This history disappears when you refresh.
          </p>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <AnimatePresence>
              {history.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-400 text-center mt-10">
                  No conversions yet.
                </motion.div>
              ) : (
                history.map(item => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex-1" title={item.filename}>{item.filename}</p>
                      {item.url && (
                        <a href={item.url} download={item.filename} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-md transition-colors" aria-label="Download">
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{item.type}</span>
                      <span>{item.date}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionIcon({ type }) {
  const iconClass = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm";
  if (type === 'pdf-to-docx') {
    return (
      <div className={`${iconClass} bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400`}>
        <FileType size={20} />
      </div>
    )
  }
  if (type === 'docx-to-pdf') {
    return (
      <div className={`${iconClass} bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}>
        <FileText size={20} />
      </div>
    )
  }
  return (
    <div className={`${iconClass} bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400`}>
      <FileImage size={20} />
    </div>
  )
}
