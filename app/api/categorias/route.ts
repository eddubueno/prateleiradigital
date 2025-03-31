import { NextResponse } from 'next/server';

export async function GET() {
    const categories = [
        { name: 'Grocery', path: '/pages/categorias/grocery' },
        { name: 'Cleaning', path: '/pages/categorias/cleaning' },
        { name: 'Drinks', path: '/pages/categorias/drinks' },
        { name: 'Foods', path: '/pages/categorias/foods' },
    ];
    return NextResponse.json(categories);
}
