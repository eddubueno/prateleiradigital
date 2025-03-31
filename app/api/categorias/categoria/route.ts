import { NextResponse } from 'next/server';

const categoryData: Record<string, { id: number; name: string; description: string; price: number; image: string }[]> = {
  grocery: [
    { id: 1, name: 'Apples', description: 'Fresh apples', price: 3000, image: '/images/apples.jpg' },
    { id: 2, name: 'Bananas', description: 'Ripe bananas', price: 2000, image: '/images/bananas.jpg' },
  ],
  cleaning: [
    { id: 1, name: 'Detergent', description: 'Laundry detergent', price: 5000, image: '/images/detergent.jpg' },
    { id: 2, name: 'Bleach', description: 'Household bleach', price: 4000, image: '/images/bleach.jpg' },
  ],
  drinks: [
    { id: 1, name: 'Coca-Cola Litrão', description: 'Coca-Cola 500ml', price: 1500, image: '/images/coke.jpg' },
    { id: 2, name: 'Water', description: 'Mineral water 1L', price: 1000, image: '/images/water.jpg' },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (category && categoryData[category]) {
    return NextResponse.json(categoryData[category]);
  }

  return NextResponse.json({ error: 'Category not found' }, { status: 404 });
}