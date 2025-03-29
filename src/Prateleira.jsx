import React, { useEffect, useState } from 'react';
import { db } from './firebase'; // ✅ CERTO!
import { collection, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const Prateleira = () => {
  const { mercadoId } = useParams(); // pega o ID do mercado pela URL
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (!mercadoId) return;

    const produtosRef = collection(db, `mercados/${mercadoId}/produtos`);

    const unsubscribe = onSnapshot(produtosRef, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdutos(lista);
    });

    return () => unsubscribe(); // limpa o listener ao sair
  }, [mercadoId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prateleira Digital</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {produtos.map(produto => (
          <div key={produto.id} className="border rounded-2xl p-4 shadow">
            <img
              src={produto.fotoUrl || '/sem-foto.png'}
              alt={produto.nome}
              className="w-full h-32 object-cover rounded-xl mb-2"
            />
            <h2 className="text-lg font-semibold">{produto.nome}</h2>
            <p className="text-sm text-gray-500">{produto.tipo}</p>
            <p className="mt-1 font-bold">R$ {produto.preco.toFixed(2)}</p>
            <p className="text-sm text-green-600">Estoque: {produto.quantidade}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prateleira;
