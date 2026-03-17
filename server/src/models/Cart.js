import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      addOns: [
        {
          name: { type: String },
          price: { type: Number },
        },
      ],
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const Cart = mongoose.model('Cart', cartSchema)
export default Cart
