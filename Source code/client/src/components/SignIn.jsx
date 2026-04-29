import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function SignIn() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-black text-yellow-300 font-black text-xl px-3 py-1 border-2 border-black shadow-[3px_3px_0px_#facc15]">
            SC
          </div>
          <div>
            <h1 className="font-black text-xl uppercase tracking-tight leading-none">Smart Catalog</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Product Cataloging</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-10 w-full max-w-md flex flex-col items-center gap-6"
        >
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-6xl"
          >
            🤖
          </motion.span>

          <div className="text-center">
            <h2 className="font-black text-3xl uppercase tracking-tight">Welcome Back</h2>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">
              Sign in to access your catalog
            </p>
          </div>

          <div className="w-full border-t-4 border-dashed border-black" />

          <motion.button
            onClick={handleGoogleSignIn}
            whileHover={{ x: -3, y: -3, boxShadow: '8px 8px 0px black' }}
            whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0px black' }}
            className="w-full flex items-center justify-center gap-3 border-4 border-black bg-white px-6 py-3 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_black] transition-colors hover:bg-yellow-50"
          >
            <GoogleIcon />
            Sign in with Google
          </motion.button>

          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider text-center">
            Your data stays yours. Always.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-black text-yellow-300 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="font-black uppercase text-sm tracking-wider">Smart Catalog API</span>
          <span className="font-mono text-xs opacity-60">localhost:3001</span>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.3C9.7 35.5 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C36.9 39.8 44 34.7 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
