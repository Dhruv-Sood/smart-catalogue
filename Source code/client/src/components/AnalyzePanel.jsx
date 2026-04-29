import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

const MODES = ['image', 'text', 'combined', 'batch'];

export default function AnalyzePanel({ onResult }) {
  const [mode, setMode] = useState('image');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [batchInput, setBatchInput] = useState('Blue denim jacket\nRunning shoes');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      let result;
      if (mode === 'image') {
        if (!imageFile) throw new Error('Select an image first');
        result = await api.analyzeImage(imageFile);
      } else if (mode === 'text') {
        if (!textInput.trim()) throw new Error('Enter a description');
        result = await api.analyzeText(textInput.trim());
      } else if (mode === 'combined') {
        if (!imageFile || !textInput.trim()) throw new Error('Need both image and description');
        result = await api.analyzeCombined(imageFile, textInput.trim());
      } else if (mode === 'batch') {
        const products = batchInput.split('\n').filter(Boolean).map(t => ({ title: t.trim() }));
        if (!products.length) throw new Error('Enter at least one product');
        result = await api.analyzeBatch(products);
      }
      if (result?.error) throw new Error(result.error);
      onResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="border-4 border-black bg-white shadow-[6px_6px_0px_black] p-6"
    >
      <h2 className="font-black text-2xl uppercase tracking-tight mb-4">Analyze Product</h2>

      {/* Mode tabs */}
      <div className="flex gap-0 mb-6 border-2 border-black w-fit">
        {MODES.map(m => (
          <motion.button
            key={m}
            onClick={() => setMode(m)}
            whileTap={{ scale: 0.95 }}
            className={`relative px-4 py-2 font-black uppercase text-sm tracking-wider border-r-2 border-black last:border-r-0 transition-colors overflow-hidden
              ${mode === m ? 'bg-black text-yellow-300' : 'bg-white hover:bg-yellow-100'}`}
          >
            {mode === m && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 bg-black"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {m}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
        >
          {/* Image drop zone */}
          {(mode === 'image' || mode === 'combined') && (
            <motion.div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current.click()}
              animate={{
                scale: dragOver ? 1.02 : 1,
                borderColor: dragOver ? '#000' : '#000',
                backgroundColor: dragOver ? '#fef08a' : imagePreview ? '#fefce8' : '#fefce8',
              }}
              whileHover={{ backgroundColor: '#fef9c3' }}
              className="border-4 border-dashed border-black cursor-pointer p-6 mb-4 flex flex-col items-center justify-center min-h-[140px] transition-colors"
            >
              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.img
                    key="preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    src={imagePreview}
                    alt="preview"
                    className="max-h-32 object-contain border-2 border-black"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <motion.span
                      animate={{ y: dragOver ? -8 : 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="text-4xl mb-2"
                    >
                      📦
                    </motion.span>
                    <span className="font-bold uppercase text-sm">Drop image or click to upload</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </motion.div>
          )}

          {/* Text input */}
          {(mode === 'text' || mode === 'combined') && (
            <motion.textarea
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Describe the product... e.g. Blue cotton t-shirt, size M, crew neck"
              className="w-full border-4 border-black p-3 font-mono text-sm resize-none h-24 mb-4 focus:outline-none focus:bg-yellow-50"
            />
          )}

          {/* Batch input */}
          {mode === 'batch' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
              <label className="font-black text-xs uppercase tracking-wider block mb-1">One product per line</label>
              <textarea
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                className="w-full border-4 border-black p-3 font-mono text-sm resize-none h-32 focus:outline-none focus:bg-yellow-50"
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="border-4 border-red-500 bg-red-100 px-4 py-2 font-bold text-red-700 text-sm overflow-hidden"
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={submit}
        disabled={loading}
        whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px #facc15' }}
        whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0px #facc15' }}
        className="bg-black text-yellow-300 font-black uppercase tracking-wider px-8 py-3 text-sm border-4 border-black disabled:opacity-50 shadow-[4px_4px_0px_#facc15]"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="inline-block"
              >
                ⚙
              </motion.span>
              Analyzing...
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Analyze →
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
