import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selected: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
})

// 创建索引
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true })

// 计算小计
cartItemSchema.virtual('subtotal').get(function() {
  return this.price * this.quantity
})

// 转换为JSON时包含虚拟字段
cartItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  }
})

const Cart = mongoose.model('Cart', cartItemSchema)

export default Cart 