import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';

export default function StatsBar() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.health().then(setHealth).catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="border-b-4 border-black bg-yellow-300 px-6 py-3 flex flex-wrap gap-6 items-center"
    >
      <div className="flex items-center gap-2">
        <motion.span
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className={`w-3 h-3 rounded-full border-2 border-black ${health?.status === 'ok' ? 'bg-green-400' : 'bg-red-400'}`}
        />
        <span className="font-black text-sm uppercase tracking-wider">
          {health?.status === 'ok' ? 'API Online' : 'API Offline'}
        </span>
      </div>
      {stats && (
        <>
          {[
            { label: 'Total', value: stats.total, color: 'bg-white' },
            { label: 'Published', value: stats.published, color: 'bg-green-400' },
            { label: 'Draft', value: stats.draft, color: 'bg-orange-400' },
            ...Object.entries(stats.byCategory || {}).map(([cat, count]) => ({
              label: cat, value: count, color: 'bg-blue-300'
            }))
          ].map((pill, i) => (
            <motion.div
              key={pill.label}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.06 }}
            >
              <StatPill {...pill} />
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -3, x: -2, boxShadow: '4px 6px 0px black' }}
      className={`${color} border-2 border-black px-3 py-1 flex gap-2 items-center shadow-[2px_2px_0px_black] cursor-default`}
    >
      <span className="font-black text-lg leading-none">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}
