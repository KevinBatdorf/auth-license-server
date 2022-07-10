import {
    LockClosedIcon,
    CheckCircleIcon,
    XIcon,
    InformationCircleIcon,
} from '@heroicons/react/solid';
import jwt from 'jsonwebtoken';
import { useState } from 'react';
import classNames from 'classnames';
import { emailSecret } from '@/lib/constants';
import { verifyEmailToken } from '@/lib/auth';
import { EmailTokenData } from '@/lib/types';

export default function CreatePassword({ token }: { token: string }) {
    const [disabled, setDisabled] = useState(false);
    const [message, setMessage] = useState<{
        type: 'error' | 'success';
        message: string;
    } | null>(null);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (disabled) return;
        setMessage(null);
        setDisabled(true);
        const password = e.currentTarget.password.value;
        const confirm = e.currentTarget.confirm.value;
        if (password !== confirm) {
            setMessage({
                type: 'error',
                message: 'Error! Passwords do not match.',
            });
            setDisabled(false);
            return;
        }
        const response = await fetch('/api/auth/create-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, confirm, token }),
        });
        const data = await response.json();
        if (data?.error) {
            setMessage({
                type: 'error',
                message: `Error! ${data.error}`,
            });
            setDisabled(false);
            return;
        }
        // Set notice success - password updated
        setMessage({
            type: 'success',
            message: 'Success! Password updated.',
        });
    };

    return (
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 md:mt-32">
            <div className="max-w-sm w-full space-y-8">
                <div>
                    <h2 className="my-6 text-center text-3xl font-extrabold text-gray-900">
                        Set your password
                    </h2>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                    action="/api/auth/create-password"
                    method="POST">
                    <input type="hidden" name="token" value={token} />
                    <div className="rounded-md shadow-sm space-y-3">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                disabled={disabled}
                                autoComplete="off"
                                required
                                title="Passwords require at least 8 characters including a lower-case letter, an upper-case letter, and a number."
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="sr-only">
                                Retype password
                            </label>
                            <input
                                id="confirm"
                                name="confirm"
                                type="password"
                                disabled={disabled}
                                autoComplete="off"
                                required
                                title="Passwords require at least 8 characters including a lower-case letter, an upper-case letter, and a number."
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Retype password"
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
                            Submit
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
                            Passwords require at least 8 characters including a
                            lower-case letter, an upper-case letter, and a
                            number.
                        </p>
                    </div>
                </div>
                {message ? (
                    <div
                        className={classNames('rounded-md p-4 border', {
                            'bg-green-50 border-green-400':
                                message.type === 'success',
                            'bg-red-50 border-red-400':
                                message.type === 'error',
                        })}>
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon
                                    className={classNames('h-5 w-5', {
                                        'text-green-400':
                                            message.type === 'success',
                                        'text-red-400':
                                            message.type === 'error',
                                    })}
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="ml-3">
                                <p
                                    className={classNames(
                                        'text-sm font-medium',
                                        {
                                            'text-green-800':
                                                message.type === 'success',
                                            'text-red-800':
                                                message.type === 'error',
                                        },
                                    )}>
                                    {message.message}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        onClick={() => setMessage(null)}
                                        type="button"
                                        className={classNames(
                                            'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                            {
                                                'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600':
                                                    message.type === 'success',
                                                'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600':
                                                    message.type === 'error',
                                            },
                                        )}>
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

type QueryToken = { query: { token: string } };
export const getServerSideProps = async ({ query }: QueryToken) => {
    try {
        if (!emailSecret || !query?.token) {
            throw new Error('Missing information to validate token');
        }

        const data = (await verifyEmailToken(query.token)) as EmailTokenData;
        if (!data?.userId) {
            throw new Error('Token is invalid');
        }
    } catch (error) {
        return {
            redirect: {
                destination: '/401',
                permanent: false,
            },
        };
    }

    return { props: { token: query.token } };
};
