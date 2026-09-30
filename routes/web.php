<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('questionnaires.index');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return redirect()->route('questionnaires.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Rutas de cuestionarios
    Route::get('questionnaires', function () {
        $user = auth()->user();
        $accessibleModules = $user->getAccessibleModules();

        $modules = collect(config('questionnaires.types'))
            ->only($accessibleModules)
            ->map(fn (array $type, string $moduleName) => [
                'name' => $type['label'],
                'description' => $type['description'],
                'icon' => $moduleName,
                'href' => route("questionnaires.{$type['slug']}.index"),
                'color' => $type['color'],
                'count' => 0,
            ])
            ->values()
            ->all();

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
    
    // Rutas específicas para Electroneuromiografia Facial
    Route::prefix('questionnaires/electroneuromiografia-facial')->name('questionnaires.electroneuromiografia-facial.')
        ->middleware('module.access:electroneuromiografia_facial')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'store'])->name('store');
        Route::get('/{electroneuromiografiaFacial}', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'show'])->name('show');
        Route::get('/{electroneuromiografiaFacial}/edit', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'edit'])->name('edit');
        Route::put('/{electroneuromiografiaFacial}', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'update'])->name('update');
        Route::delete('/{electroneuromiografiaFacial}', [App\Http\Controllers\Questionnaires\ElectroneuromiografiaFacialController::class, 'destroy'])->name('destroy');
    });

    // Redirección del prefijo anterior ("eletroneuromiografia-facial") al actual.
    // Solo lectura: los enlaces viejos siguen funcionando, las escrituras van al prefijo nuevo.
    Route::get('questionnaires/eletroneuromiografia-facial', fn () => redirect('questionnaires/electroneuromiografia-facial'));
    Route::get('questionnaires/eletroneuromiografia-facial/{path}', function (string $path) {
        return redirect('questionnaires/electroneuromiografia-facial/' . $path);
    })->where('path', '.*');

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

    // Rutas específicas para Estesiometria (módulo opcional por equipo, ver team_modules)
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

    // Rutas específicas para TDAH Infantil - SNAP-IV (módulo opcional por equipo, ver team_modules)
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

    // Rutas específicas para TDAH Adulto - ASRS-18 (módulo opcional por equipo, ver team_modules)
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

    // Rutas específicas para Dinamômetro (módulo opcional por equipo, ver team_modules)
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

    // Rutas específicas para Mini Exame do Estado Mental (MEEM)
    Route::prefix('questionnaires/mini-exame-mental')->name('questionnaires.mini-exame-mental.')
        ->middleware('module.access:mini_exame_mental')->group(function () {
        Route::get('/', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'store'])->name('store');
        Route::get('/{miniExameMental}', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'show'])->name('show');
        Route::get('/{miniExameMental}/edit', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'edit'])->name('edit');
        Route::put('/{miniExameMental}', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'update'])->name('update');
        Route::delete('/{miniExameMental}', [App\Http\Controllers\Questionnaires\MiniExameMentalController::class, 'destroy'])->name('destroy');
    });

    // Anexos (imágenes adjuntas a cualquier tipo de cuestionario, máx. 5)
    Route::post('anexos/{type}/{id}', [App\Http\Controllers\AttachmentController::class, 'store'])
        ->name('attachments.store');
    Route::get('anexos/{attachment}', [App\Http\Controllers\AttachmentController::class, 'show'])
        ->name('attachments.show');
    Route::delete('anexos/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])
        ->name('attachments.destroy');

    // Pedido médico (archivo privado adjunto a cualquier tipo de cuestionario)
    Route::get('pedidos-medicos/{type}/{id}', [App\Http\Controllers\PedidoMedicoController::class, 'show'])
        ->name('pedidos-medicos.show');

    // Cambiar el equipo actual de la sesión (selector global)
    Route::post('equipes/{team}/switch', App\Http\Controllers\TeamSwitchController::class)
        ->name('teams.switch');
});

// Rutas de administración
Route::middleware(['auth', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard de administración
    Route::get('/', function () {
        $admin = auth()->user();
        $isSuperAdmin = $admin->isSuperAdmin();

        // Un admin de equipo solo debe ver el alcance de sus propios equipos:
        // los conteos globales revelaban la escala de TODO el sistema (otros
        // equipos/tenants) a cualquier admin, no solo al super-admin.
        $teamIds = $isSuperAdmin ? null : $admin->teams()->pluck('teams.id');
        $userQuery = fn () => $teamIds ? \App\Models\User::whereHas('teams', fn ($q) => $q->whereIn('teams.id', $teamIds)) : \App\Models\User::query();

        $stats = [
            'users' => $userQuery()->count(),
            'roles' => $isSuperAdmin ? \Spatie\Permission\Models\Role::count() : null,
            'teams' => $isSuperAdmin ? \App\Models\Team::count() : $teamIds->count(),
            'active_users' => $userQuery()->where('is_active', true)->count(),
            'users_with_modules' => $userQuery()->whereHas('activeModules')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    })->name('dashboard');
    
    // Gestión de usuarios
    Route::resource('users', App\Http\Controllers\Admin\UserController::class);
    Route::patch('users/{user}/toggle-status', [App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    
    // Gestión de roles
    Route::resource('roles', App\Http\Controllers\Admin\RoleController::class)->except(['show']);
    
    // Gestión de equipos
    Route::resource('teams', App\Http\Controllers\Admin\TeamController::class);
    Route::put('teams/{team}/modules', [App\Http\Controllers\Admin\TeamController::class, 'updateModules'])
        ->name('teams.update-modules');

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
