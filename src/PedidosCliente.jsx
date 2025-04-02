import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { useParams, useNavigate } from 'react-router-dom';

function PedidosCliente() {
  const { mercadoId } = useParams();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarPedidos = async () => {
      try {
        const ref = collection(db, 'pedidos');
        const q = query(ref, where("mercadoId", "==", mercadoId));
        const snapshot = await getDocs(q);

        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Ordenar do mais recente para o mais antigo
        lista.sort((a, b) => b.criadoEm.toDate() - a.criadoEm.toDate());

        setPedidos(lista);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        alert("Erro ao carregar pedidos.");
      } finally {
        setLoading(false);
      }
    };

    if (mercadoId) {
      buscarPedidos();
    }
  }, [mercadoId]);

  const formatarData = (data) => {
    const d = data.toDate();
    return d.toLocaleDateString() + ' às ' + d.toLocaleTimeString();
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center' }}>🧾 Meus Pedidos</h1>

      <button onClick={handleVoltar} style={botaoCinza}>🔙 Voltar</button>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p style={{ marginTop: '20px' }}>Você ainda não fez nenhum pedido.</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={cardPedido}>
              <p><strong>Data:</strong> {formatarData(pedido.criadoEm)}</p>
              <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
              <p><strong>Itens:</strong></p>
              <ul style={{ paddingLeft: '20px' }}>
                {pedido.itens.map((item, idx) => (
                  <li key={idx}>
                    {item.quantidade}x {item.nome} (R$ {item.preco.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const botaoCinza = {
  marginTop: '10px',
  padding: '10px 15px',
  backgroundColor: '#ccc',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const cardPedido = {
  border: '1px solid #ddd',
  borderRadius: '10px',
  padding: '15px',
  marginBottom: '20px',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
};

export default PedidosCliente;
