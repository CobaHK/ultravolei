import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { db, auth, storage } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import type { TeamRegistration, Athlete } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
    const [registrations, setRegistrations] = useState<(TeamRegistration & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'aprovado' | 'rejeitado'>('all');
    const [imageModal, setImageModal] = useState<string | null>(null);
    const [editModal, setEditModal] = useState<(TeamRegistration & { id: string }) | null>(null);
    const [editForm, setEditForm] = useState<TeamRegistration | null>(null);
    const [teamPhoto, setTeamPhoto] = useState<File | null>(null);
    const [athletePhotos, setAthletePhotos] = useState<{ [index: number]: File }>({});
    const [saving, setSaving] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [selectedTeamForExport, setSelectedTeamForExport] = useState<(TeamRegistration & { id: string }) | null>(null);
    const [exportIncludeCpf, setExportIncludeCpf] = useState(true);
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

    const openEditModal = (registration: TeamRegistration & { id: string }) => {
        setEditModal(registration);
        setEditForm(JSON.parse(JSON.stringify(registration))); // Deep copy
        setTeamPhoto(null);
        setAthletePhotos({});
    };

    const closeEditModal = () => {
        setEditModal(null);
        setEditForm(null);
        setTeamPhoto(null);
        setAthletePhotos({});
    };

    const handleEditFormChange = (field: keyof TeamRegistration, value: any) => {
        if (editForm) {
            setEditForm({ ...editForm, [field]: value });
        }
    };

    const handleAthleteChange = (index: number, field: keyof Athlete, value: any) => {
        if (editForm) {
            const newAtletas = [...editForm.atletas];
            newAtletas[index] = { ...newAtletas[index], [field]: value };
            setEditForm({ ...editForm, atletas: newAtletas });
        }
    };

    const handleTeamPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setTeamPhoto(e.target.files[0]);
        }
    };

    const handleAthletePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAthletePhotos({ ...athletePhotos, [index]: e.target.files[0] });
        }
    };

    const removeTeamPhoto = () => {
        setTeamPhoto(null);
        if (editForm) {
            setEditForm({ ...editForm, fotoEquipe: undefined });
        }
    };

    const removeAthletePhoto = (index: number) => {
        const newPhotos = { ...athletePhotos };
        delete newPhotos[index];
        setAthletePhotos(newPhotos);
        
        if (editForm) {
            const newAtletas = [...editForm.atletas];
            newAtletas[index] = { ...newAtletas[index], fotoAtleta: undefined };
            setEditForm({ ...editForm, atletas: newAtletas });
        }
    };

    const addAthlete = () => {
        if (editForm) {
            const newAthlete: Athlete = {
                nome: '',
                tipoDocumento: 'cpf',
                numeroDocumento: '',
                dataNascimento: '',
                numeroJogador: '',
            };
            setEditForm({ ...editForm, atletas: [...editForm.atletas, newAthlete] });
        }
    };

    const removeAthlete = (index: number) => {
        if (editForm && window.confirm('Remover este atleta?')) {
            const newAtletas = editForm.atletas.filter((_, i) => i !== index);
            setEditForm({ ...editForm, atletas: newAtletas });
            
            // Remove foto do atleta se existir
            const newPhotos = { ...athletePhotos };
            delete newPhotos[index];
            setAthletePhotos(newPhotos);
        }
    };

    const saveEdit = async () => {
        if (!editForm || !editModal) return;

        setSaving(true);
        try {
            const updatedData: any = {
                nomeEquipe: editForm.nomeEquipe,
                categoria: editForm.categoria,
                nomeTecnico: editForm.nomeTecnico,
                atletas: editForm.atletas,
            };

            // Upload team photo if changed
            if (teamPhoto) {
                const timestamp = Date.now();
                const teamPhotoRef = ref(storage, `team-photos/${timestamp}_${teamPhoto.name}`);
                await uploadBytes(teamPhotoRef, teamPhoto);
                const teamPhotoUrl = await getDownloadURL(teamPhotoRef);
                updatedData.fotoEquipe = teamPhotoUrl;
            } else if (editForm.fotoEquipe !== undefined) {
                updatedData.fotoEquipe = editForm.fotoEquipe;
            }

            // Upload athlete photos if changed
            for (const [indexStr, file] of Object.entries(athletePhotos)) {
                const index = parseInt(indexStr);
                const timestamp = Date.now();
                const athletePhotoRef = ref(storage, `athlete-photos/${timestamp}_${(file as File).name}`);
                await uploadBytes(athletePhotoRef, file as File);
                const athletePhotoUrl = await getDownloadURL(athletePhotoRef);
                updatedData.atletas[index].fotoAtleta = athletePhotoUrl;
            }

            await updateDoc(doc(db, 'registrations', editModal.id), updatedData);
            await loadRegistrations();
            closeEditModal();
        } catch (error) {
            console.error('Erro ao salvar edição:', error);
            alert('Erro ao salvar alterações');
        } finally {
            setSaving(false);
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
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
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

                    // Se não incluir CPF/RG, mascarar número quando for CPF ou RG
                    const numeroDocumento = (!exportIncludeCpf && (atleta.tipoDocumento === 'cpf' || atleta.tipoDocumento === 'rg')) ? '—' : atleta.numeroDocumento;
                    return [
                        imgData,
                        reg.nomeEquipe,
                        reg.status.toUpperCase(),
                        atleta.nome,
                        atleta.tipoDocumento.toUpperCase(),
                        numeroDocumento,
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

        // Construir head/body/columnStyles dependendo se vamos incluir Doc/Num Doc
        const includeDocs = exportIncludeCpf;
        const head = includeDocs
            ? [['Foto', 'Equipe', 'Atleta', 'Doc', 'Número Doc', 'Nascimento', 'Nº']]
            : [['Foto', 'Equipe', 'Atleta', 'Nascimento', 'Nº']];

        const body = tableData.map(row => {
            if (includeDocs) return ['', row[1], row[3], row[4], row[5], row[6], row[7]];
            return ['', row[1], row[3], row[6], row[7]];
        });

        const columnStyles = includeDocs
            ? {
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 32 },
                2: { cellWidth: 38 },
                3: { cellWidth: 13 },
                4: { cellWidth: 30 },
                5: { cellWidth: 24 },
                6: { cellWidth: 13 },
            }
            : {
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 48 },
                2: { cellWidth: 56 },
                3: { cellWidth: 40 },
                4: { cellWidth: 14 },
            };

        autoTable(doc, {
            head,
            body,
            startY: 48,
            styles: { fontSize: 8, cellPadding: 2, minCellHeight: 18, halign: 'left', valign: 'middle' },
            headStyles: { fillColor: [103, 4, 112], halign: 'center' },
            columnStyles: columnStyles as any,
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

    const exportTeamPDF = async (team: TeamRegistration & { id: string }, includeCpf: boolean) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Inscrição - ${team.nomeEquipe}`, 14, 22);

        doc.setFontSize(11);
        doc.text(`Técnico: ${team.nomeTecnico || ''}`, 14, 28);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

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

        const tableData = await Promise.all(
            team.atletas.map(async (atleta) => {
                let imgData = '';
                if (atleta.fotoAtleta) {
                    imgData = await loadImageAsBase64(atleta.fotoAtleta);
                }
                const dataNascimento = atleta.dataNascimento ? atleta.dataNascimento.split('-').reverse().join('/') : '';

                // Se não incluir CPF/RG, mascarar número quando for CPF ou RG
                const numeroDocumento = (!includeCpf && (atleta.tipoDocumento === 'cpf' || atleta.tipoDocumento === 'rg')) ? '—' : atleta.numeroDocumento;

                return [
                    imgData,
                    team.nomeEquipe,
                    atleta.nome,
                    atleta.tipoDocumento.toUpperCase(),
                    numeroDocumento,
                    dataNascimento,
                    atleta.numeroJogador,
                ];
            })
        );

        const images: { [key: string]: string } = {};
        tableData.forEach((row, index) => {
            if (row[0]) images[index] = row[0] as string;
        });

        const includeDocsTeam = includeCpf;
        const headTeam = includeDocsTeam
            ? [['Foto', 'Equipe', 'Atleta', 'Doc', 'Número Doc', 'Nascimento', 'Nº']]
            : [['Foto', 'Equipe', 'Atleta', 'Nascimento', 'Nº']];

        const bodyTeam = tableData.map(row => {
            if (includeDocsTeam) return ['', row[1], row[2], row[3], row[4], row[5], row[6]];
            return ['', row[1], row[2], row[5], row[6]];
        });

        const columnStylesTeam = includeDocsTeam
            ? {
                0: { cellWidth: 18 },
                1: { cellWidth: 40 },
                2: { cellWidth: 46 },
                3: { cellWidth: 18 },
                4: { cellWidth: 34 },
                5: { cellWidth: 28 },
                6: { cellWidth: 14 },
            }
            : {
                0: { cellWidth: 18 },
                1: { cellWidth: 40 },
                2: { cellWidth: 74 },
                3: { cellWidth: 40 },
                4: { cellWidth: 14 },
            };

        autoTable(doc, {
            head: headTeam,
            body: bodyTeam,
            startY: 48,
            styles: { fontSize: 10, cellPadding: 2, minCellHeight: 18, halign: 'left', valign: 'middle' },
            headStyles: { fillColor: [103, 4, 112], halign: 'center' },
            columnStyles: columnStylesTeam as any,
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

        doc.save(`inscricao_${team.nomeEquipe.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="flex items-center text-sm text-gray-300">
                        <input
                            id="globalIncludeCpf"
                            type="checkbox"
                            checked={exportIncludeCpf}
                            onChange={(e) => setExportIncludeCpf(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="globalIncludeCpf">Incluir CPF/RG</label>
                    </div>

                    <div className="flex gap-2">
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
                                    onClick={() => openEditModal(registration)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors ml-auto"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedTeamForExport(registration);
                                        setExportIncludeCpf(true);
                                        setExportModalOpen(true);
                                    }}
                                    title="Exportar PDF do time"
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                    </svg>
                                    <span>PDF do Time</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(registration.id)}
                                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    🗑 Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Export Team Review Modal */}
            {exportModalOpen && selectedTeamForExport && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Revisar exportação - {selectedTeamForExport.nomeEquipe}</h2>
                            <button onClick={() => setExportModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>

                        <div className="mb-4 text-gray-300">
                            <p><strong>Categoria:</strong> {selectedTeamForExport.categoria}</p>
                            <p><strong>Técnico:</strong> {selectedTeamForExport.nomeTecnico}</p>
                            <p className="mt-2"><strong>Atletas ({selectedTeamForExport.atletas.length}):</strong></p>
                            <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                                {selectedTeamForExport.atletas.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {a.fotoAtleta && <img src={a.fotoAtleta} alt={a.nome} className="w-10 h-10 object-cover rounded" />}
                                        <div>
                                            <div className="text-white font-semibold">{a.nome}</div>
                                            <div className="text-sm text-gray-400">{a.tipoDocumento.toUpperCase()}: {a.numeroDocumento}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                                    <input id="includeCpf" type="checkbox" checked={exportIncludeCpf} onChange={(e) => setExportIncludeCpf(e.target.checked)} />
                                    <label htmlFor="includeCpf" className="text-gray-300">Incluir CPF/RG (mostrar números de documentos do tipo CPF ou RG)</label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setExportModalOpen(false)} className="bg-gray-600 text-white px-4 py-2 rounded-md">Cancelar</button>
                            <button
                                onClick={async () => {
                                    setExportModalOpen(false);
                                    if (selectedTeamForExport) await exportTeamPDF(selectedTeamForExport, exportIncludeCpf);
                                }}
                                className="bg-purple-500 text-white px-4 py-2 rounded-md"
                            >
                                Exportar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && editForm && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-white">Editar Inscrição</h2>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-white text-3xl"
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        {/* Team Info */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Nome da Equipe</label>
                                <input
                                    type="text"
                                    value={editForm.nomeEquipe}
                                    onChange={(e) => handleEditFormChange('nomeEquipe', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Categoria</label>
                                <select
                                    value={editForm.categoria}
                                    onChange={(e) => handleEditFormChange('categoria', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="feminino">Feminino</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="misto">Misto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Nome do Técnico</label>
                                <input
                                    type="text"
                                    value={editForm.nomeTecnico}
                                    onChange={(e) => handleEditFormChange('nomeTecnico', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">Foto da Equipe</label>
                                <div className="flex items-center gap-4">
                                    {editForm.fotoEquipe && !teamPhoto && (
                                        <div className="relative">
                                            <img src={editForm.fotoEquipe} alt="Equipe" className="w-24 h-24 object-cover rounded-lg" />
                                            <button
                                                onClick={removeTeamPhoto}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                    {teamPhoto && (
                                        <div className="relative">
                                            <img src={URL.createObjectURL(teamPhoto)} alt="Nova foto" className="w-24 h-24 object-cover rounded-lg" />
                                            <button
                                                onClick={() => setTeamPhoto(null)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleTeamPhotoChange}
                                        className="text-sm text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Athletes */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Atletas</h3>
                                <button
                                    onClick={addAthlete}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                                >
                                    + Adicionar Atleta
                                </button>
                            </div>

                            <div className="space-y-4">
                                {editForm.atletas.map((atleta, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-white">Atleta {index + 1}</h4>
                                            <button
                                                onClick={() => removeAthlete(index)}
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                                            >
                                                Remover
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Nome</label>
                                                <input
                                                    type="text"
                                                    value={atleta.nome}
                                                    onChange={(e) => handleAthleteChange(index, 'nome', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Tipo de Documento</label>
                                                <select
                                                    value={atleta.tipoDocumento}
                                                    onChange={(e) => handleAthleteChange(index, 'tipoDocumento', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="cpf">CPF</option>
                                                    <option value="rg">RG</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Número do Documento</label>
                                                <input
                                                    type="text"
                                                    value={atleta.numeroDocumento}
                                                    onChange={(e) => handleAthleteChange(index, 'numeroDocumento', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Data de Nascimento</label>
                                                <input
                                                    type="date"
                                                    value={atleta.dataNascimento}
                                                    onChange={(e) => handleAthleteChange(index, 'dataNascimento', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Número do Jogador</label>
                                                <input
                                                    type="text"
                                                    value={atleta.numeroJogador}
                                                    onChange={(e) => handleAthleteChange(index, 'numeroJogador', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Foto do Atleta</label>
                                                <div className="flex items-center gap-2">
                                                    {atleta.fotoAtleta && !athletePhotos[index] && (
                                                        <div className="relative">
                                                            <img src={atleta.fotoAtleta} alt={atleta.nome} className="w-12 h-12 object-cover rounded" />
                                                            <button
                                                                onClick={() => removeAthletePhoto(index)}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )}
                                                    {athletePhotos[index] && (
                                                        <div className="relative">
                                                            <img src={URL.createObjectURL(athletePhotos[index])} alt="Nova" className="w-12 h-12 object-cover rounded" />
                                                            <button
                                                                onClick={() => {
                                                                    const newPhotos = { ...athletePhotos };
                                                                    delete newPhotos[index];
                                                                    setAthletePhotos(newPhotos);
                                                                }}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleAthletePhotoChange(index, e)}
                                                        className="text-xs text-gray-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeEditModal}
                                disabled={saving}
                                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    '💾 Salvar'
                                )}
                            </button>
                        </div>
                    </div>
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
