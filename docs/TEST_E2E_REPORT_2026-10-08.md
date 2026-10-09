# Reporte E2E — Anexos, Histórico, Autosave, Mayúsculas

**Fecha:** 2026-10-08
**Entorno:** local Windows, PHP 8.4.24 (`C:\php84\php.exe`), Laravel 11.56, Node v22.20.0, Vite
**Alcance:** verificación de las 4 features de esta iteración + regresión general
**Despliegue:** NO realizado (pendiente de aprobación). Ojo: en producción la migración `2026_10_05_000000_create_dinamometria_mmiis_table` no está registrada → migrar con `php artisan migrate --path=database/migrations/2026_10_05_000000_create_dinamometria_mmiis_table.php`.

---

## 1. Estado final

| Verificación | Resultado |
|---|---|
| Suite PHPUnit completa (`vendor/bin/phpunit`) | **188/188 OK — 1088 assertions, 0 errores, 0 fallos** |
| Baseline al inicio de la iteración | 188 tests: **13 errors + 7 failures** |
| Build de frontend (`npm run build`) | **OK** (`✓ built in 11.29s`) |
| Sintaxis PHP (`php -l`) en todos los archivos PHP tocados | OK |
| Chequeos estáticos (restos de debug, temporales, imports) | OK (ver §5) |

---

## 2. Checklist por módulo/área

### 2.1 Anexos (cámara + edición opcional)
| Paso | Estado | Evidencia |
|---|---|---|
| Input de cámara con `capture="environment"` explícito | OK | `AnexosUploader.jsx:222-229` |
| Input de galería con `multiple` | OK | `AnexosUploader.jsx:230-237` |
| Modal de edición (recortar, rotar 90°, zoom, reset, "Usar sin editar") | OK | `ImageEditorModal.jsx` |
| Selección múltiple: cola secuencial (un archivo a la vez por el editor) | OK (bug corregido, §3.1) | `queueRef` + `advanceQueue()` |
| Límite de 5 anexos + compresión previa | OK | `AnexosUploader.jsx` |
| Sin restos del flujo viejo (`window._anexos*`) | OK | grep sin resultados |

### 2.2 Histórico
| Paso | Estado | Evidencia |
|---|---|---|
| Botón "Histórico" junto al buscador en el listado | OK | `Questionnaires/Index.jsx` (DashboardHeader) |
| Página `History/Index` sin cambios | OK | sin diff |

### 2.3 Autosave (piloto Electroneuromiografia Facial)
| Paso | Estado | Evidencia |
|---|---|---|
| Hook `useDraftAutosave` (debounce 800ms, TTL 30d, key por usuario/equipo/tipo/modo) | OK | `resources/js/Hooks/useDraftAutosave.js` |
| Banner de restauración "Rascunho encontrado" (Continuar/Descartar) | OK | `resources/js/Components/DraftRestoreBanner.jsx` |
| Integrado en `ElectroneuromiografiaFacial/Create.jsx` y `Edit.jsx` | OK (8 referencias) | hook + banner + `onSuccess: draft.clear()` |
| Sin bucle infinito de re-render (bug corregido, §3.2) | OK | `pendingRef` en vez de estado |
| Archivos (File/Blob) excluidos del snapshot | OK | `useDraftAutosave.js` |

### 2.4 Mayúsculas en texto libre
| Paso | Estado | Evidencia |
|---|---|---|
| Utilidad frontend `upperAll` (NFC + `toUpperCase`, omite File/Blob/base64/URLs/>5000 chars) | OK | `resources/js/Utils/uppercase.js` (68 campos) |
| `transform(upperAll)` en los 25 Create/Edit de cuestionarios | OK **25/25** | grep `transform(upperAll)` |
| Trait backend `UppercasesTextAttributes` (`saving` hook, `mb_strtoupper`, mismas guardas) | OK | `app/Models/Concerns/UppercasesTextAttributes.php` |
| Trait aplicado a los 12 modelos de cuestionario | OK **12/12** | grep |
| Campos con validación `in:`/select NO convertidos (evita romper `<select>` y comparaciones `=== 'Outro'`) | OK | whitelist |
| Búsquedas case-insensitive intactas | OK | `QuestionnaireIndexFilterTest` usa `strcasecmp` |
| Datos existentes NO migrados (decisión A2a) | OK | sin migración de datos |

