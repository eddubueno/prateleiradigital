// Vitrine.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';

function Vitrine() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const mercadoId = 'mercado01';

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
      }
    };

    buscarProdutos();
  }, []);

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

  const removerDoCarrinho = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  const totalValor = carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);

  const handleVoltar = () => {
    localStorage.removeItem('tipoUsuario');
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('tipoUsuario');
      localStorage.removeItem('carrinho');
      await signOut(auth);
      window.location.reload();
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
        criadoEm: new Date()
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      {/* Botões topo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={handleVoltar}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ccc',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔙 Voltar
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔓 Sair
        </button>
      </div>

      <h1 style={{ textAlign: 'center' }}>Vitrine</h1>

      {/* Botão flutuante com contador */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setMostrarCarrinho(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            color: '#fff',
            fontSize: '24px',
            border: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          🛒
          {totalItens > 0 && (
            <span style={{
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
              boxShadow: '0 0 4px rgba(0,0,0,0.3)'
            }}>
              {totalItens}
            </span>
          )}
        </button>
      </div>

      {/* Modal do Carrinho */}
      {mostrarCarrinho && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2>Carrinho de Compras</h2>
            {carrinho.length === 0 ? (
              <p>Seu carrinho está vazio.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {carrinho.map(item => (
                  <li key={item.id} style={{
                    borderBottom: '1px solid #ccc',
                    marginBottom: '10px',
                    paddingBottom: '10px'
                  }}>
                    <strong>{item.nome}</strong><br />
                    Quantidade: {item.quantidade}<br />
                    Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}<br />
                    <button onClick={() => removerDoCarrinho(item.id)} style={{
                      marginTop: '5px',
                      padding: '5px 10px',
                      backgroundColor: '#ff4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <h3>Total: R$ {totalValor.toFixed(2)}</h3>

            {carrinho.length > 0 && (
              <button onClick={finalizarPedido} style={{
                marginTop: '10px',
                marginRight: '10px',
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Finalizar Pedido
              </button>
            )}

            <button onClick={() => setMostrarCarrinho(false)} style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#ccc',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Lista de produtos */}
      {produtos.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nenhum produto disponível no momento.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          {produtos.map(produto => (
            <div key={produto.id} style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '15px',
              backgroundColor: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.05)'
            }}>
              {produto.imagem ? (
                <img src={produto.imagem} alt={produto.nome} style={{ width: '100%', borderRadius: '8px' }} />
              ) : (
                <div style={{
                  height: '150px',
                  backgroundColor: '#eee',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '8px',
                  color: '#999',
                  fontSize: '40px'
                }}>
                  📷
                </div>
              )}
              <h3>{produto.nome}</h3>
              <p><strong>Preço:</strong> R$ {Number(produto.preco).toFixed(2)}</p>
              <p><strong>Estoque:</strong> {produto.quantidade}</p>
              <button
                onClick={() => adicionarAoCarrinho(produto)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#2196F3',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Adicionar ao carrinho
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Vitrine;
