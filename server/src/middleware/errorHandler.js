const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let errors

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation failed'
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message = 'File size exceeds the 10MB limit'
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export default errorHandler
