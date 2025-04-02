import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const Prateleira = () => {
  const { mercadoId } = useParams();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mercadoId) return;

    const produtosRef = collection(db, `mercados/${mercadoId}/produtos`);

    const unsubscribe = onSnapshot(produtosRef, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdutos(lista);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [mercadoId]);

  if (!mercadoId) {
    return <p className="p-4 text-center text-red-600">Mercado não encontrado.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🛒 Prateleira Digital</h1>

      {carregando ? (
        <p className="text-center">Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p className="text-center">Nenhum produto disponível.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {produtos.map(produto => (
            <div key={produto.id} className="border rounded-2xl p-4 shadow bg-white">
              {produto.imagem ? (
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-32 object-cover rounded-xl mb-2"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-xl text-gray-400 text-4xl">
                  📷
                </div>
              )}

              <h2 className="text-lg font-semibold">{produto.nome || 'Sem nome'}</h2>
              {produto.tipo && (
                <p className="text-sm text-gray-500">{produto.tipo}</p>
              )}
              <p className="mt-1 font-bold text-green-600">
                R$ {Number(produto.preco || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Estoque: {produto.quantidade || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Botão Ir para loja completa */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(`/vitrine/${mercadoId}`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          🔎 Ir para loja completa
        </button>
      </div>
    </div>
  );
};

export default Prateleira;
