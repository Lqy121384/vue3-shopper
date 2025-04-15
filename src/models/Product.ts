import mongoose from 'mongoose'

export interface IProduct extends mongoose.Document {
  name: string
  description: string
  image: string
  price: number
  stock: number
  category: string
  isActive: boolean
  unit: string
  isFresh: boolean
  isOrganic: boolean
  isLocal: boolean
  isSeasonal: boolean
  isPremium: boolean
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'specialties']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unit: {
    type: String,
    required: true,
    default: '个'
  },
  isFresh: {
    type: Boolean,
    default: false
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  isSeasonal: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const Product = mongoose.model<IProduct>('Product', productSchema)

export default Product 