import { Product as PrismaProduct } from '@prisma/client';

export class Product implements PrismaProduct {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  cost_price: number | null;
  unit: string | null;
  stock_quantity: number;
  weight: number | null;
  brand: string | null;
  featured: boolean;
  has_variants: boolean;
  created_at: Date;
  updated_at: Date;
}
