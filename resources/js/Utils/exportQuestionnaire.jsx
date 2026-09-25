import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import QuestionnaireExportView from '@/Components/QuestionnaireExportView';

export async function exportQuestionnaireToJPG(questionnaire, type, fileNamePrefix, patientName) {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);

    const root = createRoot(tempContainer);

    await new Promise((resolve) => {
        root.render(
            <QuestionnaireExportView questionnaire={questionnaire} type={type} />
        );
        setTimeout(resolve, 1000);
    });

    const canvas = await html2canvas(tempContainer.firstChild, {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        ignoreElements: (element) => element.tagName === 'IMG' && element.src.includes('storage'),
    });

    await new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const fileName = `${fileNamePrefix}_${(patientName || 'questionario').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            root.unmount();
            document.body.removeChild(tempContainer);
            resolve();
        }, 'image/jpeg', 0.95);
    });
}
