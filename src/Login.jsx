import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';

function Login({ onLogin, irParaCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      return alert("Por favor, preencha todos os campos.");
    }

    setCarregando(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      onLogin(userCredential.user);
    } catch (error) {
      alert(`Erro ao fazer login:\n${error.message}`);
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const loginComGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setCarregando(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      onLogin(userCredential.user);
    } catch (error) {
      alert(`Erro no login com Google:\n${error.message}`);
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  const loginComApple = async () => {
    const provider = new OAuthProvider('apple.com');
    setCarregando(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      onLogin(userCredential.user);
    } catch (error) {
      alert(`Erro no login com Apple:\n${error.message}`);
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f4f6f8',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>🔐 Login</h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            disabled={carregando}
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar com Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>ou</div>

        <button
          onClick={loginComGoogle}
          disabled={carregando}
          style={{
            backgroundColor: '#4285F4',
            color: '#fff',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            width: '100%',
            fontWeight: 'bold',
            marginBottom: '10px',
            cursor: 'pointer'
          }}
        >
          Entrar com Google
        </button>

        <button
          onClick={loginComApple}
          disabled={carregando}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            width: '100%',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Entrar com Apple
        </button>

        <p style={{ marginTop: '25px', textAlign: 'center', color: '#555' }}>
          Ainda não tem uma conta? <br />
          <button
            onClick={irParaCadastro}
            style={{
              marginTop: '8px',
              background: 'none',
              border: 'none',
              color: '#1976d2',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Criar Conta
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
