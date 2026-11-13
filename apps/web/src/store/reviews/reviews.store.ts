import { create } from 'zustand';
import {
  setReviewsAttributesAction,
  toggleReviewsModalAction,
} from './reviews.actions';
import { IReviewsStore } from './reviews.types';

export const useReviewsStore = create<IReviewsStore>((set, get) => ({
  isOpen: false,
  showWriteReview: false,
  reviews: [],
  storeId: '',
  businessName: '',
  reviewTarget: null,
  toggleReviewsModalAction: toggleReviewsModalAction(set, get),
  setReviewsAttributesAction: setReviewsAttributesAction(set, get),
}));