### 2.5 Visibilidad de campos / equipos
| Paso | Estado | Evidencia |
|---|---|---|
| `Potencial/Index` y `ElectroneuromiografiaFacial/Index` reciben `fieldVisibility` | OK (bug corregido, §3.3) | controllers `index()` |
| `QuestionnaireFieldVisibilityTest` | OK 10/10 | PHPUnit |
| `QuestionnaireFieldsTest` (Unit) | OK 12/12 | PHPUnit |

### 2.6 Anexos de sistema / export / multitenancy / usuarios
| Área | Estado | Evidencia |
|---|---|---|
| `AttachmentServingTest` (pedido médico autenticado, 11 tipos) | OK 47/47 | PHPUnit |
| `TenantIsolationTest` | OK 58/58 | PHPUnit |
| `PricingClassificationTest` | OK 5/5 | PHPUnit |
| `TeamAndUserProvisioningTest` | OK 22/22 | PHPUnit |
| Suite completa | OK 188/188 | PHPUnit |

---

## 3. Bugs hallados y corregidos en esta iteración

### 3.1 [ALTA] Selección múltiple de anexos: el editor colgaba (spinner eterno)
- **Archivo:** `resources/js/Components/AnexosUploader.jsx`
- **Causa:** el flujo multiarchivo dejaba la promesa de `handleSelect` pendiente esperando callbacks globales `window._anexosEditorApply/Skip/Close` que **nadie invocaba** → `Promise.all` nunca resolvía → `busy` quedaba `true` y la subida nunca completaba.
- **Fix:** cola secuencial con `queueRef` + `advanceQueue()`; `handleEditorApply`/`handleEditorSkip` avanzan la cola, `handleEditorClose` la limpia.
- **Verificación:** build OK; sin referencias a `window._anexos*`.

### 3.2 [ALTA] Autosave en bucle infinito de re-render
- **Archivo:** `resources/js/Hooks/useDraftAutosave.js`
- **Causa:** `flush()` hacía `setPendingDraft(payload)` con dependencias `[draftKey, enabled, data, extra, version]` → actualizaba estado → re-render → nuevo `flush` → bucle.
- **Fix:** el payload pendiente vive en `pendingRef` (ref), sin re-render; refs actualizadas también en mount/restore/discard/clear.
- **Verificación:** build OK; suite verde.

### 3.3 [ALTA] `index` de Potencial y Facial no pasaba `fieldVisibility`
- **Archivos:** `app/Http/Controllers/Questionnaires/PotencialController.php`, `app/Http/Controllers/Questionnaires/ElectroneuromiografiaFacialController.php`
- **Causa:** `Questionnaires/Potencial/Index.jsx` y `Questionnaires/ElectroneuromiografiaFacial/Index.jsx` leen `fieldVisibility` (vía `useFieldVisibility`), pero el `index()` solo lo pasaban `create/show/edit` → en el listado se intentaba renderizar/ocultar campos sin la prop (columnas ocultas del equipo "Azul" no respetadas).
- **Fix:** `'fieldVisibility' => QuestionnaireFields::forInertia($team, self::SLUG)` en ambos `index()`.
- **Verificación:** `QuestionnaireFieldVisibilityTest` 10/10 (incluye `index` de ambas vistas).

