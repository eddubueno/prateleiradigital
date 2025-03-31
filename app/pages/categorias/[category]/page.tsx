'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const CategoryPage = () => {
  const pathname = usePathname();
  const category = pathname ? pathname.split('/').pop() : null;
  const [products, setProducts] = useState<
    { id: number; name: string; description: string; price: string; image: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  useEffect(() => {
    if (category) {
      setLoading(true); // Start loading
      fetch(`/api/categorias/categoria?category=${category}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Category not found');
          }
          return response.json();
        })
        .then((data) => {
          setProducts(data);
          setError(null);
        })
        .catch((err) => {
          setProducts([]);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [category]);

  function formatPrice(price: string) {
    const priceNumber = (parseInt(price, 10)/100);
    return `R$ ${priceNumber.toFixed(2).replace('.', ',')}`;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{category?.toLocaleUpperCase() || 'Unknown'}</h1>
      {loading ? (
        <p className="text-blue-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-md p-4 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <img src={product.image} className="w-full h-auto" alt={product.name} />
              <p className="text-gray-600">{product.description}</p>
              <p className="text-green-600 font-bold">{formatPrice(product.price)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No products found for this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;