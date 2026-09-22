<?php

namespace App\Policies;

use App\Models\Questionnaire;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuestionnairePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view questionnaires');
    }

    public function view(User $user, Questionnaire $questionnaire): bool
    {
        return $user->can('view questionnaires') && 
               $user->teams->contains($questionnaire->team_id);
    }

    public function create(User $user): bool
    {
        return $user->can('create questionnaires');
    }

    public function update(User $user, Questionnaire $questionnaire): bool
    {
        return $user->can('edit questionnaires') && 
               $user->teams->contains($questionnaire->team_id);
    }

    public function delete(User $user, Questionnaire $questionnaire): bool
    {
        return $user->can('delete questionnaires') && 
               $user->teams->contains($questionnaire->team_id);
    }
}
