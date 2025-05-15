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
  dimensions: any | null; // Using any for Json type
  brand: string | null;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}
