import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultCard({ data, onViewCatalog }) {
  if (!data) return null;
  const items = Array.isArray(data) ? data : [data];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="mt-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <motion.h3
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-black text-xl uppercase tracking-tight"
        >
          Result{items.length > 1 ? `s (${items.length})` : ''}
        </motion.h3>
        <div className="flex gap-2">
          <CopyJsonButton data={data} />
          <motion.button
            onClick={onViewCatalog}
            whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px black' }}
            whileTap={{ x: 0, y: 0, boxShadow: '1px 1px 0px black' }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-black uppercase tracking-wider border-2 border-black px-3 py-1 shadow-[2px_2px_0px_black]"
          >
            View Catalog →
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, y: 30, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.08 }}
          >
            <ResultItem item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultItem({ item }) {
  const conf = Math.round((item.confidence || 0) * 100);
  const confColor = conf >= 90 ? 'bg-green-400' : conf >= 75 ? 'bg-yellow-300' : 'bg-orange-400';

  return (
    <motion.div
      whileHover={{ x: -3, y: -3, boxShadow: '8px 8px 0px black' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="border-4 border-black bg-white shadow-[4px_4px_0px_black] p-5"
    >
      <div className="flex flex-wrap gap-2 items-start justify-between mb-3">
        <h4 className="font-black text-lg leading-tight flex-1">{item.title}</h4>
        <div className="flex gap-2 items-center shrink-0">
          <CopyJsonButton data={item} size="sm" />
          {item.confidence && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
              className={`${confColor} border-2 border-black px-2 py-0.5 text-xs font-black`}
            >
              {conf}% conf
            </motion.span>
          )}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.25 }}
            className={`border-2 border-black px-2 py-0.5 text-xs font-black uppercase
              ${item.status === 'published' ? 'bg-green-400' : 'bg-orange-300'}`}
          >
            {item.status}
          </motion.span>
        </div>
      </div>

      {item.shortDescription && (
        <p className="text-sm text-gray-700 mb-3 border-l-4 border-yellow-300 pl-3">{item.shortDescription}</p>
      )}

      {item.category && (
        <div className="flex flex-wrap gap-1 mb-3">
          {[item.category.primary, item.category.secondary, item.category.tertiary]
            .filter(Boolean)
            .map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-blue-200 border-2 border-black px-2 py-0.5 text-xs font-bold"
              >
                {c}
              </motion.span>
            ))}
        </div>
      )}

      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              whileHover={{ scale: 1.1, backgroundColor: '#fef08a' }}
              className="bg-gray-100 border border-black px-2 py-0.5 text-xs font-mono cursor-default"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      )}

      {item.pricePositioning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2"
        >
          <span className="bg-purple-300 border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
            {item.pricePositioning}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

function CopyJsonButton({ data, size = 'md' }) {
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const base = 'font-black uppercase tracking-wider border-2 border-black transition-colors shadow-[2px_2px_0px_black]';
  const sizes = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-xs px-3 py-1';

  return (
    <motion.button
      onClick={copy}
      whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px black' }}
      whileTap={{ x: 0, y: 0, boxShadow: '1px 1px 0px black', scale: 0.95 }}
      className={`${base} ${sizes} ${copied ? 'bg-green-400' : 'bg-white hover:bg-yellow-100'}`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            ✓ Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            {'{ } Copy JSON'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
