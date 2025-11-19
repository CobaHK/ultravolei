import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import type { TeamRegistration, Athlete } from './types';

// Função para aplicar máscara de CPF
const applyCpfMask = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// Função para aplicar máscara de RG
const applyRgMask = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1})/, '$1-$2')
        .replace(/(-\d{1})\d+?$/, '$1');
};

const RegistrationPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const { register, control, handleSubmit, reset, formState: { errors }, watch } = useForm<TeamRegistration>({
        defaultValues: {
            nomeEquipe: '',
            categoria: 'feminino',
            nomeTecnico: '',
            telefoneTecnico: '',
            emailTecnico: '',
            atletas: [{ nome: '', tipoDocumento: 'cpf', numeroDocumento: '', dataNascimento: '', posicao: '', numeroJogador: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'atletas'
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const onSubmit = async (data: TeamRegistration) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            let fotoEquipeUrl = '';

            // Upload da foto se existir
            if (photoFile) {
                const photoRef = ref(storage, `team-photos/${Date.now()}_${photoFile.name}`);
                await uploadBytes(photoRef, photoFile);
                fotoEquipeUrl = await getDownloadURL(photoRef);
            }

            // Salvar no Firestore
            const registrationData = {
                ...data,
                fotoEquipe: fotoEquipeUrl,
                createdAt: serverTimestamp(),
                status: 'pendente'
            };

            await addDoc(collection(db, 'registrations'), registrationData);

            setSubmitSuccess(true);
            reset();
            setPhotoFile(null);
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Erro ao enviar inscrição:', error);
            setSubmitError('Erro ao enviar inscrição. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold uppercase text-white tracking-wider mb-4">
                        Ficha de Inscrição
                    </h1>
                    <p className="text-xl text-gray-300">UltraVôlei Joinville - Campeonato 2025</p>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                    <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-8">
                        <h3 className="text-2xl font-bold text-green-400 mb-2">✓ Inscrição enviada com sucesso!</h3>
                        <p className="text-gray-300">Sua equipe foi inscrita. Aguarde a confirmação.</p>
                        <button
                            onClick={() => setSubmitSuccess(false)}
                            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Fazer nova inscrição
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {submitError && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-8">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Erro</h3>
                        <p className="text-gray-300">{submitError}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg p-8 shadow-2xl">
                    {/* Informações da Equipe */}
                    <section className="mb-10">
                        <h2 className="text-3xl font-bold uppercase tracking-wider mb-6 pb-3 border-b-2 border-purple-500">
                            Informações da Equipe
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Nome da Equipe *
                                </label>
                                <input
                                    type="text"
                                    {...register('nomeEquipe', { required: 'Nome da equipe é obrigatório' })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: UltraVôlei Warriors"
                                />
                                {errors.nomeEquipe && <p className="text-red-400 text-sm mt-1">{errors.nomeEquipe.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Categoria *
                                </label>
                                <select
                                    {...register('categoria', { required: true })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="feminino">Feminino</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="misto">Misto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Foto da Equipe (opcional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                                />
                                {photoFile && (
                                    <p className="text-green-400 text-sm mt-2">✓ {photoFile.name}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Informações do Técnico */}
                    <section className="mb-10">
                        <h2 className="text-3xl font-bold uppercase tracking-wider mb-6 pb-3 border-b-2 border-purple-500">
                            Informações do Técnico
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Nome do Técnico *
                                </label>
                                <input
                                    type="text"
                                    {...register('nomeTecnico', { required: 'Nome do técnico é obrigatório' })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Nome completo"
                                />
                                {errors.nomeTecnico && <p className="text-red-400 text-sm mt-1">{errors.nomeTecnico.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    {...register('telefoneTecnico')}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="(47) 99999-9999"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    {...register('emailTecnico')}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Atletas */}
                    <section className="mb-10">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-purple-500">
                            <h2 className="text-3xl font-bold uppercase tracking-wider">
                                Atletas
                            </h2>
                            <button
                                type="button"
                                onClick={() => append({ nome: '', tipoDocumento: 'cpf', numeroDocumento: '', dataNascimento: '', posicao: '', numeroJogador: '' })}
                                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors font-semibold"
                            >
                                + Adicionar Atleta
                            </button>
                        </div>

                        {fields.map((field, index) => {
                            const tipoDocumento = watch(`atletas.${index}.tipoDocumento`);
                            
                            return (
                            <div key={field.id} className="bg-gray-700/50 p-6 rounded-lg mb-6 border border-gray-600">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-purple-400">Atleta #{index + 1}</h3>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-400 hover:text-red-300 font-semibold"
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            {...register(`atletas.${index}.nome`, { required: 'Nome é obrigatório' })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nome completo da atleta"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Tipo de Documento *
                                        </label>
                                        <select
                                            {...register(`atletas.${index}.tipoDocumento`, { required: 'Tipo de documento é obrigatório' })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="cpf">CPF</option>
                                            <option value="rg">RG</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            {tipoDocumento === 'cpf' ? 'CPF' : 'RG'} *
                                        </label>
                                        <input
                                            type="text"
                                            {...register(`atletas.${index}.numeroDocumento`, { 
                                                required: 'Documento é obrigatório',
                                                onChange: (e) => {
                                                    const tipo = watch(`atletas.${index}.tipoDocumento`);
                                                    e.target.value = tipo === 'cpf' 
                                                        ? applyCpfMask(e.target.value)
                                                        : applyRgMask(e.target.value);
                                                }
                                            })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder={tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000-0'}
                                            maxLength={tipoDocumento === 'cpf' ? 14 : 12}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Data de Nascimento *
                                        </label>
                                        <input
                                            type="date"
                                            {...register(`atletas.${index}.dataNascimento`, { required: 'Data de nascimento é obrigatória' })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Posição *
                                        </label>
                                        <select
                                            {...register(`atletas.${index}.posicao`, { required: 'Posição é obrigatória' })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Levantador(a)">Levantador(a)</option>
                                            <option value="Líbero">Líbero</option>
                                            <option value="Ponteiro(a)">Ponteiro(a)</option>
                                            <option value="Oposto(a)">Oposto(a)</option>
                                            <option value="Central">Central</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Número do Jogador *
                                        </label>
                                        <input
                                            type="text"
                                            {...register(`atletas.${index}.numeroJogador`, { required: 'Número é obrigatório' })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Ex: 10"
                                        />
                                    </div>
                                </div>
                            </div>
                        )})}
                    </section>

                    {/* Submit Button */}
                    <div className="text-center pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold uppercase text-lg px-12 py-4 rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Inscrição'}
                        </button>
                        <p className="text-gray-400 text-sm mt-4">
                            * Campos obrigatórios
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
