export const formatCurrency = (amount, compact = false) => {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPerPlate = (amount) =>
  `₹${amount.toLocaleString('en-IN')}/plate`
