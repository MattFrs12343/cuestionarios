<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionnaireController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Rutas de cuestionarios
    Route::get('questionnaires', function () {
        $user = auth()->user();
        $accessibleModules = $user->getAccessibleModules();
        
        $modules = [];
        if (in_array('electroencefalograma', $accessibleModules)) {
            $modules[] = [
                'name' => 'Electroencefalograma',
                'description' => 'Questionário para exames de eletroencefalograma',
                'icon' => 'electroencefalograma',
                'href' => route('questionnaires.electroencefalograma.index'),
                'color' => 'bg-blue-500',
                'count' => 0
            ];
        }
        
        if (in_array('electroneuromiografia', $accessibleModules)) {
            $modules[] = [
                'name' => 'Electroneuromiografía',
                'description' => 'Questionário para exames de eletroneuromiografia',
                'icon' => 'electroneuromiografia',
                'href' => route('questionnaires.electroneuromiografia.index'),
                'color' => 'bg-purple-500',
                'count' => 0
            ];
        }
        
        if (in_array('potencial', $accessibleModules)) {
            $modules[] = [
                'name' => 'Potencial Evocado',
                'description' => 'Questionário para exames de potencial evocado auditivo e visual',
                'icon' => 'potencial',
                'href' => route('questionnaires.potencial.index'),
                'color' => 'bg-green-500',
                'count' => 0
            ];
        }
        
        if (in_array('eletroneuromiografia_facial', $accessibleModules)) {
            $modules[] = [
                'name' => 'Eletroneuromiografia Facial',
                'description' => 'Questionário para exames de eletroneuromiografia facial',
                'icon' => 'eletroneuromiografia_facial',
                'href' => route('questionnaires.eletroneuromiografia-facial.index'),
                'color' => 'bg-orange-500',
                'count' => 0
            ];
        }

        if (in_array('rastreio_cognitivo', $accessibleModules)) {
            $modules[] = [
                'name' => 'Rastreio Cognitivo (MoCA)',
                'description' => 'Protocolo de rastreio cognitivo em consulta',
                'icon' => 'rastreio_cognitivo',
                'href' => route('questionnaires.rastreio-cognitivo.index'),
                'color' => 'bg-teal-500',
                'count' => 0
            ];
        }

        if (in_array('equilibrio', $accessibleModules)) {
            $modules[] = [
                'name' => 'Avaliação do Equilíbrio',
                'description' => 'Avaliação do equilíbrio clínico e risco de quedas',
                'icon' => 'equilibrio',
                'href' => route('questionnaires.equilibrio.index'),
                'color' => 'bg-yellow-500',
                'count' => 0
            ];
        }

        if (in_array('estesiometria', $accessibleModules)) {
            $modules[] = [
                'name' => 'Estesiometria',
                'description' => 'Avaliação sensitiva com monofilamentos',
                'icon' => 'estesiometria',
                'href' => route('questionnaires.estesiometria.index'),
                'color' => 'bg-red-500',
                'count' => 0
            ];
        }

        if (in_array('tdah_infantil', $accessibleModules)) {
            $modules[] = [
                'name' => 'TDAH Infantil (SNAP-IV)',
                'description' => 'Escala de autoavaliação para TDAH em crianças',
                'icon' => 'tdah_infantil',
                'href' => route('questionnaires.tdah-infantil.index'),
                'color' => 'bg-pink-500',
                'count' => 0
            ];
        }

        if (in_array('tdah_adulto', $accessibleModules)) {
            $modules[] = [
                'name' => 'TDAH Adulto (ASRS-18)',
                'description' => 'Escala de autoavaliação para TDAH em adultos',
                'icon' => 'tdah_adulto',
                'href' => route('questionnaires.tdah-adulto.index'),
                'color' => 'bg-indigo-500',
                'count' => 0
            ];
        }

        if (in_array('dinamometro', $accessibleModules)) {
            $modules[] = [
                'name' => 'Dinamômetro',
                'description' => 'Avaliação de força de preensão manual',
                'icon' => 'dinamometro',
                'href' => route('questionnaires.dinamometro.index'),
                'color' => 'bg-violet-500',
                'count' => 0
            ];
        }

        return Inertia::render('Questionnaires/Index', [
            'modules' => $modules,
            'userRole' => $user->roles->first()?->name,
            'isAdmin' => $user->isAdmin(),
        ]);
    })->name('questionnaires.index');
    
    // Rutas específicas para Electroencefalograma
    Route::prefix('questionnaires/electroencefalograma')->name('questionnaires.electroencefalograma.')
        ->middleware('module.access:electroencefalograma')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'store'])->name('store');
        Route::get('/{questionnaire}', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'show'])->name('show');
        Route::get('/{questionnaire}/edit', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'edit'])->name('edit');
        Route::put('/{questionnaire}', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'update'])->name('update');
        Route::delete('/{questionnaire}', [App\Http\Controllers\Questionnaires\ElectroencefalogramaController::class, 'destroy'])->name('destroy');
    });
    
    // Rutas específicas para Electroneuromiografia
    Route::prefix('questionnaires/electroneuromiografia')->name('questionnaires.electroneuromiografia.')
        ->middleware('module.access:electroneuromiografia')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'store'])->name('store');
        Route::get('/{electroneuromiografia}', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'show'])->name('show');
        Route::get('/{electroneuromiografia}/edit', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'edit'])->name('edit');
        Route::put('/{electroneuromiografia}', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'update'])->name('update');
        Route::delete('/{electroneuromiografia}', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaController::class, 'destroy'])->name('destroy');
    });
    
    // Rutas específicas para Potencial Evocado
    Route::prefix('questionnaires/potencial')->name('questionnaires.potencial.')
        ->middleware('module.access:potencial')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\PotencialController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\PotencialController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\PotencialController::class, 'store'])->name('store');
        Route::get('/{potencial}', [App\Http\Controllers\Questionnaires\PotencialController::class, 'show'])->name('show');
        Route::get('/{potencial}/edit', [App\Http\Controllers\Questionnaires\PotencialController::class, 'edit'])->name('edit');
        Route::match(['put', 'post'], '/{potencial}', [App\Http\Controllers\Questionnaires\PotencialController::class, 'update'])->name('update');
        Route::delete('/{potencial}', [App\Http\Controllers\Questionnaires\PotencialController::class, 'destroy'])->name('destroy');
    });
    
    // Rutas específicas para Eletroneuromiografia Facial
    Route::prefix('questionnaires/eletroneuromiografia-facial')->name('questionnaires.eletroneuromiografia-facial.')
        ->middleware('module.access:eletroneuromiografia_facial')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'store'])->name('store');
        Route::get('/{eletroneuromiografiaFacial}', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'show'])->name('show');
        Route::get('/{eletroneuromiografiaFacial}/edit', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'edit'])->name('edit');
        Route::put('/{eletroneuromiografiaFacial}', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'update'])->name('update');
        Route::delete('/{eletroneuromiografiaFacial}', [App\Http\Controllers\Questionnaires\EletroneuromiografiaFacialController::class, 'destroy'])->name('destroy');
    });

    // Rutas específicas para Rastreio Cognitivo (MoCA)
    Route::prefix('questionnaires/rastreio-cognitivo')->name('questionnaires.rastreio-cognitivo.')
        ->middleware('module.access:rastreio_cognitivo')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'store'])->name('store');
        Route::get('/{rastreioCognitivo}', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'show'])->name('show');
        Route::get('/{rastreioCognitivo}/edit', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'edit'])->name('edit');
        Route::put('/{rastreioCognitivo}', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'update'])->name('update');
        Route::delete('/{rastreioCognitivo}', [App\Http\Controllers\Questionnaires\RastreioCognitivoController::class, 'destroy'])->name('destroy');
    });

    // Rutas específicas para Avaliação do Equilíbrio
    Route::prefix('questionnaires/equilibrio')->name('questionnaires.equilibrio.')
        ->middleware('module.access:equilibrio')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'store'])->name('store');
        Route::get('/{equilibrio}', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'show'])->name('show');
        Route::get('/{equilibrio}/edit', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'edit'])->name('edit');
        Route::put('/{equilibrio}', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'update'])->name('update');
        Route::delete('/{equilibrio}', [App\Http\Controllers\Questionnaires\AvaliacaoEquilibrioController::class, 'destroy'])->name('destroy');
    });

    // Rutas específicas para Estesiometria (exclusivo equipo rojo / Equipe Principal)
    Route::prefix('questionnaires/estesiometria')->name('questionnaires.estesiometria.')
        ->middleware('module.access:estesiometria')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'store'])->name('store');
        Route::get('/{estesiometria}', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'show'])->name('show');
        Route::get('/{estesiometria}/edit', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'edit'])->name('edit');
        Route::put('/{estesiometria}', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'update'])->name('update');
        Route::delete('/{estesiometria}', [App\Http\Controllers\Questionnaires\EstesiometriaController::class, 'destroy'])->name('destroy');
    });

    // Rutas específicas para TDAH Infantil - SNAP-IV (exclusivo equipo rojo / Equipe Principal)
    Route::prefix('questionnaires/tdah-infantil')->name('questionnaires.tdah-infantil.')
        ->middleware('module.access:tdah_infantil')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'store'])->name('store');
        Route::get('/{tdahInfantil}', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'show'])->name('show');
        Route::get('/{tdahInfantil}/edit', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'edit'])->name('edit');
        Route::put('/{tdahInfantil}', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'update'])->name('update');
        Route::delete('/{tdahInfantil}', [App\Http\Controllers\Questionnaires\TdahInfantilController::class, 'destroy'])->name('destroy');
    });

    // Rutas específicas para TDAH Adulto - ASRS-18 (exclusivo equipo rojo / Equipe Principal)
    Route::prefix('questionnaires/tdah-adulto')->name('questionnaires.tdah-adulto.')
        ->middleware('module.access:tdah_adulto')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'store'])->name('store');
        Route::get('/{tdahAdulto}', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'show'])->name('show');
        Route::get('/{tdahAdulto}/edit', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'edit'])->name('edit');
        Route::put('/{tdahAdulto}', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'update'])->name('update');
        Route::delete('/{tdahAdulto}', [App\Http\Controllers\Questionnaires\TdahAdultoController::class, 'destroy'])->name('destroy');
    });

    // Rutas específicas para Dinamômetro (exclusivo equipo rojo / Equipe Principal)
    Route::prefix('questionnaires/dinamometro')->name('questionnaires.dinamometro.')
        ->middleware('module.access:dinamometro')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'store'])->name('store');
        Route::get('/{dinamometro}', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'show'])->name('show');
        Route::get('/{dinamometro}/edit', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'edit'])->name('edit');
        Route::put('/{dinamometro}', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'update'])->name('update');
        Route::delete('/{dinamometro}', [App\Http\Controllers\Questionnaires\DinamometroController::class, 'destroy'])->name('destroy');
    });

    // Anexos (imágenes adjuntas a cualquier tipo de cuestionario, máx. 5)
    Route::post('anexos/{type}/{id}', [App\Http\Controllers\AttachmentController::class, 'store'])
        ->name('attachments.store');
    Route::delete('anexos/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])
        ->name('attachments.destroy');
});

