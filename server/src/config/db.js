import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB')
    })

    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose connection error: ${err.message}`)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected from MongoDB')
    })

    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('MongoDB connection closed due to app termination')
      process.exit(0)
    })
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
