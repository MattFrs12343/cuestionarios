const clean = value => String(value ?? '').trim();
export const normalizeDocument = value => clean(value).normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const normalizeName = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ');
export const dateOnly = value => clean(value).slice(0, 10);

export function clinicalRecord(row, module) {
    return {
        key: `${module.key}:${row.id}`, id: row.id, moduleKey: module.key,
        slug: module.slug, type: module.label, color: module.color,
        name: clean(row.nome_completo || row.nome) || 'Nome não informado',
        document: clean(row.rg_ou_cpf || row.rg), birthDate: dateOnly(row.data_nascimento),
        sex: clean(row.sexo), clinic: clean(row.clinica),
        examDate: dateOnly(row.data_exame), createdAt: clean(row.created_at),
        creator: row.creator?.name || '', evaluator: row.nome_avaliador || row.examinador || '',
        url: `/questionnaires/${module.slug}/${row.id}`,
    };
}

// Work only with records already authorized and returned by existing module routes.
// Never match by name alone; ambiguous identifiers remain separate.
export function groupPatients(input) {
    const records = [...new Map(input.map(record => [record.key, record])).values()];
    const groups = new Map();
    const make = (key, identity) => ({ key, identity, records: [] });
    const add = (key, identity, record) => {
        if (!groups.has(key)) groups.set(key, make(key, identity));
        groups.get(key).records.push(record);
    };
    const documentBirths = new Map();
    records.forEach(record => {
        const doc = normalizeDocument(record.document);
        if (doc && record.birthDate) {
            if (!documentBirths.has(doc)) documentBirths.set(doc, new Set());
            documentBirths.get(doc).add(record.birthDate);
        }
    });
    records.filter(record => normalizeDocument(record.document)).forEach(record => {
        const doc = normalizeDocument(record.document);
        const dates = documentBirths.get(doc);
        const birth = record.birthDate || (dates?.size === 1 ? [...dates][0] : 'unknown');
        add(`document:${doc}:${birth}`, 'document', record);
    });
    const aliases = new Map();
    groups.forEach(group => group.records.forEach(record => {
        if (!record.birthDate) return;
        const alias = `${normalizeName(record.name)}:${record.birthDate}`;
        if (!aliases.has(alias)) aliases.set(alias, new Set());
        aliases.get(alias).add(group.key);
    }));
    records.filter(record => !normalizeDocument(record.document)).forEach(record => {
        if (!record.birthDate || !normalizeName(record.name) || record.name === 'Nome não informado') {
            add(`record:${record.key}`, 'insufficient', record); return;
        }
        const alias = `${normalizeName(record.name)}:${record.birthDate}`;
        const matches = aliases.get(alias);
        if (matches?.size === 1) add([...matches][0], 'document', record);
        else if (matches?.size > 1) add(`record:${record.key}`, 'ambiguous', record);
        else add(`name-birth:${alias}`, 'name-birth', record);
    });
    return [...groups.values()].map(group => {
        group.records.sort((a, b) => (b.examDate || b.createdAt).localeCompare(a.examDate || a.createdAt));
        const representative = group.records.find(record => normalizeDocument(record.document)) || group.records[0];
        return {
            ...group, name: representative.name, document: representative.document,
            birthDate: representative.birthDate || group.records.find(record => record.birthDate)?.birthDate || '',
            sex: representative.sex, lastExamDate: group.records[0].examDate,
            lastType: group.records[0].type, types: [...new Set(group.records.map(record => record.type))],
            clinics: [...new Set(group.records.map(record => record.clinic).filter(Boolean))],
        };
    }).sort((a, b) => (b.lastExamDate || '').localeCompare(a.lastExamDate || '') || a.name.localeCompare(b.name));
}
