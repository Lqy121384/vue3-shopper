export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Review {
  id: string
  userId: string
  orderId: string
  productId: string
  rating: number
  content: string
  images: string[]
  status: ReviewStatus
  createdAt: Date
  updatedAt: Date
} 