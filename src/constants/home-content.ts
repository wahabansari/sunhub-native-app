import type { HomeCategory, HomeReview } from '@/types/home';

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'panels', name: 'Solar Panels', art: 'panel', parentId: 40939 },
  { id: 'inverters', name: 'Inverters', art: 'inv', parentId: 40948 },
  { id: 'batteries', name: 'Batteries', art: 'bat', parentId: 40957 },
  { id: 'racking', name: 'Racking & Mounts', art: 'rack', parentId: 40960 },
  { id: 'components', name: 'Components', art: 'comp', parentId: 40989 },
  { id: 'diy', name: 'DIY Kits', art: 'diy', parentId: 41094 },
  { id: 'ev', name: 'EV Charging', art: 'ev', parentId: 41198 },
];

export const QUICK_ACTIONS = [
  { id: 'trader', label: 'Trader deals', icon: 'scale' },
  { id: 'direct', label: 'Buy direct', icon: 'cart' },
  { id: 'pickup', label: 'Local pickup', icon: 'pin' },
  { id: 'calculators', label: 'Calculators', icon: 'calculator' },
] as const;

export const SPOTLIGHT_FEATURES = ['Limited stock', 'Best price', 'Fast delivery'] as const;

export const GROW_STATS = [
  { value: '35K+', label: 'Weekly email reach' },
  { value: '25K+', label: 'Social followers' },
  { value: '$11,000', label: 'Avg. trader transaction' },
  { value: '40K+', label: 'Monthly traffic' },
] as const;

export const WHY_SUNHUB = [
  {
    icon: 'shield',
    title: 'Secure negotiations',
    body: 'Seller identity stays private until signing',
  },
  {
    icon: 'layers',
    title: 'Streamlined workflows',
    body: 'Offer, counter, contract and order in one place',
  },
  {
    icon: 'trend',
    title: 'Real-time deal tracking',
    body: 'Know the status of every bid and offer',
  },
  {
    icon: 'sun',
    title: 'Built for solar',
    body: 'FCC, FEOC, CEC and domestic-content filters',
  },
] as const;

// Mirrors the static Google-review fallback shipped with the web reference (homeReviewsFallback.js).
export const HOME_REVIEWS: HomeReview[] = [
  {
    id: 'review-1',
    name: 'Mark Scarberry',
    date: 'Nov 16, 2022',
    text: "Great prices on panels, free shipping, what isn't to like?",
  },
  {
    id: 'review-2',
    name: 'Dean Holleman',
    date: 'Aug 17, 2022',
    text: "Mitch and his team go above and beyond whenever we need anything at Meraki Solar. I'd highly suggest doing business with Sunhub.",
  },
  {
    id: 'review-3',
    name: 'Scott R',
    date: 'Oct 6, 2022',
    text: "Sunhub's employees care — dealing with Shoban and Mitch is always a treat.",
  },
];