### 3.4 [MEDIA] `DinamometriaMmii` no exponía `pedidoMedicoUrl`
- **Archivo:** `app/Http/Controllers/Questionnaires/DinamometriaMmiiController.php`
- **Causa:** el nuevo cuestionario no pasaba la prop `pedidoMedicoUrl` en `show`/`edit` (todos los demás tipos sí) → el contrato de la pantalla de detalle roto (2 tests en error: `Undefined array key "pedidoMedicoUrl"`).
- **Fix:** prop agregada en `show()` y `edit()` con `route('pedidos-medicos.show', ['type' => 'dinamometria-mmii', ...])`.
- **Pendiente (producto):** `DinamometriaMmii/Show.jsx` y `Edit.jsx` **no referencian** `pedidoMedicoUrl` → la prop existe pero la UI aún no muestra el enlace/imagen del pedido médico.

### 3.5 [MEDIA] Faltaba `DinamometriaMmiiFactory`
- **Archivo:** `database/Factory/DinamometriaMmiiFactory.php` (nuevo)
- **Causa:** `AttachmentServingTest` (×4) y `TenantIsolationTest` (×5) instancian el modelo por factory → `Class "Database\Factories\DinamometriaMmiiFactory" not found` (9 errors).
- **Fix:** factory con las columnas NOT NULL (`clinica`, `data_exame`, `nome_completo`, `data_nascimento`, `sexo`).
- **Verificación:** ambos tests 100% OK.

### 3.6 [MEDIA] Precio clasificado mal para "Electroneuromiografia Facial"
- **Archivo:** `config/questionnaires.php`
- **Causa:** al agregar la sección "Observações" el formulario pasó a **4 secciones**, pero el bloque `precio` seguía declarando `3` → `PricingClassificationTest` fallaba y `php artisan laudos:clasificar` clasificaría mal el laudo.
- **Fix:** `['secciones' => 4, 'nivel' => 'C', 'bs' => 250]` (nivel/precio sin cambio: 3-4 secciones → C).
- **Verificación:** `PricingClassificationTest` 5/5.

### 3.7 [BAJA] Tests con nombres legacy del renombre Eletro→Electro
- **Archivos:** `tests/Feature/QuestionnaireFieldVisibilityTest.php` (15 ocurrencias), `tests/Unit/QuestionnaireFieldsTest.php` (const `FACIAL`)
- **Causa:** rutas `questionnaires.eletroneuromiografia-facial.*`, clase `EletroneuromiografiaFacial`, módulo `eletroneuromiografia_facial` y slug `eletroneuro…` ya no existen en producción (renombrados en `e2766de`) → 4 errors + 4 failures. Como el slug del config es `electroneuromiografia-facial` y el test pasaba `eletroneuromiografia-facial`, la visibilidad "fail closed" no aplicaba y el test fallaba.
- **Fix:** renombre a los nombres vigentes en ambos archivos.
- **Nota:** las rutas viejas siguen disponibles por redirects en `routes/web.php` (solo GET) — el backend está bien, era deuda de tests.

### 3.8 [BAJA] Test "last admin" con premisa inconsistente
- **Archivo:** `tests/Feature/TeamAndUserProvisioningTest.php:279`
- **Causa:** el setup adjuntaba al actor al equipo B **y** el actor ya es `administrador` (rol global Spatie) → el equipo B seguía teniendo admin (el actor) → borrar al objetivo era legítimo (302 OK) y el test esperaba 403.
- **Fix:** setup corregido para el escenario real: el objetivo pasa a ser miembro de A (acceso del actor) y único admin de B (al que el actor **no** pertenece) → 403 correcto.
- **Verificación:** archivo 22/22 OK.

---

## 4. Bugs/anomalías preexistentes NO corregidos

