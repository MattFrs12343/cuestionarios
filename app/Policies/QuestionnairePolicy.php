<?php

namespace App\Policies;

use App\Models\Questionnaire;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuestionnairePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view questionnaires');
    }

    public function view(User $user, Questionnaire $questionnaire): bool
    {
        return $user->hasPermissionTo('view questionnaires') && 
               $user->teams->contains($questionnaire->team_id);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create questionnaires');
    }

    public function update(User $user, Questionnaire $questionnaire): bool
    {
        return $user->hasPermissionTo('edit questionnaires') && 
               $user->teams->contains($questionnaire->team_id);
    }

    public function delete(User $user, Questionnaire $questionnaire): bool
    {
        return $user->hasPermissionTo('delete questionnaires') && 
               $user->teams->contains($questionnaire->team_id);
    }
}
