import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Login from './Login';
import Cadastro from './Cadastro';
import PainelAdmin from './PainelAdmin';
import Vitrine from './Vitrine';
import EscolhaTipo from './EscolhaTipo';
import Prateleira from './Prateleira';
import PedidosCliente from './PedidosCliente'; // 👈 importado aqui

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(localStorage.getItem('tipoUsuario') || null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUsuarioLogado(usuario);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (usuario) => {
    setUsuarioLogado(usuario);
    const tipo = localStorage.getItem('tipoUsuario');
    setTipoUsuario(tipo);
  };

  const handleEscolherTipo = (tipo) => {
    setTipoUsuario(tipo);
    localStorage.setItem('tipoUsuario', tipo);
  };

  if (carregando) return <p>Carregando...</p>;

  return (
    <Routes>
      <Route path="/vitrine/:mercadoId" element={<Vitrine />} />
      <Route path="/prateleira/:mercadoId" element={<Prateleira />} />
      <Route path="/:mercadoId/pedidos" element={<PedidosCliente />} /> {/* 👈 nova rota */}
      <Route path="/cadastro" element={
        <Cadastro
          tipo="cliente"
          onCadastrado={() => window.location.href = '/'}
          voltarParaLogin={() => window.location.href = '/'}
          setExibindoBoasVindas={() => {}}
        />
      } />
      {!usuarioLogado ? (
        <Route path="*" element={
          <Login
            onLogin={handleLogin}
            irParaCadastro={() => window.location.href = '/cadastro'}
          />
        } />
      ) : !tipoUsuario ? (
        <Route path="*" element={<EscolhaTipo onEscolherTipo={handleEscolherTipo} />} />
      ) : tipoUsuario === 'dono' ? (
        <Route path="*" element={<PainelAdmin />} />
      ) : (
        <Route path="*" element={<Navigate to="/vitrine/mercado01" />} />
      )}
    </Routes>
  );
}

export default App;
