export const production: boolean = process?.env?.NODE_ENV === 'production';
export const homeUrl: string = process?.env?.APP_URL ?? 'http://localhost:3000';
export const accessSecret: string = process?.env?.JWT_TOKEN ?? '';
export const refreshSecret: string = process?.env?.JWT_REFRESH ?? '';
export const emailSecret: string = process?.env?.JWT_EMAIL ?? '';
export const webhookSecret: string = process?.env?.JWT_WEBHOOK ?? '';
