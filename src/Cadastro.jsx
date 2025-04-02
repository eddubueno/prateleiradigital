import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

function Cadastro({ tipo, voltarParaLogin, onCadastrado, setExibindoBoasVindas }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarBoasVindas, setMostrarBoasVindas] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (senha.length < 6) {
      return alert("A senha deve ter no mínimo 6 caracteres.");
    }

    if (senha !== confirmarSenha) {
      return alert("As senhas não coincidem.");
    }

    setCarregando(true);
    try {
      const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = credenciais.user.uid;

      await setDoc(doc(collection(db, 'usuarios'), uid), {
        nome,
        email,
        tipo,
        mercadoId: tipo === 'dono' ? 'mercado01' : null,
        pagamentoConfirmado: tipo === 'dono' ? false : true
      });

      localStorage.setItem('tipoUsuario', tipo);
      setMostrarBoasVindas(true);
      setExibindoBoasVindas(true);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar. Verifique os dados:\n" + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const fecharMensagem = () => {
    setMostrarBoasVindas(false);
    setExibindoBoasVindas(false);
    onCadastrado();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f4f6f8',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      {mostrarBoasVindas && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: '#1976d2', marginBottom: '15px' }}>🎉 Bem-vindo!</h2>
            <p style={{ fontSize: '16px', marginBottom: '25px' }}>
              Olá <strong>{nome}</strong>, seja bem-vindo ao <strong>Prateleira Digital</strong>!
            </p>
            <button onClick={fecharMensagem} style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Continuar
            </button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
          📝 Novo Cadastro ({tipo === 'dono' ? 'Dono do Mercado' : 'Cliente'})
        </h2>

        <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <input type="password" placeholder="Confirmar Senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
          
          <button type="submit" disabled={carregando} style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          <button type="button" onClick={voltarParaLogin} style={{
            backgroundColor: '#ccc',
            color: '#333',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}>
            Voltar ao Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
