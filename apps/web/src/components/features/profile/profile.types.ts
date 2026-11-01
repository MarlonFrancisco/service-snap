export type TProfileTab = 'bookings' | 'favorites' | 'settings';

export type TBookingStatus = 'confirmed' | 'completed' | 'cancelled';

export type TUpcomingBooking = {
  id: string;
  businessName: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  address: string;
  phone: string;
  image: string;
  category: string;
  status: TBookingStatus;
};

export type TPastBooking = {
  id: string;
  businessName: string;
  service: string;
  date: string;
  price: number;
  rating?: number;
  review?: string;
  image: string;
};

export type TFavorite = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  price: string;
  description: string;
  distance: string;
};

export type TProfileConfig = {
  className?: string;
};

export type TProfilePageConfig = {
  initialTab?: TProfileTab;
};
