import {
    LockClosedIcon,
    CheckCircleIcon,
    XIcon,
    InformationCircleIcon,
} from '@heroicons/react/solid';
import { useState } from 'react';

export default function Reset({ token }: { token: string }) {
    const [disabled, setDisabled] = useState(false);
    const [status, setStatus] = useState<'' | 'processing' | 'done'>('');
    const [message, setMessage] = useState<{
        type: 'success';
        message: string;
    } | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (disabled) return;
        setMessage(null);
        setDisabled(true);
        setStatus('processing');
        const email = e.currentTarget.email.value;
        await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        setMessage({
            type: 'success',
            message: 'Success! Email sent',
        });
        setStatus('done');
    };

    return (
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 md:mt-32">
            <div className="max-w-sm w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
                    </h2>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                    action="/api/auth/reset-password"
                    method="POST">
                    <input type="hidden" name="token" value={token} />
                    <div className="rounded-md shadow-sm space-y-3">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                disabled={disabled}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={disabled}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <LockClosedIcon
                                    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                    aria-hidden="true"
                                />
                            </span>
                            {status === '' ? 'Submit' : null}
                            {status === 'processing' ? 'Processing' : null}
                            {status === 'done' ? 'Done' : null}
                        </button>
                    </div>
                </form>
                <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <InformationCircleIcon
                                className="h-5 w-5 text-blue-400"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="ml-3 text-sm text-blue-700">
                            Enter your email address above and we will send you
                            an email with instructions on how to reset your
                            password.
                        </p>
                    </div>
                </div>
                {message ? (
                    <div className="rounded-md p-4 border bg-green-50 border-green-400">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon
                                    className="h-5 w-5 text-green-400"
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {message.message}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setMessage(null)}
                                        className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600">
                                        <span className="sr-only">Dismiss</span>
                                        <XIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
