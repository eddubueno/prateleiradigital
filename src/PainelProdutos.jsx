// PainelProdutos.jsx estilizado e centralizado
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

function PainelProdutos() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [imagemPreview, setImagemPreview] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const mercadoId = 'mercado01';

  useEffect(() => {
    buscarProdutos();
  }, []);

  const buscarProdutos = async () => {
    const ref = collection(db, 'mercados', mercadoId, 'produtos');
    const snapshot = await getDocs(ref);
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProdutos(lista);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setPreco('');
    setQuantidade('');
    setImagemPreview(null);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const novoProduto = {
        nome,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade),
        imagem: imagemPreview || ''
      };
      if (editandoId) {
        await updateDoc(doc(db, 'mercados', mercadoId, 'produtos', editandoId), novoProduto);
        alert('Produto atualizado.');
      } else {
        await addDoc(collection(db, 'mercados', mercadoId, 'produtos'), novoProduto);
        alert('Produto cadastrado.');
      }
      limparFormulario();
      buscarProdutos();
    } catch (error) {
      alert('Erro ao salvar produto.');
      console.error(error);
    }
  };

  const editarProduto = (produto) => {
    setNome(produto.nome);
    setPreco(produto.preco);
    setQuantidade(produto.quantidade);
    setImagemPreview(produto.imagem);
    setEditandoId(produto.id);
  };

  const excluirProduto = async (id) => {
    if (window.confirm('Deseja excluir este produto?')) {
      await deleteDoc(doc(db, 'mercados', mercadoId, 'produtos', id));
      buscarProdutos();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>📋 Cadastro de Produtos</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" required style={{ padding: '10px', fontSize: '16px' }} />
        <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="Preço" required style={{ padding: '10px', fontSize: '16px' }} />
        <input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="Quantidade" required style={{ padding: '10px', fontSize: '16px' }} />
        <input type="file" accept="image/*" onChange={handleImagemChange} style={{ fontSize: '14px' }} />
        {imagemPreview && <img src={imagemPreview} alt="Preview" style={{ width: '120px', marginTop: '10px', borderRadius: '10px' }} />}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#2196F3', color: '#fff', border: 'none', borderRadius: '5px' }}>
            {editandoId ? 'Salvar Alterações' : 'Cadastrar Produto'}
          </button>
          {editandoId && (
            <button type="button" onClick={limparFormulario} style={{ padding: '10px', backgroundColor: '#999', color: '#fff', border: 'none', borderRadius: '5px' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3 style={{ textAlign: 'center' }}>📦 Produtos Cadastrados</h3>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {produtos.map(prod => (
          <li key={prod.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
            <strong>{prod.nome}</strong><br />
            Preço: R$ {prod.preco}<br />
            Qtde: {prod.quantidade}<br />
            {prod.imagem && <img src={prod.imagem} alt={prod.nome} style={{ width: '100%', marginTop: '10px', borderRadius: '10px' }} />}<br />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button onClick={() => editarProduto(prod)} style={{ backgroundColor: '#1976d2', color: '#fff', border: 'none', padding: '8px', borderRadius: '5px', flex: 1 }}>
                Editar
              </button>
              <button onClick={() => excluirProduto(prod.id)} style={{ backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '8px', borderRadius: '5px', flex: 1 }}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PainelProdutos;
