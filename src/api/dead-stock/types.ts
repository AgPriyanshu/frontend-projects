export interface DsCategory {
  id: string;
  slug: string;
  name: string;
  parent: string | null;
}

export interface DsShop {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  isVerified: boolean;
  ratingAvg: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DsShopWithDistance extends DsShop {
  distanceM: number | null;
}

export interface DsItemImage {
  id: string;
  position: number;
  isPrimary: boolean;
  variantsReady: boolean;
  width: number;
  height: number;
  url: string | null;
  thumbUrl: string | null;
  cardUrl: string | null;
  createdAt: string;
}

export type DsCondition = "new" | "open_box" | "used";
export type DsItemStatus = "active" | "sold" | "hidden";

export interface DsItem {
  id: string;
  shop: string;
  shopName: string;
  category: string | null;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  price: string | null;
  condition: DsCondition;
  status: DsItemStatus;
  staleAt: string;
  images: DsItemImage[];
  createdAt: string;
  updatedAt: string;
}

export interface DsSearchItem extends DsItem {
  distanceM: number | null;
  shopLat: number | null;
  shopLng: number | null;
  shopPhone: string;
}

export interface DsLead {
  id: string;
  buyer: string;
  shop: string;
  item: string | null;
  message: string;
  contactedAt: string | null;
  createdAt: string;
}

export interface DsOtpVerifyResponse {
  token: string;
  expiresAt: string;
  user: { id: number; phone: string };
  hasShop: boolean;
}

export interface DsPresignResponse {
  url: string;
  key: string;
  expiresIn: number;
  headers: Record<string, string>;
  bucket: string;
}

export type DsSort = "distance" | "recent" | "price";

export interface DsSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: DsSort;
}

export interface DsSearchPage {
  items: DsSearchItem[];
  nextCursor: string | null;
}

export interface DsCreateShopPayload {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  city?: string;
  pincode?: string;
  address?: string;
}

export interface DsCreateItemPayload {
  name: string;
  description?: string;
  sku?: string;
  quantity: number;
  price?: string | null;
  condition?: DsCondition;
  category?: string | null;
}

export interface DsCreateLeadPayload {
  shopId: string;
  itemId?: string | null;
  message: string;
  phone?: string;
  buyerName?: string;
}

export interface DsCreateReportPayload {
  shopId?: string | null;
  itemId?: string | null;
  reason: string;
}

export interface DsConfirmImagePayload {
  key: string;
  width: number;
  height: number;
  isPrimary?: boolean;
}