| # | Severidad | Detalle |
|---|---|---|
| 1 | Alta (deploy) | La migración `2026_10_05_create_dinamometria_mmiis_table` **no está registrada en producción** → al desplegar hay que migrar con `--path=database/migrations/2026_10_05_000000_create_dinamometria_mmiis_table.php`. |
| 2 | Media (producto) | `DinamometriaMmii/Show.jsx` y `Edit.jsx` no muestran el pedido médico (la prop `pedidoMedicoUrl` ahora llega, pero no hay UI que la use). |
| 3 | Baja | Solo `Potencial/Index.jsx` y `ElectroneuromiografiaFacial/Index.jsx` consumen `fieldVisibility`; el resto de los listados no ocultan columnas por equipo (hoy ningún otro controller la pasa en `index`). Si en el futuro se configuran `hidden`/`exclusive` para otro cuestionario, habrá que agregar la prop en su controller + vista. |
| 4 | Baja | No existe tooling E2E de navegador (sin Playwright/Cypress/Puppeteer): lo ejecutado aquí es suite de integración HTTP + build + chequeos estáticos. |

---

## 5. Chequeos estáticos ejecutados

- Sin restos del flujo viejo de anexos: grep `window._anexos` → 0.
- Sin temporales/`*.orig`/`*.rej` en `resources`, `app`, `tests`, `config` → 0.
- Sin `console.log`/`debugger` en componentes/hooks tocados → 0.
- Sin `BASELINE_DISABLED`/flags de debug en el trait de mayúsculas → 0.
- `php -l` OK en: trait, los 12 modelos, los 2 controllers parcheados, `config/questionnaires.php`, factory nueva, tests modificados.
- `npm run build` OK.
- Archivos clave presentes: `DraftRestoreBanner.jsx`, `useDraftAutosave.js`, `uppercase.js`, `DinamometriaMmiiFactory.php`.

---

## 6. Verificación manual pendiente (navegador / móvil)

Esto **no** es automatizable desde este entorno y queda para revisión humana:

1. **Cámara (móvil real):** botón de cámara abre la app de fotos con `capture="environment"`; la galería permite seleccionar varias a la vez.
2. **Editor de anexos:** recortar/rotar/zoom/"Usar sin editar" sobre 1 archivo y sobre una selección de 3+ (la cola debe avanzar sin quedar en "busy").
3. **Autosave Facial:** cargar Create, escribir, recargar la página → aparece el banner "Rascunho encontrado" con Continuar/Descartar; enviar con éxito → el borrador se limpia.
4. **Histórico:** el botón navega al histórico y vuelve al listado.
5. **Mayúsculas:** crear y editar un cuestionario → los campos de texto libre quedan en mayúsculas en BD y en el listado; los selects quedan intactos (valores exactos).
6. **Visibilidad por equipo:** con el equipo "Azul" (id 5), verificar que Potencial no muestra peso/altura y que Facial muestra `teve_avc`; con otro equipo, que no aparecen.
7. **Tema:** revisar anexos, banner de autosave e histórico en tema claro y oscuro.
8. **Pedido médico en Dinamometría:** verificar si se desea mostrar el enlace en Show/Edit (hoy la prop llega pero no hay UI).

---

## 7. Comandos de verificación

```powershell
C:\php84\php.exe vendor\bin\phpunit --no-coverage     # 188/188 OK (1088 assertions)
npm run build                                          # ✓ built in 11.29s
```

**Estado:** listo para revisión. Despliegue pendiente de aprobación explícita.

---

## 8. Recorrido end-to-end final (auditoría de agentes)

### 8.1 Auditoría de hooks (agente 1)
| Hook / Componente | Hallazgo | Acción |
|---|---|---|
| `useDraftAutosave` | JSON corrupto en storage no se purgaba; lectura re-disparaba en cada `enabled` toggle; listeners `visibilitychange`/`pagehide` se re-registraban por keydown | `removeDraft()` con try/catch; `readDraft` purga inválidos + limpia `pendingDraft` en `else`; effect de lectura solo en `[draftKey, version]`; `flushRef` + listeners con `[]` |
| `useTheme` | `localStorage` sin try/catch; `matchMedia` sin guard; valor guardado sin validación; dos instancias desktop/mobile desincronizadas | try/catch en storage; `matchMedia?.()`; solo acepta `'light'|'dark'`; sincronía cross-tab vía `themechange` + `storage` |
| `Edit.jsx` (facial) | Rama con anexos (`forceFormData`) no llamaba `draft.clear()` en `onSuccess` | Agregado `onSuccess: () => draft.clear()` |
| `DraftRestoreBanner` | Import `useTranslation` y `const { t }` sin usar; strings hardcodeadas | Import + const eliminados |
| `useDraftAutosave` `onRestore` | Sobrescribía `anexos=[]`, firma y pedido médico vacíos del borrador pisando archivos ya cargados | Merge defensivo: no pisa valores no vacíos con vacíos del borrador |
| `app.jsx` | Lógica de tema duplicada sin guards/validación | Reportado (no tocado) |
| `useFieldVisibility`/`useTranslation` | Devuelven objetos/funciones nuevas cada render (sin uso en deps) | Sin efecto real reportado |

