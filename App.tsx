import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import type { Player, Game, Sponsor } from './types';
import {
    TEAM_NAME,
    TEAM_SLOGAN,
    PLAYERS,
    GAMES,
    SPONSORS,
    InstagramIcon,
    WhatsAppIcon,
    FacebookIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
} from './constants';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `uppercase tracking-wider text-lg lg:text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-orange-500' : 'text-white hover:text-orange-400'
        }`;

    const navLinks = [
        { to: '/', label: 'Início' },
        { to: '/contato', label: 'Contato' },
        { to: '/patrocinadores', label: 'Patrocinadores' },

        // { to: '/sobre', label: 'Sobre Nós' },
    ];

    return (
        <header className="bg-gray-900 bg-opacity-80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-orange-500/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-3xl font-bold uppercase text-white font-teko tracking-widest">{TEAM_NAME.split(' ')[0]} <span className="text-orange-500">{TEAM_NAME.split(' ')[1]}</span></span>
                    </Link>
                    <nav className="hidden lg:flex lg:space-x-8">
                        {navLinks.map(link => <NavLink key={link.to} to={link.to} className={navLinkClass}>{link.label}</NavLink>)}
                    </nav>
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white focus:outline-none"
                            aria-label="Abrir menu"
                            aria-expanded={isMenuOpen}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="lg:hidden bg-gray-800">
                    <nav className="flex flex-col items-center space-y-4 py-4">
                        {navLinks.map(link => <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setIsMenuOpen(false)}>{link.label}</NavLink>)}
                    </nav>
                </div>
            )}
        </header>
    );
};

const PageTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="text-center my-12 md:my-16">
        <h2 className="text-5xl md:text-7xl font-bold uppercase text-white tracking-wider">{title}</h2>
        <p className="text-orange-500 text-xl md:text-2xl font-light tracking-widest">{subtitle}</p>
    </div>
);


