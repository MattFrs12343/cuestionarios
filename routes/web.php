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
                'icon' => '🧠',
                'href' => route('questionnaires.electroencefalograma.index'),
                'color' => 'bg-blue-500',
                'count' => 0
            ];
        }
        
        if (in_array('electroneuromiografia', $accessibleModules)) {
            $modules[] = [
                'name' => 'Electroneuromiografía',
                'description' => 'Questionário para exames de eletroneuromiografia',
                'icon' => '⚡',
                'href' => route('questionnaires.electroneuromiografia.index'),
                'color' => 'bg-purple-500',
                'count' => 0
            ];
        }
        
        if (in_array('potencial', $accessibleModules)) {
            $modules[] = [
                'name' => 'Potencial Evocado',
                'description' => 'Questionário para exames de potencial evocado auditivo e visual',
                'icon' => '👁️',
                'href' => route('questionnaires.potencial.index'),
                'color' => 'bg-green-500',
                'count' => 0
            ];
        }
        
        if (in_array('eletroneuromiografia_facial', $accessibleModules)) {
            $modules[] = [
                'name' => 'Eletroneuromiografia Facial',
                'description' => 'Questionário para exames de eletroneuromiografia facial',
                'icon' => '😊',
                'href' => route('questionnaires.eletroneuromiografia-facial.index'),
                'color' => 'bg-orange-500',
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
