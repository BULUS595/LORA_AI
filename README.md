# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Accounts and Billing

The browser app uses Supabase Auth for email/password and Google, Apple, Microsoft (Azure), and GitHub sign-in. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and public anon key. Never put a Supabase service-role key or Stripe secret in a `VITE_` variable.

The Supabase migration creates user profiles and account-owned subscription records with row-level security. Apply it with the Supabase CLI after linking a project:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

In Supabase Auth, enable email/password and configure email confirmation, SMTP, the site URL, and allowed redirects for local development and production. Enable Google, Apple, Azure/Microsoft, and GitHub providers with their client credentials. Each provider must use the Supabase callback URL shown in the project's Auth settings.

The free plan is activated only for a signed-in account. Paid plans are created on the server as Stripe subscriptions; the browser never supplies an amount. Create monthly Stripe Prices for Basic (NGN 3,590) and Pro (NGN 50,000). The server rejects Price IDs that do not match those amounts and cadence, and the Pricing page reads the display values from Stripe. Configure these Supabase Function secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`, and `SITE_URL`. Keep all secret values in Supabase, not in Git or browser environment variables.

Deploy the functions:

```sh
supabase functions deploy activate-free-plan
supabase functions deploy create-checkout-session
supabase functions deploy create-billing-portal-session
supabase functions deploy get-plan-catalog
supabase functions deploy stripe-webhook
```

Configure a Stripe webhook to call `/functions/v1/stripe-webhook` and subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. The webhook is the source of truth for paid plan status. The project still needs a production Supabase project, provider credentials, Stripe account and recurring Price IDs before real sign-in or charges can work. The built-in help chat is a local guide to the website; the primary LORA AI workspace/API is not present in this repository yet, so it does not claim to answer general AI questions.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
