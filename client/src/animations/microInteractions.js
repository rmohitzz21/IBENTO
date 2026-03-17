export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  hover: { y: -8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transition: { duration: 0.2 } },
}

export const heartBounce = {
  rest: { scale: 1 },
  tap: { scale: [1, 1.4, 1], transition: { duration: 0.3, type: 'spring' } },
}

export const buttonPress = {
  tap: { scale: 0.95 },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export const dropdownVariants = {
  initial: { opacity: 0, scale: 0.9, transformOrigin: 'top right' },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.1 } },
}

export const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  },
}
