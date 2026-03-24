import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants } from '../../animations/pageTransitions'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'

export default function NotFound() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex flex-col bg-[#FFFDFC]">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-filson font-black text-[#F06138] mb-4" style={{ fontSize: 'clamp(80px, 15vw, 150px)', lineHeight: 1 }}>
          404
        </h1>
        <h2 className="font-filson font-bold text-[#101828] text-2xl sm:text-3xl mb-3">Page not found</h2>
        <p className="font-lato text-[#6A6A6A] mb-8 max-w-sm mx-auto">Sorry, the page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl font-lato font-bold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
          Back to Home
        </Link>
      </div>
      <Footer />
    </motion.div>
  )
}
