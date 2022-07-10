import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: '/api/auth/login',
};

export async function middleware(req: NextRequest) {
    const { nextUrl: url, geo } = req;

    if (geo?.country) url.searchParams.set('country', geo.country);
    if (geo?.city) url.searchParams.set('city', geo.city);
    if (geo?.region) url.searchParams.set('region', geo.region);

    return NextResponse.rewrite(url);
}