### 8.2 Optimizaciones de render (agente 2)
| Archivo | Optimización |
|---|---|
| `Pages/Questionnaires/Index.jsx` | `groupModules(modules)` memoizado con `useMemo` |
| `Pages/History/Index.jsx` | `activeCounts` memoizado; 3 concatenaciones `+` → template literals; `key={i}` en paginación → `key={link.label + '-' + i}` |
| 12 `Pages/Questionnaires/*/Index.jsx` | `ExportButton`, `SortableHeader`, `AssimetriaBadge` (DinamometriaMmii) movidos a nivel de módulo (identidad estable, props explícitas: `exportingId`, `onExport`, `sortField`, `sortDirection`, `onSort`) |
| `ElectroneuromiografiaFacial/Create.jsx` + `Edit.jsx` | `CONDITIONAL_FIELDS` (7 claves) elevado a nivel de módulo (7 listas inline eliminadas) |

### 8.3 Bugs detectados y corregidos por agentes
| Bug | Severidad | Archivos | Fix |
|---|---|---|---|
| `clearFilters` llama `setSelectedTeam('')` inexistente → `ReferenceError` al limpiar filtros | Alta | `Dinamometro`, `Estesiometria`, `TdahAdulto`, `TdahInfantil` `Index.jsx` | Eliminada la llamada `setSelectedTeam('')` |
| `stats.teams` undefined en tarjeta "Equipes" | Media | `Electroencefalograma`, `Electroneuromiografia`, `ElectroneuromiografiaFacial` `Index.jsx` | Agregado `teams: new Set(data.map(q => q.team_id).filter(Boolean)).size` al `stats` memoizado |
| `onRestore` pisa archivos/firma con valores vacíos del borrador | Media | `ElectroneuromiografiaFacial/Create.jsx`, `Edit.jsx` | Merge: `if (dvEmpty && !curEmpty) return;` antes de `setData(k,dv)` |
| Paginación `key={i}` inestable | Baja | `History/Index.jsx` | `key={link.label + '-' + i}` |

