import api from './api'

export const createBooking = (data) => api.post('/bookings', data)
export const verifyPayment = (data) => api.post('/bookings/payment/verify', data)
export const getMyBookings = (params) => api.get('/bookings/my', { params })
export const getBooking = (id) => api.get(`/bookings/${id}`)
export const acceptBooking = (id, data) => api.put(`/bookings/${id}/accept`, data)
export const rejectBooking = (id, data) => api.put(`/bookings/${id}/reject`, data)
export const completeBooking = (id) => api.put(`/bookings/${id}/complete`)
export const cancelBooking = (id, data) => api.put(`/bookings/${id}/cancel`, data)
export const getInvoice = (id) =>
  api.get(`/bookings/${id}/invoice`, { responseType: 'blob' })

export const createReview = (data) => api.post('/reviews', data)
