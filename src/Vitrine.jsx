import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Vitrine() {
  const { mercadoId } = useParams();
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }, [carrinho]);

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        if (!mercadoId) return;
        const ref = collection(db, 'mercados', mercadoId, 'produtos');
        const querySnapshot = await getDocs(ref);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setProdutos(lista);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        alert("Erro ao carregar vitrine.");
      } finally {
        setLoading(false);
      }
    };

    buscarProdutos();
  }, [mercadoId]);

  const categorias = [...new Set(produtos.map(p => p.tipo))];

  const produtosFiltrados = produtos.filter((p) => {
    const nomeMatch = p.nome.toLowerCase().includes(busca.toLowerCase());
    const categoriaMatch = filtroCategoria ? p.tipo === filtroCategoria : true;
    return nomeMatch && categoriaMatch;
  });

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((carrinhoAnterior) => {
      const existente = carrinhoAnterior.find(item => item.id === produto.id);
      if (existente) {
        return carrinhoAnterior.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...carrinhoAnterior, { ...produto, quantidade: 1 }];
      }
    });
  };

  
  const alterarQuantidade = (id, delta) => {
    setCarrinho(prevCarrinho => {
      return prevCarrinho
        .map(item => item.id === id ? { ...item, quantidade: item.quantidade + delta } : item)
        .filter(item => item.quantidade > 0);
    });
  };

  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  const totalValor = carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);

  const handleVoltar = () => {
    localStorage.removeItem('tipoUsuario');
    navigate('/escolha');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('tipoUsuario');
      localStorage.removeItem('carrinho');
      await signOut(auth);
      navigate('/');
    } catch (error) {
      alert("Erro ao sair.");
      console.error(error);
    }
  };

  const finalizarPedido = async () => {
    try {
      const pedido = {
        itens: carrinho.map(item => ({
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          subtotal: item.preco * item.quantidade
        })),
        total: totalValor,
        criadoEm: new Date(),
        mercadoId: mercadoId || 'mercado01'
      };

      await addDoc(collection(db, 'pedidos'), pedido);

      alert("Pedido enviado com sucesso!");
      setCarrinho([]);
      localStorage.removeItem('carrinho');
      setMostrarCarrinho(false);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  };

  if (!mercadoId) {
    return <p className="text-center p-4 text-red-600">Mercado não encontrado.</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button onClick={handleVoltar} style={botaoCinza}>🔙 Voltar</button>
        <button onClick={handleLogout} style={botaoSair}>🔓 Sair</button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>Vitrine</h1>
        <button
          onClick={() => navigate(`/${mercadoId}/pedidos`)}
          style={{
            ...botaoPrincipal,
            width: 'auto',
            marginTop: 0,
            padding: '10px 20px'
          }}
        >
          📜 Ver Meus Pedidos
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            flex: '1',
            ...estilosGerais,
            minWidth: '200px'
          }}
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{
            ...estilosGerais,
            minWidth: '200px'
          }}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Botão flutuante carrinho */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button onClick={() => setMostrarCarrinho(true)} style={botaoCarrinho}>
          🛒
          {totalItens > 0 && (
            <span style={badgeCarrinho}>{totalItens}</span>
          )}
        </button>
      </div>

      {/* Modal do carrinho */}
      <AnimatePresence>
        {mostrarCarrinho && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalOverlay}
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={modalContainer}
            >
              <h2>Carrinho de Compras</h2>
              {carrinho.length === 0 ? (
                <p>Seu carrinho está vazio.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {carrinho.map(item => (
                    <li key={item.id} style={itemCarrinho}>
                      <strong>{item.nome}</strong><br />
                      Quantidade:
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <button
                          onClick={() => alterarQuantidade(item.id, -1)}
                          style={{ ...botaoCinza, padding: '5px 10px' }}
                        >➖</button>
                        <span>{item.quantidade}</span>
                        <button
                          onClick={() => alterarQuantidade(item.id, 1)}
                          style={{ ...botaoPrincipal, padding: '5px 10px' }}
                        >➕</button>
                      </div>
                      <p>Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <h3>Total: R$ {totalValor.toFixed(2)}</h3>

              {carrinho.length > 0 && (
                <button onClick={finalizarPedido} style={botaoPrincipal}>
                  Finalizar Pedido
                </button>
              )}
              <button onClick={() => setMostrarCarrinho(false)} style={botaoCinza}>
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de produtos */}
      {loading ? (
        <div style={gridProdutos}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: '250px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhum produto encontrado.</p>
      ) : (
        <div style={gridProdutos}>
          {produtosFiltrados.map(produto => (
            <motion.div
              key={produto.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={cardProduto}
            >
              {produto.imagem ? (
                <img src={produto.imagem} alt={produto.nome} style={imagemProduto} />
              ) : (
                <div style={imagemPlaceholder}>📷</div>
              )}
              <h3>{produto.nome}</h3>
              <p><strong>Preço:</strong> R$ {Number(produto.preco).toFixed(2)}</p>
              <p><strong>Estoque:</strong> {produto.quantidade}</p>
              <button onClick={() => adicionarAoCarrinho(produto)} style={botaoPrincipal}>
                Adicionar ao carrinho
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🎨 Estilos
const estilosGerais = {
  borderRadius: '8px',
  border: '1px solid #ccc',
  padding: '10px',
  transition: 'background-color 0.3s',
};

const botaoPrincipal = {
  ...estilosGerais,
  marginTop: '10px',
  backgroundColor: '#2196F3',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
};

const botaoCinza = {
  ...estilosGerais,
  backgroundColor: '#ccc',
  cursor: 'pointer',
};

const botaoSair = {
  ...botaoCinza,
  backgroundColor: '#ff4444',
  color: '#fff',
};

const botaoCarrinho = {
  ...estilosGerais,
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#4CAF50',
  color: '#fff',
  fontSize: '24px',
  border: 'none',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  position: 'relative',
};

const badgeCarrinho = {
  position: 'absolute',
  top: '-5px',
  right: '-5px',
  backgroundColor: '#ff4444',
  color: '#fff',
  fontSize: '14px',
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
};

const gridProdutos = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginTop: '30px',
};

const cardProduto = {
  ...estilosGerais,
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  boxShadow: '0 0 10px rgba(0,0,0,0.05)',
};

const imagemProduto = {
  width: '100%',
  borderRadius: '8px',
};

const imagemPlaceholder = {
  height: '150px',
  backgroundColor: '#eee',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px',
  color: '#999',
  fontSize: '40px',
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContainer = {
  ...estilosGerais,
  backgroundColor: '#fff',
  maxWidth: '500px',
  width: '90%',
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
};

const itemCarrinho = {
  borderBottom: '1px solid #ccc',
  marginBottom: '10px',
  paddingBottom: '10px',
};

export default Vitrine;
