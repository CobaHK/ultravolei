import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import type { TeamRegistration } from './types';

const AdminDashboard: React.FC = () => {
    const [registrations, setRegistrations] = useState<(TeamRegistration & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as (TeamRegistration & { id: string })[];
            setRegistrations(data);
        } catch (error) {
            console.error('Erro ao carregar inscrições:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'pendente' | 'aprovado' | 'rejeitado') => {
        try {
            await updateDoc(doc(db, 'registrations', id), {
                status: newStatus
            });
            await loadRegistrations();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta inscrição?')) {
            try {
                await deleteDoc(doc(db, 'registrations', id));
                await loadRegistrations();
            } catch (error) {
                console.error('Erro ao excluir:', error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const filteredRegistrations = filterStatus === 'all' 
        ? registrations 
        : registrations.filter(r => r.status === filterStatus);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'aprovado': return 'bg-green-500/20 text-green-400 border-green-500';
            case 'rejeitado': return 'bg-red-500/20 text-red-400 border-red-500';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
        }
    };

    const getCategoryBadgeClass = (categoria: string) => {
        switch (categoria) {
            case 'feminino': return 'bg-pink-500/20 text-pink-400 border-pink-500';
            case 'masculino': return 'bg-blue-500/20 text-blue-400 border-blue-500';
            default: return 'bg-purple-500/20 text-purple-400 border-purple-500';
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold uppercase text-white tracking-wider mb-2">
                        Painel Administrativo
                    </h1>
                    <p className="text-gray-400">Gerenciar inscrições do campeonato</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="mt-4 md:mt-0 bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                    Sair
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-400 text-sm uppercase tracking-wide">Total</p>
                    <p className="text-3xl font-bold text-white">{registrations.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-gray-400 text-sm uppercase tracking-wide">Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-400">
                        {registrations.filter(r => r.status === 'pendente').length}
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-400 text-sm uppercase tracking-wide">Aprovados</p>
                    <p className="text-3xl font-bold text-green-400">
                        {registrations.filter(r => r.status === 'aprovado').length}
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-red-500">
                    <p className="text-gray-400 text-sm uppercase tracking-wide">Rejeitados</p>
                    <p className="text-3xl font-bold text-red-400">
                        {registrations.filter(r => r.status === 'rejeitado').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filterStatus === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Todas ({registrations.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('pendente')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filterStatus === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Pendentes ({registrations.filter(r => r.status === 'pendente').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('aprovado')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filterStatus === 'aprovado' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Aprovadas ({registrations.filter(r => r.status === 'aprovado').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejeitado')}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors ${filterStatus === 'rejeitado' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Rejeitadas ({registrations.filter(r => r.status === 'rejeitado').length})
                    </button>
                </div>
            </div>

            {/* Registrations List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    <p className="text-gray-400 mt-4">Carregando...</p>
                </div>
            ) : filteredRegistrations.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-400 text-xl">Nenhuma inscrição encontrada</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredRegistrations.map((registration) => (
                        <div key={registration.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-2">{registration.nomeEquipe}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(registration.categoria)}`}>
                                            {registration.categoria.toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(registration.status)}`}>
                                            {registration.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                {registration.fotoEquipe && (
                                    <img src={registration.fotoEquipe} alt="Foto da equipe" className="w-24 h-24 object-cover rounded-lg mt-4 md:mt-0" />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Técnico</p>
                                    <p className="text-white font-semibold">{registration.nomeTecnico}</p>
                                </div>
                            </div>

                            <details className="mb-4">
                                <summary className="cursor-pointer text-purple-400 font-semibold hover:text-purple-300">
                                    Ver atletas ({registration.atletas.length})
                                </summary>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {registration.atletas.map((atleta, idx) => (
                                        <div key={idx} className="bg-gray-700/50 p-4 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                {atleta.fotoAtleta && (
                                                    <img 
                                                        src={atleta.fotoAtleta} 
                                                        alt={atleta.nome} 
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-bold text-white">{atleta.nome}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {atleta.tipoDocumento.toUpperCase()}: {atleta.numeroDocumento}
                                                    </p>
                                                    <p className="text-sm text-gray-400">Nascimento: {atleta.dataNascimento}</p>
                                                    <p className="text-sm text-gray-400">Número: {atleta.numeroJogador}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleStatusChange(registration.id, 'aprovado')}
                                    disabled={registration.status === 'aprovado'}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ✓ Aprovar
                                </button>
                                <button
                                    onClick={() => handleStatusChange(registration.id, 'rejeitado')}
                                    disabled={registration.status === 'rejeitado'}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ✗ Rejeitar
                                </button>
                                <button
                                    onClick={() => handleStatusChange(registration.id, 'pendente')}
                                    disabled={registration.status === 'pendente'}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ⟳ Pendente
                                </button>
                                <button
                                    onClick={() => handleDelete(registration.id)}
                                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors ml-auto"
                                >
                                    🗑 Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
