import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PainelProdutos from './PainelProdutos';

function PainelAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [paginaAtual, setPaginaAtual] = useState('pedidos');
  const [menuAberto, setMenuAberto] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const ref = query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc'));
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(lista);
    });
    return () => unsubscribe();
  }, []);

  const pedidosPendentes = pedidos.filter(p => p.status !== 'entregue');

  const marcarComoEntregue = async (pedidoId) => {
    try {
      await updateDoc(doc(db, 'pedidos', pedidoId), { status: 'entregue' });
    } catch (error) {
      alert("Erro ao marcar como entregue.");
    }
  };

  const exportarParaExcel = () => {
    const dados = filtrarPedidos().map(pedido => ({
      Data: new Date(pedido.criadoEm.seconds * 1000).toLocaleString(),
      Status: pedido.status || 'pendente',
      Total: pedido.total.toFixed(2),
      Itens: pedido.itens.map(item => `${item.nome} (${item.quantidade}x)`).join(', ')
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'pedidos.xlsx');
  };

  const exportarParaPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text('Relatório de Pedidos', 14, 15);
    const dados = filtrarPedidos().map(pedido => ([
      new Date(pedido.criadoEm.seconds * 1000).toLocaleString(),
      pedido.status || 'pendente',
      `R$ ${pedido.total.toFixed(2)}`,
      pedido.itens.map(item => `${item.nome} (${item.quantidade}x)`).join(', ')
    ]));
    autoTable(docPDF, {
      startY: 20,
      head: [['Data', 'Status', 'Total', 'Itens']],
      body: dados,
    });
    docPDF.save('pedidos.pdf');
  };

  const filtrarPedidos = () => {
    return pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.criadoEm.seconds * 1000);
      const atendeStatus = filtroStatus ? pedido.status === filtroStatus : true;
      const atendeDataInicio = filtroDataInicio ? dataPedido >= new Date(filtroDataInicio) : true;
      const atendeDataFim = filtroDataFim ? dataPedido <= new Date(filtroDataFim) : true;
      return atendeStatus && atendeDataInicio && atendeDataFim;
    });
  };

  const limparFiltros = () => {
    setFiltroStatus('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      await signOut(auth);
      navigate('/');
    } catch (error) {
      alert("Erro ao sair.");
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      {/* Menu Flutuante */}
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1001 }}>
        <button onClick={() => setMenuAberto(true)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
          ☰
        </button>
      </div>

      {menuAberto && (
        <div onClick={() => setMenuAberto(false)} style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
        }} />
      )}

      <div style={{
        position: 'fixed',
        top: menuAberto ? 0 : '-300px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '0 0 10px 10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '260px',
        textAlign: 'center',
        transition: 'top 0.3s ease-in-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>📋 Menu</h3>
          <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', fontSize: '18px' }}>✖</button>
        </div>
        <button onClick={() => { setPaginaAtual('pedidos'); setMenuAberto(false); }} style={{ marginBottom: '10px', width: '100%', padding: '10px' }}>
          🧾 Pedidos {pedidosPendentes.length > 0 && <span style={{ color: 'red' }}>({pedidosPendentes.length})</span>}
        </button>
        <button onClick={() => { setPaginaAtual('produtos'); setMenuAberto(false); }} style={{ marginBottom: '10px', width: '100%', padding: '10px' }}>
          📦 Produtos
        </button>
        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#ff4444', color: '#fff', borderRadius: '5px' }}>
          🔓 Sair
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ marginTop: '60px' }}>
        {paginaAtual === 'pedidos' && (
          <>
            <h1 style={{ textAlign: 'center' }}>📦 Pedidos Recebidos</h1>

            <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <label>
                <strong>Status:</strong>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ marginLeft: '5px' }}>
                  <option value=''>Todos</option>
                  <option value='pendente'>Pendente</option>
                  <option value='entregue'>Entregue</option>
                </select>
              </label>
              <label>
                <strong>Data Início:</strong>
                <input type='date' value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
              </label>
              <label>
                <strong>Data Fim:</strong>
                <input type='date' value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
              </label>
              <button onClick={limparFiltros} style={{ padding: '5px 10px', backgroundColor: '#999', color: '#fff', borderRadius: '5px' }}>
                Limpar Filtros
              </button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={exportarParaExcel} style={{ backgroundColor: '#1d6f42', color: '#fff', padding: '10px', borderRadius: '5px' }}>
                📊 Exportar Excel
              </button>
              <button onClick={exportarParaPDF} style={{ backgroundColor: '#1976d2', color: '#fff', padding: '10px', borderRadius: '5px' }}>
                📄 Exportar PDF
              </button>
            </div>

            {filtrarPedidos().length === 0 ? (
              <p style={{ textAlign: 'center' }}>Nenhum pedido encontrado.</p>
            ) : (
              filtrarPedidos().map((pedido) => (
                <div key={pedido.id} style={{
                  border: '1px solid #999',
                  borderRadius: '10px',
                  padding: '15px',
                  marginBottom: '20px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h3>📅 {new Date(pedido.criadoEm.seconds * 1000).toLocaleString()}</h3>
                  <p>Status: <strong>{pedido.status === 'entregue' ? '✅ Entregue' : '🕒 Pendente'}</strong></p>
                  <ul style={{ paddingLeft: '15px' }}>
                    {pedido.itens.map((item, index) => (
                      <li key={index}>
                        <strong>{item.nome}</strong> — {item.quantidade}x<br />
                        Subtotal: R$ {item.subtotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</p>
                  {pedido.status !== 'entregue' && (
                    <button onClick={() => marcarComoEntregue(pedido.id)} style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>
                      Marcar como Entregue
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {paginaAtual === 'produtos' && <PainelProdutos />}
      </div>
    </div>
  );
}

export default PainelAdmin;
