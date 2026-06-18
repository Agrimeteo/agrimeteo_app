import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Upload, Send, Info, CheckCircle2 } from 'lucide-react';

import { analyzePlantImage } from '../../services/plantDiagnosisService';
import ReactMarkdown from 'react-markdown';

const PlantDiagnosis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setDiagnosisResult(null);
    
    try {
      const result = await analyzePlantImage(image, description);
      setDiagnosisResult(result || "Could not generate diagnosis.");
    } catch (error) {
      console.error("Diagnosis Error:", error);
      setDiagnosisResult("An error occurred during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section>
        <h2 className="text-xl font-bold text-primary mb-2">Identify Plant Issues</h2>
        <p className="text-sm text-primary/70">Upload a clear photo of the leaf or affected area to get an AI-powered diagnosis and treatment plan.</p>
      </section>

      <div className="px-2">
        {!image ? (
          <label className="relative group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 px-6 py-12 hover:border-primary/50 transition-all cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="text-primary" size={32} />
            </div>
            <div className="text-center">
              <p className="text-primary font-bold">Upload Plant Image</p>
              <p className="text-xs text-primary/60 mt-1">Supports JPG, PNG (Max 10MB)</p>
            </div>
            <div className="bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Select Photo
            </div>
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden shadow-md border border-primary/10">
            <img src={image} alt="Uploaded plant" className="w-full h-64 object-cover" />
            <button 
              onClick={() => { setImage(null); setDiagnosisResult(null); }}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="text-sm font-semibold text-primary">Describe the problem</span>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full rounded-xl border-primary/20 bg-white text-slate-900 focus:ring-primary focus:border-primary placeholder:text-primary/30 p-4 outline-none" 
            placeholder="e.g., Yellow spots on leaves, appearing for 3 days..." 
            rows={4}
          />
        </label>
      </div>

      <button 
        onClick={handleAnalyze}
        disabled={!image || isAnalyzing}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        {isAnalyzing ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing...</span>
          </div>
        ) : (
          <>
            <Send size={20} />
            <span>Submit for Analysis</span>
          </>
        )}
      </button>

      {diagnosisResult && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 space-y-4"
        >
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={24} />
            <h3 className="font-bold">Diagnosis Complete</h3>
          </div>
          <div className="prose prose-sm max-w-none text-emerald-800">
            <ReactMarkdown>{diagnosisResult}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {!diagnosisResult && !isAnalyzing && (
        <div className="rounded-xl border border-primary/10 bg-slate-50 p-8 flex flex-col items-center justify-center text-center opacity-60">
          <div className="mb-4">
            <Info size={40} className="text-primary/40" />
          </div>
          <p className="text-sm font-medium text-primary/60">Analysis results will appear here after submission</p>
        </div>
      )}
    </motion.div>
  );
};

const X: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default PlantDiagnosis;
