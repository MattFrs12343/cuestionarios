import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-end border-b-2 px-1 pb-0.5 text-sm font-medium leading-none transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-indigo-400 dark:border-indigo-600 text-gray-900 dark:text-gray-100 focus:border-indigo-700 dark:focus:border-indigo-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 focus:border-gray-300 dark:focus:border-gray-600 focus:text-gray-700 dark:focus:text-gray-300') +
                className
            }
        >
            {children}
        </Link>
    );
}
