import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import SwitchTeamForm from './Partials/SwitchTeamForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { switchableTeams = [] } = usePage().props;
    const canSwitchTeams = switchableTeams.length > 1;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-zinc-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-zinc-700 p-4 shadow dark:shadow-zinc-900/50 sm:rounded-lg sm:p-8 transition-colors duration-200">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    {canSwitchTeams && (
                        <div className="bg-white dark:bg-zinc-700 p-4 shadow dark:shadow-zinc-900/50 sm:rounded-lg sm:p-8 transition-colors duration-200">
                            <SwitchTeamForm className="max-w-xl" />
                        </div>
                    )}

                    <div className="bg-white dark:bg-zinc-700 p-4 shadow dark:shadow-zinc-900/50 sm:rounded-lg sm:p-8 transition-colors duration-200">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-zinc-700 p-4 shadow dark:shadow-zinc-900/50 sm:rounded-lg sm:p-8 transition-colors duration-200">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
