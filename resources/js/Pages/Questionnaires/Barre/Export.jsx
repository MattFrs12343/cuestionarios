import { PatientDetails, Results } from './Content';
export default function Export({ questionnaire: q, assinaturaPacienteUrl }) {
    return <div style={{ width: '210mm', minHeight: '297mm', padding: '10mm', fontFamily: 'Arial, sans-serif', color: '#111827', background: '#fff', fontSize: '11px' }}>
        <header className="mb-4 bg-teal-700 px-3 py-3 text-white"><h1 className="text-base font-bold">Manobra de Barré</h1><p>Avaliação neurológica dos membros inferiores · {q.nome_completo}</p></header>
        <h2 className="mb-3 bg-gray-100 p-2 font-bold">Dados Básicos</h2><PatientDetails questionnaire={q} />
        <h2 className="mb-3 mt-5 bg-gray-100 p-2 font-bold">Avaliação dos Membros Inferiores</h2><Results questionnaire={q} compact />
        {q.comentario && <section className="mt-4"><h2 className="font-bold">Comentários e observações do avaliador</h2><p className="mt-1 whitespace-pre-wrap break-words">{q.comentario}</p></section>}
        {assinaturaPacienteUrl && <section className="mt-4"><h2 className="font-bold">Assinatura do avaliador</h2><img src={assinaturaPacienteUrl} alt="Assinatura do avaliador" style={{ maxHeight: '80px', maxWidth: '250px' }} /></section>}
        <footer className="mt-4 border-t border-gray-300 pt-2 text-gray-600">{q.last_modified_by}</footer>
    </div>;
}
