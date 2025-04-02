import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { FaUser, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


function EscolhaTipo({ onEscolherTipo }) {
  const navigate = useNavigate();

  const escolher = (tipo) => {
    onEscolherTipo(tipo);
    navigate('/'); // volta para a rota raiz, App decide o que mostrar
  };

  const voltarAoLogin = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('tipoUsuario');
      navigate('/');
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao voltar ao login.");
    }
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Arial',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f2f2f2'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Você é...</h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '300px'
      }}>
        <button
          onClick={() => escolher('cliente')}
          style={{
            padding: '15px',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <FaUser /> Cliente
        </button>

        <button
          onClick={() => escolher('dono')}
          style={{
            padding: '15px',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <FaStore /> Fornecedor (Dono de Mercado)
        </button>

        <button
          onClick={voltarAoLogin}
          style={{
            marginTop: '30px',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#ccc',
            color: '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Voltar ao Login
        </button>
      </div>
    </div>
  );
}

export default EscolhaTipo;
