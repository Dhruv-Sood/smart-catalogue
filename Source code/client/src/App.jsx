import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import StatsBar from './components/StatsBar';
import AnalyzePanel from './components/AnalyzePanel';
import ResultCard from './components/ResultCard';
import CatalogList from './components/CatalogList';
import EntryDetail from './components/EntryDetail';
import SignIn from './components/SignIn';
import './App.css';

const VIEWS = ['analyze', 'catalog'];

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [view, setView] = useState('analyze');
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [catalogRefresh, setCatalogRefresh] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  const handleResult = (data) => {
    setResult(data);
  };

  const handleViewCatalog = () => {
    setCatalogRefresh(k => k + 1);
    setView('catalog');
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  const handleUpdated = () => {
    setCatalogRefresh(k => k + 1);
  };

  // Still resolving auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <span className="text-4xl animate-spin">⚙️</span>
      </div>
    );
  }

  // Not signed in
  if (user === null) return <SignIn />;

  return (
    <div className="min-h-screen bg-yellow-50 font-sans flex flex-col">
      {/* Top nav */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="bg-black text-yellow-300 font-black text-xl px-3 py-1 border-2 border-black shadow-[3px_3px_0px_#facc15]"
            >
              SC
            </motion.div>
            <div>
              <h1 className="font-black text-xl uppercase tracking-tight leading-none">Smart Catalog</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Product Cataloging</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex border-2 border-black">
              {VIEWS.map(v => (
                <motion.button
                  key={v}
                  onClick={() => { setView(v); setSelectedId(null); }}
                  whileTap={{ scale: 0.96 }}
                  className={`px-5 py-2 font-black uppercase text-sm tracking-wider border-r-2 border-black last:border-r-0 transition-colors
                    ${view === v ? 'bg-black text-yellow-300' : 'bg-white hover:bg-yellow-100'}`}
                >
                  {v === 'analyze' ? '⚡ Analyze' : '📋 Catalog'}
                </motion.button>
              ))}
            </nav>
            <motion.button
              onClick={() => signOut(auth)}
              whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px black' }}
              whileTap={{ x: 0, y: 0, boxShadow: '1px 1px 0px black' }}
              className="border-2 border-black px-3 py-2 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_black] hover:bg-yellow-100"
              title={user.email}
            >
              Sign Out
            </motion.button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <StatsBar />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <AnimatePresence mode="wait">
        {view === 'analyze' && (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div>
              <AnalyzePanel onResult={handleResult} />
            </div>
            <div>
              <AnimatePresence mode="wait">
                {result ? (
                  <ResultCard key="result" data={result} onViewCatalog={handleViewCatalog} />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-4 border-dashed border-black bg-white p-10 flex flex-col items-center justify-center min-h-[300px] text-center"
                  >
                    <motion.span
                      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="text-6xl mb-4"
                    >
                      🤖
                    </motion.span>
                    <p className="font-black text-xl uppercase text-gray-400">Results appear here</p>
                    <p className="text-sm text-gray-400 mt-1">Upload an image, enter text, or both</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {view === 'catalog' && !selectedId && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <div className="flex items-center justify-between mb-6">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-black text-3xl uppercase tracking-tight"
              >
                Catalog
              </motion.h2>
              <motion.button
                onClick={() => setView('analyze')}
                whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0px black' }}
                whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0px black' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-4 border-black bg-yellow-300 px-5 py-2 font-black uppercase text-sm shadow-[3px_3px_0px_black]"
              >
                + Analyze New
              </motion.button>
            </div>
            <CatalogList onSelect={handleSelect} refreshKey={catalogRefresh} />
          </motion.div>
        )}

        {view === 'catalog' && selectedId && (
          <motion.div
            key={`detail-${selectedId}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <EntryDetail id={selectedId} onBack={handleBack} onUpdated={handleUpdated} />
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-black text-yellow-300 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="font-black uppercase text-sm tracking-wider">Smart Catalog API</span>
          <span className="font-mono text-xs opacity-60">localhost:3001</span>
        </div>
      </footer>
    </div>
  );
}
