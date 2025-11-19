import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import type { TeamRegistration } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
    const [registrations, setRegistrations] = useState<(TeamRegistration & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all');
    const [imageModal, setImageModal] = useState<string | null>(null);
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

    const exportToPDF = async () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Inscrições - UltraVôlei Joinville', 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
        const totalAtletas = filteredRegistrations.reduce((sum, reg) => sum + reg.atletas.length, 0);
        doc.text(`Total de Equipes: ${filteredRegistrations.length} | Total de Atletas: ${totalAtletas}`, 14, 36);

        // Função para converter imagem em base64
        const loadImageAsBase64 = (url: string): Promise<string> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/jpeg'));
                    } else {
                        resolve('');
                    }
                };
                img.onerror = () => resolve('');
                img.src = url;
            });
        };

        // Preparar dados e carregar imagens
        const tableData = await Promise.all(
            filteredRegistrations.flatMap((reg) => 
                reg.atletas.map(async (atleta) => {
                    let imgData = '';
                    if (atleta.fotoAtleta) {
                        imgData = await loadImageAsBase64(atleta.fotoAtleta);
                    }
                    // Formatar data de aaaa-mm-dd para dd/mm/aaaa
                    const dataNascimento = atleta.dataNascimento.split('-').reverse().join('/');
                    return [
                        imgData,
                        reg.nomeEquipe,
                        reg.status.toUpperCase(),
                        atleta.nome,
                        atleta.tipoDocumento.toUpperCase(),
                        atleta.numeroDocumento,
                        dataNascimento,
                        atleta.numeroJogador,
                    ];
                })
            )
        );

        // Armazenar as imagens para desenhar depois
        const images: { [key: string]: string } = {};
        tableData.forEach((row, index) => {
            if (row[0]) {
                images[index] = row[0] as string;
            }
        });

        autoTable(doc, {
            head: [['Foto', 'Equipe', 'Atleta', 'Doc', 'Número Doc', 'Nascimento', 'Nº']],
            body: tableData.map(row => ['', row[1], row[3], row[4], row[5], row[6], row[7]]),
            startY: 42,
            styles: { fontSize: 8, cellPadding: 2, minCellHeight: 18, halign: 'left', valign: 'middle' },
            headStyles: { fillColor: [103, 4, 112], halign: 'center' },
            columnStyles: {
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 32 },
                2: { cellWidth: 38 },
                3: { cellWidth: 13 },
                4: { cellWidth: 30 },
                5: { cellWidth: 24 },
                6: { cellWidth: 13 },
            },
            didDrawCell: (data) => {
                if (data.column.index === 0 && data.cell.section === 'body') {
                    const imageData = images[data.row.index];
                    if (imageData) {
                        try {
                            const imgWidth = 14;
                            const imgHeight = 14;
                            const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                            const y = data.cell.y + (data.cell.height - imgHeight) / 2;
                            doc.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight);
                        } catch (e) {
                            console.log('Erro ao adicionar imagem:', e);
                        }
                    }
                }
            },
        });

        doc.save(`inscricoes_ultravolei_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportToExcel = () => {
        const data = filteredRegistrations.flatMap((reg) => 
            reg.atletas.map((atleta, idx) => ({
                'Equipe': reg.nomeEquipe,
                'Categoria': reg.categoria,
                'Técnico': reg.nomeTecnico,
                'Status': reg.status.toUpperCase(),
                'Atleta': atleta.nome,
                'Tipo Doc': atleta.tipoDocumento.toUpperCase(),
                'Documento': atleta.numeroDocumento,
                'Nascimento': atleta.dataNascimento,
                'Número': atleta.numeroJogador,
            }))
        );

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inscrições');
        
        XLSX.writeFile(wb, `inscricoes_ultravolei_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                        onClick={exportToPDF}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                        title="Exportar para PDF"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                        title="Exportar para Excel"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        Excel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Sair
                    </button>
                </div>
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
                                    <img 
                                        src={registration.fotoEquipe} 
                                        alt="Foto da equipe" 
                                        className="w-24 h-24 object-cover rounded-lg mt-4 md:mt-0 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setImageModal(registration.fotoEquipe!)}
                                    />
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
                                                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => setImageModal(atleta.fotoAtleta!)}
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

            {/* Image Modal */}
            {imageModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setImageModal(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setImageModal(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-4xl font-bold"
                        >
                            ×
                        </button>
                        <img 
                            src={imageModal} 
                            alt="Imagem ampliada" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