// Rutas de administración
Route::middleware(['auth', 'role:administrador'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard de administración
    Route::get('/', function () {
        $stats = [
            'users' => \App\Models\User::count(),
            'roles' => \Spatie\Permission\Models\Role::count(),
            'teams' => \App\Models\Team::count(),
            'active_users' => \App\Models\User::where('is_active', true)->count(),
            'users_with_modules' => \App\Models\User::whereHas('activeModules')->count(),
        ];
        
        return Inertia::render('Admin/Dashboard', compact('stats'));
    })->name('dashboard');
    
    // Gestión de usuarios
    Route::resource('users', App\Http\Controllers\Admin\UserController::class);
    Route::patch('users/{user}/toggle-status', [App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    
    // Gestión de roles
    Route::resource('roles', App\Http\Controllers\Admin\RoleController::class);
    
    // Gestión de equipos
    Route::resource('teams', App\Http\Controllers\Admin\TeamController::class);
    
    // Gestión de módulos de usuarios
    Route::get('user-modules', [App\Http\Controllers\Admin\UserModuleController::class, 'index'])
        ->name('user-modules.index');
    Route::get('user-modules/{user}/edit', [App\Http\Controllers\Admin\UserModuleController::class, 'edit'])
        ->name('user-modules.edit');
    Route::put('user-modules/{user}', [App\Http\Controllers\Admin\UserModuleController::class, 'update'])
        ->name('user-modules.update');
    Route::post('user-modules/{user}/toggle', [App\Http\Controllers\Admin\UserModuleController::class, 'toggle'])
        ->name('user-modules.toggle');
});

require __DIR__.'/auth.php';
