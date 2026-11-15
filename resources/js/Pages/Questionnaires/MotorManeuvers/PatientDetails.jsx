import { formatDateShort } from '@/Utils/dateFormatter';
export default function PatientDetails({ questionnaire: q }) {
    return <dl className="grid grid-cols-2 gap-4">{[
        ['Nome', q.nome_completo], ['RG ou CPF', q.rg_ou_cpf],
        ['Nascimento', formatDateShort(q.data_nascimento)], ['Idade', q.idade],
        ['Sexo', q.sexo], ['Data do exame', formatDateShort(q.data_exame)],
        ['Clínica', q.clinica], ['Equipe', q.team?.name],
        ['Avaliador', q.nome_avaliador], ['CID', q.cid],
    ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="font-semibold">{label}</dt><dd className="mt-1 break-words">{value || 'Não informado'}</dd></div>)}</dl>;
}
