export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
}

export const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export const heroTextVariants = {
  initial: { opacity: 0, y: 60 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}