const HomePage: React.FC = () => {
    return (
        <div className="space-y-16 md:space-y-24">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('./hold.jpg')` }}>
                <div className="z-10 px-4">
                    <div className="mb-4 flex justify-center items-center gap-4 flex-wrap">
                        <span className="bg-orange-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider">Naipes Feminino</span>
                        <span className="bg-orange-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider">Naipes Masculino</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold uppercase text-white tracking-widest font-teko" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>{TEAM_NAME}</h1>
                    <p className="mt-2 text-xl md:text-3xl font-medium text-orange-500 tracking-wider font-teko" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>{TEAM_SLOGAN}</p>
                    <p className="mt-6 text-lg md:text-2xl text-white italic font-light" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>"A paixão é um pré-requisito para quem quer vencer."</p>
                </div>
            </section>

            {/* Instagram CTA */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <InstagramIcon className="w-16 h-16 md:w-20 md:h-20 text-white" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold uppercase text-white tracking-wider mb-4">Siga-nos no Instagram</h2>
                    <p className="text-xl md:text-2xl text-white/90 mb-8">@ultravolei_joinville</p>
                    <a
                        href="https://www.instagram.com/ultravolei_joinville"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-orange-500 font-bold uppercase text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Seguir Agora
                    </a>
                </div>
            </section>

            {/* Instagram Feed */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-center mb-8">Últimas Publicações</h3>
                <iframe
                    src="https://www.juicer.io/api/feeds/ultravolei_joinville/iframe"
                    frameBorder="0"
                    width="100%"
                    height="1000"
                    style={{ display: 'block', margin: '0 auto' }}
                    title="Instagram Feed da UltraVôlei Joinville"
                ></iframe>
            </section>

            {/* Sponsors Bar */}
            <section className="py-12 bg-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-4xl font-bold uppercase tracking-wider mb-8">Nossos Patrocinadores</h3>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {SPONSORS.map(sponsor => (
                            <a key={sponsor.id} href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" title={sponsor.name}>
                                <img src={sponsor.logoUrl} alt={sponsor.name} className="h-16 filter grayscale hover:grayscale-0 transition-all duration-300" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const AboutPage: React.FC = () => {
    const malePlayers = PLAYERS.filter(p => p.gender === 'M');
    const femalePlayers = PLAYERS.filter(p => p.gender === 'F');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageTitle title="Sobre Nós" subtitle="Conheça a nossa história e elenco" />

            {/* Our History */}
            <section className="max-w-4xl mx-auto text-center mb-16">
                <h3 className="text-4xl font-semibold uppercase tracking-wider mb-4 text-orange-500">Nossa História</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                    Fundado em 2020 por um grupo de amigos apaixonados por vôlei, o Ultra Vôlei Joinville nasceu do desejo de competir e fortalecer o esporte amador na cidade. O que começou com treinos descontraídos rapidamente evoluiu para uma equipe organizada, participando de ligas e torneios locais com muita garra e dedicação. Com times feminino e masculino, nosso lema é a união dentro e fora de quadra, sempre buscando o nosso melhor e representando Joinville com orgulho.
                </p>
            </section>

            {/* Male Team */}
            {/* <section className="mb-16">
                <div className="flex items-center justify-center mb-8 gap-4">
                    <div className="h-1 flex-grow bg-gradient-to-r from-transparent to-blue-500 max-w-xs"></div>
                    <h3 className="text-4xl text-center font-semibold uppercase tracking-wider text-blue-400">Time Masculino 2024</h3>
                    <div className="h-1 flex-grow bg-gradient-to-l from-transparent to-blue-500 max-w-xs"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {malePlayers.map((player: Player) => (
                        <div key={player.id} className="text-center group">
                            <div className="relative overflow-hidden rounded-lg mb-2 border-2 border-blue-500/30 group-hover:border-blue-500">
                                <img src={player.imageUrl} alt={player.name} className="w-full h-auto object-cover aspect-square rounded-lg transition-transform duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-blue-900 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <p className="text-white text-lg font-bold">{player.position}</p>
                                </div>
                            </div>
                            <h4 className="text-lg font-bold tracking-wide">{player.name}</h4>
                        </div>
                    ))}
                </div>
            </section> */}
        </div>
    );
};

const SchedulePage: React.FC = () => {
    const upcomingGames = GAMES.filter(g => g.isUpcoming);
    const pastGames = GAMES.filter(g => !g.isUpcoming);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageTitle title="Agenda & Resultados" subtitle="Fique por dentro dos nossos jogos" />

            {/* Upcoming Games */}
            <section className="mb-16">
                <h3 className="text-4xl text-center font-semibold uppercase tracking-wider mb-8 text-orange-500">Próximos Jogos</h3>
                <div className="space-y-6">
                    {upcomingGames.length > 0 ? upcomingGames.map((game: Game) => (
                        <div key={game.id} className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-gray-400">{game.date}</p>
                                <p className="text-3xl font-bold">UltraVôlei <span className="text-orange-500 mx-2">vs</span> {game.opponent}</p>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center text-left md:text-right space-y-2 md:space-y-0 md:space-x-6 text-gray-300">
                                <div className="flex items-center"><ClockIcon className="w-5 h-5 mr-2 text-orange-500" />{game.time}</div>
                                <div className="flex items-center"><MapPinIcon className="w-5 h-5 mr-2 text-orange-500" />{game.location}</div>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-400">Nenhum jogo agendado no momento.</p>}
                </div>
            </section>

            {/* Past Results */}
            <section>
                <h3 className="text-4xl text-center font-semibold uppercase tracking-wider mb-8 text-orange-500">Resultados Passados</h3>
                <div className="space-y-4">
                    {pastGames.map((game: Game) => (
                        <div key={game.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className={`flex items-center justify-center h-8 w-8 rounded-full font-bold ${game.result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{game.result}</span>
                                <div>
                                    <p className="font-semibold">vs {game.opponent}</p>
                                    <p className="text-sm text-gray-400">{game.date}</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{game.score}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const SponsorsPage: React.FC = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageTitle title="Nossos Patrocinadores" subtitle="Obrigado por apoiarem o esporte" />
        <section className="mb-16">
            <div className="flex flex-wrap justify-center items-center gap-12">
                {SPONSORS.map((sponsor: Sponsor) => (
                    <a key={sponsor.id} href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="block bg-gray-800 p-6 rounded-lg transition-transform hover:scale-105 duration-300 shadow-lg" title={sponsor.name}>
                        <img src={sponsor.logoUrl} alt={sponsor.name} className="h-24 max-w-[200px] object-contain" />
                    </a>
                ))}
            </div>
        </section>
        <div className="mt-20">
            <h3 className="text-4xl font-bold tracking-wide text-center mb-4">Quer ver sua marca aqui?</h3>
            <p className="text-lg text-gray-300 text-center mb-8">Faça parte da nossa história e ajude a impulsionar o vôlei amador em Joinville.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Feminino */}
                <div className="bg-gray-800 p-8 rounded-lg text-center border-t-4 border-pink-500">
                    <h4 className="text-2xl font-bold text-pink-400 mb-4">Time Feminino</h4>
                    <p className="text-gray-300 mb-6">Patrocine o time feminino e apoie o vôlei feminino em Joinville</p>
                    <a
                        href="https://api.whatsapp.com/send/?phone=5547996955774"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-pink-500 text-white font-bold uppercase text-lg px-8 py-3 rounded-md hover:bg-pink-600 transition-colors duration-300"
                    >
                        <WhatsAppIcon className="w-6 h-6" />
                        Seja Patrocinador
                    </a>
                </div>

                {/* Masculino */}
                <div className="bg-gray-800 p-8 rounded-lg text-center border-t-4 border-blue-500">
                    <h4 className="text-2xl font-bold text-blue-400 mb-4">Time Masculino</h4>
                    <p className="text-gray-300 mb-6">Patrocine o time masculino e apoie o vôlei masculino em Joinville</p>
                    <a
                        href="https://api.whatsapp.com/send/?phone=5547991917733"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white font-bold uppercase text-lg px-8 py-3 rounded-md hover:bg-blue-600 transition-colors duration-300"
                    >
                        <WhatsAppIcon className="w-6 h-6" />
                        Seja Patrocinador
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would handle form submission here.
        console.log(formData);
        setSubmitted(true);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageTitle title="Contato" subtitle="Fale conosco" />

            {/* WhatsApp Contacts Grid */}
            <div className="max-w-6xl mx-auto mb-16">
                <h3 className="text-3xl font-semibold uppercase tracking-wider mb-8 text-center text-orange-500">Contatos Diretos</h3>

                {/* Ação Social - Full Width */}
                <div className="mb-6">
                    <a href="https://api.whatsapp.com/send/?phone=5547996660160" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-orange-500">
                        <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-orange-500">Ação Social</p>
                            <p className="text-sm text-gray-400">Faça uma Ação Social</p>
                            <p className="text-sm text-gray-400">(47) 99666-0160</p>
                        </div>
                    </a>
                </div>

                {/* Two Columns: Female (Left) and Male (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Female Column */}
                    <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-pink-400 text-center mb-4">Time Feminino</h4>

                        {/* Amistosos/Torneios FEMININO */}
                        <a href="https://api.whatsapp.com/send/?phone=5547988055031" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-pink-500">
                            <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-pink-400">Amistosos/Torneios</p>
                                <p className="text-sm text-gray-400">Time Feminino</p>
                                <p className="text-sm text-gray-400">(47) 98805-5031</p>
                            </div>
                        </a>

                        {/* Seletivas FEMININO */}
                        <a href="https://api.whatsapp.com/send/?phone=5547996955774" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-pink-500">
                            <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-pink-400">Seletivas</p>
                                <p className="text-sm text-gray-400">Time Feminino</p>
                                <p className="text-sm text-gray-400">(47) 99695-5774</p>
                            </div>
                        </a>

                        {/* Patrocinador FEMININO */}
                        <a href="https://api.whatsapp.com/send/?phone=5547996955774" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-pink-500">
                            <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-pink-400">Seja Patrocinador</p>
                                <p className="text-sm text-gray-400">Time Feminino</p>
                                <p className="text-sm text-gray-400">(47) 99695-5774</p>
                            </div>
                        </a>
                    </div>

                    {/* Male Column */}
                    <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-blue-400 text-center mb-4">Time Masculino</h4>

                        {/* Amistosos/Torneios MASCULINO */}
                        <a href="https://api.whatsapp.com/send/?phone=5547991917733" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-blue-500">
                            <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-blue-400">Amistosos/Torneios</p>
                                <p className="text-sm text-gray-400">Time Masculino</p>
                                <p className="text-sm text-gray-400">(47) 99191-7733</p>
                            </div>
                        </a>

                        {/* Seletivas MASCULINO */}
                        <a href="https://api.whatsapp.com/send/?phone=5547991136252" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-blue-500">
                            <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-blue-400">Seletivas</p>
                                <p className="text-sm text-gray-400">Time Masculino</p>
                                <p className="text-sm text-gray-400">(47) 99113-6252</p>
                            </div>
                        </a>

                        {/* Patrocinador MASCULINO */}
                        <a href="https://api.whatsapp.com/send/?phone=5547991917733" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-blue-500">
                            <WhatsAppIcon className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-blue-400">Seja Patrocinador</p>
                                <p className="text-sm text-gray-400">Time Masculino</p>
                                <p className="text-sm text-gray-400">(47) 99191-7733</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-semibold uppercase tracking-wider mb-8 text-center text-orange-500">Redes Sociais</h3>
                <div className="space-y-4">
                    <a href="https://www.instagram.com/ultravolei_joinville" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <InstagramIcon className="w-12 h-12 text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold">Instagram</p>
                            <p className="text-lg text-gray-400">@ultravolei_joinville</p>
                        </div>
                    </a>
                    <a href="https://www.facebook.com/ultravolei" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <FacebookIcon className="w-12 h-12 text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold">Facebook</p>
                            <p className="text-lg text-gray-400">Ultra Vôlei Joinville</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-black mt-16 md:mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
            <div className="flex justify-center space-x-6 mb-4">
                <a href="https://www.instagram.com/ultravolei_joinville" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors" aria-label="Instagram"><InstagramIcon className="w-7 h-7" /></a>
                <a href="https://wa.me/5547999999999" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors" aria-label="WhatsApp"><WhatsAppIcon className="w-7 h-7" /></a>
            </div>
            <p>&copy; {new Date().getFullYear()} {TEAM_NAME}. Todos os direitos reservados.</p>
        </div>
    </footer>
);


const App: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/contato" element={<ContactPage />} />
                    <Route path="/patrocinadores" element={<SponsorsPage />} />
                    <Route path="/sobre" element={<AboutPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

export default App;
