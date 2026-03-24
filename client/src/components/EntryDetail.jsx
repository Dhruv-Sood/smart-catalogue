import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

function CopyJsonButton({ data }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={copy}
      whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #facc15' }}
      whileTap={{ x: 0, y: 0, boxShadow: '1px 1px 0px #facc15', scale: 0.95 }}
      className={`border-2 border-yellow-300 px-4 py-1 font-black uppercase text-xs transition-colors shadow-[2px_2px_0px_#facc15] ${copied ? 'bg-green-400 text-black border-green-400' : 'hover:bg-yellow-300 hover:text-black'}`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="copied" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}>
            ✓ Copied!
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}>
            {'{ } JSON'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 24 },
};

export default function EntryDetail({ id, onBack, onUpdated }) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(id).then(data => {
      setEntry(data);
      setEditData({ title: data.title, shortDescription: data.shortDescription, tags: data.tags?.join(', ') || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    const updated = await api.update(id, {
      title: editData.title,
      shortDescription: editData.shortDescription,
      tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setEntry(e => ({ ...e, ...updated }));
    setEditing(false);
    setSaving(false);
    onUpdated?.();
  };

  const publish = async () => {
    const updated = await api.publish(id);
    setEntry(e => ({ ...e, ...updated }));
    onUpdated?.();
  };

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-4 border-black bg-yellow-100 p-8 text-center"
    >
      <motion.p
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="font-black uppercase"
      >
        Loading...
      </motion.p>
    </motion.div>
  );

  if (!entry) return (
    <div className="border-4 border-black bg-red-100 p-8 text-center font-black">Entry not found</div>
  );

  const conf = Math.round((entry.confidence || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="border-4 border-black bg-white shadow-[6px_6px_0px_black]"
    >
      {/* Header */}
      <div className="border-b-4 border-black bg-black text-yellow-300 px-6 py-4 flex items-center justify-between">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="font-black uppercase text-sm hover:text-white transition-colors"
        >
          ← Back
        </motion.button>
        <div className="flex gap-2">
          {entry.status === 'draft' && (
            <motion.button
              onClick={publish}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-yellow-300 bg-green-400 text-black px-4 py-1 font-black uppercase text-xs"
            >
              Publish
            </motion.button>
          )}
          <CopyJsonButton data={entry} />
          <motion.button
            onClick={() => setEditing(e => !e)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-yellow-300 px-4 py-1 font-black uppercase text-xs hover:bg-yellow-300 hover:text-black transition-colors"
          >
            {editing ? 'Cancel' : 'Edit'}
          </motion.button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Title */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}>
          <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Title</label>
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.input
                key="edit"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                value={editData.title}
                onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
                className="w-full border-4 border-black px-3 py-2 font-black text-lg focus:outline-none focus:bg-yellow-50"
              />
            ) : (
              <motion.h2
                key="view"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="font-black text-2xl"
              >
                {entry.title}
              </motion.h2>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Status + Confidence badges */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { label: entry.status, color: entry.status === 'published' ? 'bg-green-400' : 'bg-orange-300' },
            entry.confidence && { label: `${conf}% confidence`, color: conf >= 90 ? 'bg-green-400' : conf >= 75 ? 'bg-yellow-300' : 'bg-orange-400' },
            entry.sourceType && { label: entry.sourceType, color: 'bg-blue-200' },
          ].filter(Boolean).map((badge, i) => (
            <motion.span
              key={badge.label}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, delay: 0.1 + i * 0.06 }}
              whileHover={{ scale: 1.08 }}
              className={`${badge.color} border-2 border-black px-3 py-1 text-sm font-black uppercase`}
            >
              {badge.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Short Description */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Short Description</label>
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.textarea
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                value={editData.shortDescription || ''}
                onChange={e => setEditData(d => ({ ...d, shortDescription: e.target.value }))}
                className="w-full border-4 border-black px-3 py-2 font-mono text-sm resize-none h-20 focus:outline-none focus:bg-yellow-50"
              />
            ) : (
              <motion.p
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm border-l-4 border-yellow-300 pl-3"
              >
                {entry.shortDescription}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Full Description */}
        {entry.fullDescription && (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
            <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Full Description</label>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 border-2 border-black p-3">{entry.fullDescription}</p>
          </motion.div>
        )}

        {/* Category */}
        {entry.category && (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.22 }}>
            <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {[entry.category.primary, entry.category.secondary, entry.category.tertiary]
                .filter(Boolean)
                .map((c, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.06 }}
                    whileHover={{ y: -2 }}
                    className="bg-blue-200 border-2 border-black px-3 py-1 text-sm font-bold"
                  >
                    {c}
                  </motion.span>
                ))}
            </div>
          </motion.div>
        )}

        {/* Attributes */}
        {entry.attributes && Object.keys(entry.attributes).length > 0 && (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
            <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Attributes</label>
            <div className="border-2 border-black overflow-hidden">
              {Object.entries(entry.attributes)
                .filter(([, v]) => v && typeof v !== 'object')
                .map(([k, v], i) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    className="flex border-b border-black last:border-b-0"
                  >
                    <span className="bg-gray-100 border-r-2 border-black px-3 py-1.5 text-xs font-black uppercase w-32 shrink-0">{k}</span>
                    <span className="px-3 py-1.5 text-sm font-mono">{String(v)}</span>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Tags */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.28 }}>
          <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Tags</label>
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.input
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                value={editData.tags}
                onChange={e => setEditData(d => ({ ...d, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                className="w-full border-4 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:bg-yellow-50"
              />
            ) : (
              <motion.div key="view" className="flex flex-wrap gap-1">
                {entry.tags?.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.28 + i * 0.03 }}
                    whileHover={{ scale: 1.1, backgroundColor: '#fef08a' }}
                    className="bg-gray-100 border border-black px-2 py-0.5 text-xs font-mono cursor-default"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Suggested Keywords */}
        {entry.suggestedKeywords?.length > 0 && (
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.32 }}>
            <label className="font-black text-xs uppercase tracking-wider text-gray-500 block mb-1">Suggested Keywords</label>
            <div className="flex flex-wrap gap-1">
              {entry.suggestedKeywords.map((kw, i) => (
                <motion.span
                  key={kw}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 + i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="bg-purple-200 border border-black px-2 py-0.5 text-xs font-mono"
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timestamps */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.35 }}
          className="border-t-2 border-black pt-4 flex flex-wrap gap-4 text-xs font-mono text-gray-500"
        >
          <span>Created: {new Date(entry.createdAt).toLocaleString()}</span>
          <span>Updated: {new Date(entry.updatedAt).toLocaleString()}</span>
          <span className="font-bold text-gray-400">ID: {entry.id}</span>
        </motion.div>

        {/* Save button */}
        <AnimatePresence>
          {editing && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={save}
              disabled={saving}
              whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0px #facc15' }}
              whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0px #facc15' }}
              className="w-full bg-black text-yellow-300 font-black uppercase tracking-wider py-3 border-4 border-black disabled:opacity-50 shadow-[4px_4px_0px_#facc15]"
            >
              {saving ? (
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  Saving...
                </motion.span>
              ) : 'Save Changes'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
