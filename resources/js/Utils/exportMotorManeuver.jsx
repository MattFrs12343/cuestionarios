import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import html2canvas from 'html2canvas';
import Export from '@/Pages/Questionnaires/MotorManeuvers/Export';
import { definitions } from '@/Pages/Questionnaires/MotorManeuvers/definitions';

// These new forms can span more than one A4 height (especially Mingazzini).
// Capture their full natural height, preserving every answer and comment.
export async function exportQuestionnaireToJPG(questionnaire, type, fileNamePrefix, patientName) {
    const definition = Object.values(definitions).find(item => item.slug === type);
    if (!definition) throw new Error('Tipo de questionário não suportado.');
    const container = document.createElement('div');
    Object.assign(container.style, { position: 'absolute', left: '-9999px', top: '0', width: '794px' });
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
        flushSync(() => root.render(<Export questionnaire={questionnaire} definition={definition} />));
        await document.fonts.ready;
        await Promise.all(Array.from(container.querySelectorAll('img')).map(img => img.decode().catch(() => {})));
        const canvas = await html2canvas(container.firstChild, { scale: 2, useCORS: false, allowTaint: false, logging: false, backgroundColor: '#fff', windowWidth: 794 });
        const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Não foi possível gerar a imagem.')), 'image/jpeg', 0.95));
        const url = URL.createObjectURL(blob);
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileNamePrefix}_${(patientName || 'questionario').replace(/[<>:"/\\|?*\s]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.jpg`;
            document.body.appendChild(link); link.click(); link.remove();
        } finally { URL.revokeObjectURL(url); }
    } finally { root.unmount(); container.remove(); }
}
