import api from './api'

export const uploadSingle = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/uploads/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadMultiple = (files) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return api.post('/uploads/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteUpload = (publicId) => api.delete(`/uploads/${publicId}`)
