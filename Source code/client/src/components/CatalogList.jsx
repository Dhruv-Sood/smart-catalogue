import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export default function CatalogList({ onSelect, refreshKey }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const data = await api.list(params);
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this entry?')) return;
    await api.delete(id);
    load();
  };

  const handlePublish = async (e, id) => {
    e.stopPropagation();
    await api.publish(id);
    load();
  };

  return (
    <div>
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="flex flex-wrap gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="border-4 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:bg-yellow-50 flex-1 min-w-[160px]"
        />
        <input
          type="text"
          placeholder="Category..."
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          className="border-4 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:bg-yellow-50 w-40"
        />
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="border-4 border-black px-3 py-2 font-black text-sm focus:outline-none bg-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <motion.button
          onClick={load}
          whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px black' }}
          whileTap={{ x: 0, y: 0, boxShadow: '1px 1px 0px black', scale: 0.97 }}
          className="border-4 border-black bg-black text-yellow-300 px-4 py-2 font-black uppercase text-sm shadow-[2px_2px_0px_black]"
        >
          ↻ Refresh
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-4 border-black bg-yellow-100 p-4 font-black uppercase text-center"
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Loading...
            </motion.span>
          </motion.div>
        )}

        {!loading && entries.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border-4 border-dashed border-black p-10 text-center"
          >
            <motion.p
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="text-4xl mb-3"
            >
              📭
            </motion.p>
            <p className="font-black text-xl uppercase text-gray-400">No entries found</p>
            <p className="text-sm text-gray-400 mt-1">Try analyzing a product first</p>
          </motion.div>
        )}

        {!loading && entries.length > 0 && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-3"
          >
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.05 }}
                onClick={() => onSelect(entry.id)}
                whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px black' }}
                whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0px black' }}
                className="border-4 border-black bg-white cursor-pointer shadow-[4px_4px_0px_black] p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-base truncate">{entry.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.category?.primary && (
                      <span className="bg-blue-200 border border-black px-1.5 text-xs font-bold">
                        {entry.category.primary}
                      </span>
                    )}
                    {entry.category?.secondary && (
                      <span className="bg-blue-100 border border-black px-1.5 text-xs font-bold">
                        {entry.category.secondary}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`border-2 border-black px-2 py-0.5 text-xs font-black uppercase
                    ${entry.status === 'published' ? 'bg-green-400' : 'bg-orange-300'}`}>
                    {entry.status}
                  </span>
                  {entry.status === 'draft' && (
                    <motion.button
                      onClick={e => handlePublish(e, entry.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-black bg-green-300 hover:bg-green-400 px-2 py-0.5 text-xs font-black uppercase transition-colors"
                    >
                      Publish
                    </motion.button>
                  )}
                  <motion.button
                    onClick={e => handleDelete(e, entry.id)}
                    whileHover={{ scale: 1.1, backgroundColor: '#f87171' }}
                    whileTap={{ scale: 0.9 }}
                    className="border-2 border-black bg-red-300 px-2 py-0.5 text-xs font-black uppercase"
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
