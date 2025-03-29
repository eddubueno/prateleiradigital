// src/App.jsx

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Login from './Login';
import Cadastro from './Cadastro';
import PainelAdmin from './PainelAdmin';
import Vitrine from './Vitrine';
import EscolhaTipo from './EscolhaTipo';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(localStorage.getItem('tipoUsuario') || null);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [exibindoBoasVindas, setExibindoBoasVindas] = useState(false);

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

  const irParaCadastro = () => setMostrarCadastro(true);
  const voltarParaLogin = () => setMostrarCadastro(false);

  const handleCadastroFinalizado = () => {
    setExibindoBoasVindas(false);
    setMostrarCadastro(false);
    const tipo = localStorage.getItem('tipoUsuario');
    setTipoUsuario(tipo);
  };

  if (carregando) return <p>Carregando...</p>;
  if (exibindoBoasVindas) return null;

  if (!usuarioLogado) {
    return mostrarCadastro ? (
      <Cadastro
        tipo="cliente"
        onCadastrado={handleCadastroFinalizado}
        voltarParaLogin={voltarParaLogin}
        setExibindoBoasVindas={setExibindoBoasVindas}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        irParaCadastro={irParaCadastro}
      />
    );
  }

  if (!tipoUsuario) {
    return <EscolhaTipo onEscolherTipo={handleEscolherTipo} />;
  }

  if (tipoUsuario === 'dono') return <PainelAdmin />;
  return <Vitrine />;
}

export default App;
