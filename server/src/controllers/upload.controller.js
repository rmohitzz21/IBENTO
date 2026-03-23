import cloudinary from '../config/cloudinary.js'

const uploadToCloudinary = async (file, folder = 'ibento') => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`

  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: 'auto',
    use_filename: false,
    unique_filename: true,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    size: result.bytes,
    width: result.width,
    height: result.height,
  }
}

// POST /api/uploads/single
export const uploadSingle = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })

  const folder = req.query.folder || 'ibento/uploads'

  try {
    const result = await uploadToCloudinary(req.file, folder)
    res.json({ success: true, file: result })
  } catch (err) {
    console.error('[Upload] Cloudinary error:', err.message)
    res.status(500).json({ success: false, message: `Upload failed: ${err.message}` })
  }
}

// POST /api/uploads/multiple
export const uploadMultiple = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' })
  }

  const folder = req.query.folder || 'ibento/uploads'

  try {
    const uploads = await Promise.all(req.files.map((file) => uploadToCloudinary(file, folder)))
    res.json({ success: true, files: uploads, count: uploads.length })
  } catch (err) {
    console.error('[Upload] Cloudinary error:', err.message)
    res.status(500).json({ success: false, message: `Upload failed: ${err.message}` })
  }
}

// DELETE /api/uploads/:publicId
export const deleteFile = async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId)

  const result = await cloudinary.uploader.destroy(publicId)

  if (result.result === 'ok') {
    res.json({ success: true, message: 'File deleted' })
  } else {
    res.status(400).json({ success: false, message: 'Failed to delete file', result })
  }
}
