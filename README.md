A multi-seat license auth server with revokable sessions, webhook control, and email support. Written in TypeScript using Next.js, Prisma, and a touch of Tailwind for the password reset form flow.

This is a work in progress template app that I use to scaffold new projects.

## Setup

1. Clone the repo and run `npm i`
2. Add a database, such as sqlite `touch ./prisma/auth.db` or update the prisma schema file to connect to postgres
3. Add jwt tokens to a .env file

```js
// Generate random string
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

After that you have a basic Next.js app. Your next steps should be the following:

1. Update `lib/email.ts` with custom messages, or use a different service like Postmark
2. Error messages were kept relatively generic. You may want to iterate on those
3. Decide the rate limiting strategy for the auth routes. Check out the [Upstash setup](https://github.com/vercel/examples/tree/main/edge-functions/api-rate-limit) from Next.js (I may integrate this into the repo as a starter if requested)

## Auth Overview

You first need to create a user manually.

```js
npm run create-admin email@example.com "Your Name"
```
Then you want to visit `/reset-password` to receive an email with a link to the password reset page.

Next you would design your application to send the email and password to `/api/auth/login` and receive a long-lived refresh token in the cookie (and response), and a 10 minute access token that you will keep in the browser's memory (don't store these in local storage or session storage). If not using a browser-based app, store the refresh token securly depending on the context of your application.

Logging in will check against available `licenses * seats`, and if no remaining licenses exist, the token will be set to `limited: true` so your resource server can possibly show different (trial?) data. If a license is changed or deleted, the user will be asked to log in again.

Your application should request a new refresh token every 10 minutes from `/api/auth/refresh-token` which confirms the session is still active. This allows the session to be revoked (via a webhook). You also need to run the `scripts/prune-sessions` to delete sessions where the license has expired.

## Webhooks overview

Webhooks are available to admins by requesting one on `/api/webhooks/create` by a user with an `ADMIN` role. This is a long-lived token that gives access to pre defined commands. See [`lib/webhooks`](https://github.com/KevinBatdorf/auth-license-server/blob/main/lib/webhooks.ts#L20) for the basic commands I added. Sending a POST request to `/api/webhooks` with the function name in kebab case `action: create-user` and the required payload will result in a successful execution.

You can create users with a license from your main application, for example, after a sucessful item is purchased from your store. the access token can be then used on a 3rd server to provice access to resources.
