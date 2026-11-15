import { QUESTIONNAIRE_ACTIONS as QA } from '@/Components/Questionnaires/presentation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AnexosUploader from '@/Components/AnexosUploader';
import ImageZoomModal from '@/Components/ImageZoomModal';
import { PatientDetails, Results, Instructions } from './Content';

export default function Show({ auth, questionnaire: q, pedidoMedicoUrl, can = {} }) {
    const [image, setImage] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const exportImage = async () => {
        setExporting(true); setExportError('');
        try {
            const { exportQuestionnaireToJPG } = await import('@/Utils/exportQuestionnaire');
            await exportQuestionnaireToJPG(q, 'barre', 'questionario_barre', q.nome_completo);
        } catch { setExportError('Não foi possível exportar. Tente novamente.'); }
        finally { setExporting(false); }
    };
    return <AuthenticatedLayout user={auth.user} header={<h2 className="text-gray-800 dark:text-zinc-200 text-xl font-semibold">Manobra de Barré</h2>}>
        <Head title={`Manobra de Barré — ${q.nome_completo}`} />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <Link href={route('questionnaires.barre.index')} className={QA.neutral}>Voltar</Link>
                {can.edit && <Link href={route('questionnaires.barre.edit', q.id)} className={QA.primary}>Editar</Link>}
                <button type="button" onClick={exportImage} disabled={exporting} className={QA.export}>{exporting ? 'Exportando...' : 'Exportar JPG'}</button>
                {exportError && <p role="alert" className="text-red-700 dark:text-red-300">{exportError}</p>}
            </div>
            <article className="rounded-xl bg-white p-5 text-gray-900 shadow-sm sm:p-8 dark:bg-zinc-700 dark:text-zinc-100">
                <h1 className="break-words text-2xl font-bold">{q.nome_completo}</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">Manobra de Barré · {q.last_modified_by}</p>
                <section className="border-b border-gray-200 py-6 dark:border-zinc-600"><h3 className="mb-5 text-xl font-semibold">Dados Básicos</h3><PatientDetails questionnaire={q} /></section>
                <section className="border-b border-gray-200 py-6 dark:border-zinc-600"><h3 className="mb-5 text-xl font-semibold">Avaliação dos Membros Inferiores</h3><Results questionnaire={q} />{q.comentario && <div className="mt-5"><h4 className="font-semibold">Comentários e observações do avaliador</h4><p className="mt-2 whitespace-pre-wrap break-words">{q.comentario}</p></div>}</section>
                <details className="border-b border-gray-200 py-5 dark:border-zinc-600"><summary className="cursor-pointer font-semibold">Instruções e observações técnicas</summary><div className="mt-4"><Instructions /></div></details>
                <section className="py-6"><h3 className="mb-5 text-xl font-semibold">Arquivos e Assinatura</h3><div className="grid gap-6 sm:grid-cols-2">
                    <div><h4 className="mb-3 font-semibold">Pedido médico</h4>{pedidoMedicoUrl ? <button type="button" className="w-full rounded-md border border-gray-300 p-2" onClick={() => setImage({ src: pedidoMedicoUrl, alt: 'Pedido médico' })}><img src={pedidoMedicoUrl} alt="Pedido médico — ampliar" className="max-h-72 w-full object-contain" /><span className="mt-2 block text-sm">Ampliar pedido médico</span></button> : <p className="text-sm">Nenhum pedido médico anexado.</p>}</div>
                    <div><h4 className="mb-3 font-semibold">Assinatura do avaliador</h4>{q.assinatura_paciente ? <button type="button" className="w-full rounded-md bg-white p-2" onClick={() => setImage({ src: q.assinatura_paciente, alt: 'Assinatura do avaliador' })}><img src={q.assinatura_paciente} alt="Assinatura do avaliador — ampliar" className="max-h-48 w-full object-contain" /></button> : <p className="text-sm">Nenhuma assinatura registrada.</p>}</div>
                </div><div className="mt-6"><AnexosUploader type="barre" id={q.id} existing={q.attachments || []} readOnly /></div></section>
            </article>
        </div>
        <ImageZoomModal isOpen={!!image} onClose={() => setImage(null)} imageSrc={image?.src} imageAlt={image?.alt} />
    </AuthenticatedLayout>;
}
