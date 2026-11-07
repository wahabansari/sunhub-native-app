export interface HomeCategory {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
  shippingLabel?: string;
  stock?: number;
  sponsored?: boolean;
  brand?: string;
  category?: string;
  condition?: string;
}

export interface HomeDeal {
  id: string;
  name: string;
  pricePerWatt: number;
  compareAt?: number;
  moq?: string;
  location?: string;
  imageUrl?: string;
  sponsored?: boolean;
  tags?: string[];
  brand?: string;
  wattage?: string;
  moqUnit?: string;
  shipping?: string;
}

export interface HomeBrand {
  id: string;
  name: string;
  initials: string;
}

export interface HomeArticle {
  id: string;
  title: string;
  category: string;
}

export interface HomeData {
  categories: HomeCategory[];
  featuredDeals: HomeDeal[];
  pickupDeals: HomeDeal[];
  buyDirectProducts: HomeProduct[];
  recentDeals: HomeDeal[];
  hotDeal: HomeDeal | null;
  brands: HomeBrand[];
  articles: HomeArticle[];
}
