'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Categories() {
    interface Category {
        name: string;
        path: string;
    }

    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch('/api/categorias');
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            }
        }
        fetchCategories();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Categorias</h1>
            {error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : (
                <ul className="space-y-2">
                    {categories.map((category) => (
                        <li key={category.name}>
                            <Link
                                href={category.path}
                                className="block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}