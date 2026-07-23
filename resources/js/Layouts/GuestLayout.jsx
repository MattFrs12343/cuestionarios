import ApplicationLogo from '@/Components/ApplicationLogo';
import FlashMessage from '@/Components/FlashMessage';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <FlashMessage />
            <div>
                <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
                    <ApplicationLogo className="h-20 w-20 fill-current text-blue-600 hover:text-blue-700 transition-colors duration-200" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-xl sm:max-w-md sm:rounded-xl">
                {children}
            </div>
        </div>
    );
}