### 8.4 Cierre de huecos whitelist mayúsculas (análisis campo-a-campo)
| Módulo | Campo | Decisión | Evidencia |
|---|---|---|---|
| Potencial | fonoaudiologo_motivo | **AGREGADO** | `Create.jsx:328-334` input text; `StorePotencialRequest.php:40` `nullable|string|max:255` |
| Potencial | otorrino_motivo | **AGREGADO** | `Create.jsx:352-358` input text; `StorePotencialRequest.php:42` `nullable|string|max:255` |
| Potencial | neuropediatra_motivo | **AGREGADO** | `Create.jsx:400-406` input text; `StorePotencialRequest.php:46` `nullable|string|max:255` |
| Potencial | psiquiatra_motivo | **AGREGADO** | `Create.jsx:424-430` input text; `StorePotencialRequest.php:48` `nullable|string|max:255` |
| Potencial | retardo_mental_grau | **EXCLUIDO** | `StorePotencialRequest.php:50` `in:Leve,Moderado,Grave` (select) |
| Potencial | familiar_perda_auditiva_quem | **AGREGADO** | `Create.jsx:564-570` input text; `StorePotencialRequest.php:61` `nullable|string|max:255` |
| Potencial | gestacao_meses | **EXCLUIDO** | `StorePotencialRequest.php:63` `integer|min:1|max:12` (numérico) |
| Potencial | perda_audicao_ouvido | **AGREGADO** | `Create.jsx:612-618` input text; `StorePotencialRequest.php:65` `nullable|string|max:255` |
| Potencial | oftalmologista_motivo | **AGREGADO** | `Create.jsx:738-744` input text; `StorePotencialRequest.php:78` `nullable|string|max:255` |
| Potencial | patologia_olho_detalhes | **AGREGADO** | `Create.jsx:762-768` input text; `StorePotencialRequest.php:80` `nullable|string|max:255` |
| Potencial | grau_oculos | **AGREGADO** | `Create.jsx:786-787` input text; `StorePotencialRequest.php:82` `nullable|string|max:255` |
| DinamometriaMmii | unidade_outra | **AGREGADO** (ya estaba) | `Create.jsx:658-661` input text condicional "Outra" |
| DinamometriaMmii | valor_analise_outro | **AGREGADO** (ya estaba) | `Create.jsx:658-661` input text condicional "Outro" |
| Demás candidatos (selects/in: numéricos) | — | **EXCLUIDOS** | Verificados por `Select-String` en Create.jsx y Store*Request.php |

**Resultado:** 9 campos nuevos agregados a AMBAS listas (trait + `uppercase.js`); listas sincronizadas (76 campos cada una). Sin regresiones.

### 8.5 Tests E2E de mayúsculas (nuevo archivo)
| Test | Cobertura |
|---|---|
| `test_store_convierte_texto_libre_a_mayusculas_y_preserva_selects` | POST Potencial con `nome/clinica/solicitante` en minúsculas → BD MAYÚSCULAS; `sexo` (select) preservado exacto |
| `test_update_vuelve_a_aplicar_mayusculas` | PUT Potencial → vuelve a uppercasar |
| `test_normaliza_unicode_a_nfc_antes_de_encadenar_mayusculas` | `nome` con NFD (combinando U+0301) → NFC + MAYÚSCULAS (`JOSÉ` sin combining marks) |
| `test_campos_tecnicos_no_se_alteran` | `rg` (dígitos) idéntico; idempotencia |

### 8.6 Verificación encoding (sin símbolos raros)
- Escaneo 298 archivos (`app/`, `resources/`, `tests/`, `config/`, `database/`, `docs/`): **0 BOM**, **0 U+FFFD**, **0 UTF-8 inválido**.
- Los 15 "candidatos a mojibake" detectados por regex eran falsos positivos: palabras legítimas (`NÃO`, `OBSERVAÇÃO`).
- Los `previsA3n`, `VocA-A`, `mA1s` vistos en consola son **artefactos de PowerShell 5.1 (ANSI)** al leer UTF-8, no corrupción en disco. Verificado con `node` (code points correctos: `não` = U+00E3, `serão` = U+00E3, etc.).
- Archivos generados en esta sesión (report, tests, factory, patches): UTF-8 válidos, sin BOM.

### 8.7 Resultados finales de la suite

| Métrica | Valor |
|---|---|
| Suite PHPUnit completa | **192/192 OK — 1102 assertions, 0 errores, 0 fallos** |
| Baseline inicio iteración | 188 tests: **13 errors + 7 failures** |
| Build frontend | **OK** (`✓ built in 11.32s`) |
| Sintaxis PHP | OK (trait, 12 modelos, controllers, factory, tests) |

---

**Estado final:** ✅ **Todo verde** — 192 tests, build OK, hooks auditados/optimizados, whitelist completa y sincronizada, sin regresiones.

**Despliegue:** pendiente de aprobación explícita. Recordar: en producción la migración `2026_10_05_create_dinamometria_mmiis_table` no está registrada → migrar con `--path=database/migrations/2026_10_05_000000_create_dinamometria_mmiis_table.php`.
