import { 
    ClipboardDocumentListIcon, 
    UserGroupIcon, 
    ChartBarIcon, 
    ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function InfoPanel() {
    const features = [
        {
            icon: ClipboardDocumentListIcon,
            title: 'Gestão de Questionários',
            description: 'Crie e administre questionários médicos personalizados'
        },
        {
            icon: UserGroupIcon,
            title: 'Trabalho em Equipe',
            description: 'Colabore com sua equipe médica em tempo real'
        },
    ];

    return (
        <aside 
            className="hidden md:flex md:flex-col md:justify-center md:items-center md:col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 md:p-8 lg:p-12 rounded-l-xl sm:rounded-l-2xl animate-fade-in"
            aria-label="Informações do sistema"
        >
            <div className="max-w-md text-white space-y-4 md:space-y-6 lg:space-y-8">
                {/* Logo y Título del Sistema */}
                <div className="text-center space-y-3 md:space-y-4 lg:space-y-6 animate-slide-down">
                    {/* Logo Profesional */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div 
                                className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl border border-white/20"
                                role="img"
                                aria-label="Logo do Sistema de Gestão de Questionários Médicos"
                            >
                                <svg 
                                    className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                    />
                                </svg>
                            </div>
                            {/* Decorative ring */}
                            <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-white/5 animate-pulse" aria-hidden="true"></div>
                        </div>
                    </div>
                    
                    {/* Título Descriptivo del Sistema */}
                    <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 leading-tight px-2">
                            Sistema de Gestão de Questionários Médicos
                        </h1>
                        <p className="text-blue-100 text-sm md:text-base lg:text-lg font-medium px-2">
                            Plataforma profissional para a gestão integral de questionários médicos
                        </p>                        
                    </div>
                </div>

                {/* Lista de Características */}
                <nav aria-label="Características do sistema">
                    <ul className="space-y-2 md:space-y-3 lg:space-y-4">
                        {features.map((feature, index) => (
                            <li 
                                key={index}
                                className="flex items-start space-x-2 md:space-x-3 lg:space-x-4 p-2 md:p-3 lg:p-4 bg-white/5 backdrop-blur-sm rounded-md md:rounded-lg hover:bg-white/10 transition-all duration-300 animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex-shrink-0" aria-hidden="true">
                                    <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white/10 rounded-md md:rounded-lg flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-200" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-white mb-0.5 md:mb-1 text-sm md:text-base">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-blue-100 leading-snug">
                                        {feature.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer del Panel con Marca */}
                <div className="pt-4 md:pt-6 lg:pt-8 space-y-2 md:space-y-3 lg:space-y-4">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-1.5 md:space-x-2 text-blue-200 text-xs md:text-sm font-medium">
                            <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                            <span>Plataforma segura e confiável</span>
                        </div>
                    </div>
                    <div className="text-center text-blue-300 text-[10px] md:text-xs px-2">
                        <p>Conformidade com padrões médicos e proteção de dados</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
