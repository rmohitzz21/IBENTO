import { motion } from 'framer-motion'
import { pageVariants } from '../../animations/pageTransitions'

export default function Explore() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-[#FFFDFC]"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#101828] font-[Georgia] mb-2">
          Explore
        </h1>
        <p className="text-[#6A7282] text-sm">Page coming soon</p>
      </div>
    </motion.div>
  )
}
