import Form from './Form';
export const SECTIONS = [
    { id: 'dados', label: 'Dados Básicos' },
    { id: 'instrucoes', label: 'Instruções' },
    { id: 'avaliacao', label: 'Avaliação' },
    { id: 'arquivos', label: 'Arquivos e Assinatura' },
];
export default function Create(props) { return <Form {...props} sections={SECTIONS} />; }
