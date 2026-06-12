export interface Feature {
  _id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  link: string;
  stats: string;
  statsLabel: string;
  category: string;
  tags: string[];
  isActive: boolean;
}

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  author: string;
  views: number;
  readTime: string;
  isPublished: boolean;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  image: string;
}

export interface Stat {
  _id: string;
  value: number;
  suffix: string;
  label: string;
  icon: string;
  color: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Announcement {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface HeroData {
  title: string;
  subtitle: string;
  badge: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}