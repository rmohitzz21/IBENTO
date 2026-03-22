// Razorpay is intentionally disabled until all other features are complete.
// To enable: add real keys to server/.env and remove the early return below.

// import Razorpay from 'razorpay'
// export default new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

console.warn('⚠️  Razorpay is disabled. Payment endpoints will return 503.')
export default null
