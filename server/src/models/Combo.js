import mongoose from 'mongoose'

const comboSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Combo name is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    eventType: { type: String, trim: true },
    services: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
        discountPercent: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    totalDiscount: { type: Number },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

const Combo = mongoose.model('Combo', comboSchema)
export default Combo
