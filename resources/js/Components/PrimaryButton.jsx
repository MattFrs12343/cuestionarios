export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-blue-600 dark:bg-blue-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-700 dark:hover:bg-blue-800 focus:bg-blue-700 dark:focus:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 active:bg-blue-800 dark:active:bg-blue-900 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
