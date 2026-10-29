# Timber & Hardware Hub

Storefront for Sri Amman Marailaipagam & Senthivelan Hardwares. The site includes a product catalogue, search and category filters, product details, an enquiry cart, WhatsApp checkout, and a protected owner dashboard.

## Local Development

Install Node.js and npm, then run:

```sh
npm install
npm run dev
```

Run the test suite and production build with:

```sh
npm test
npm run build
```

## Supabase Configuration

Configure the project URL and publishable key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for browser builds. Server functions also use `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; keep the service role key server-side only. Database migrations use `DATABASE_URL`.

The catalogue may contain clearly marked demo products and prices. Replace these with verified shop data before accepting customer enquiries. The WhatsApp checkout records an enquiry and prepares a message; it does not take payment or confirm an order.

## Project Structure

- `src/routes/` contains the storefront, catalogue, checkout, and owner routes.
- `src/components/store/` contains shared storefront components.
- `src/integrations/supabase/` contains Supabase clients and authentication middleware.
- `drizzle/` and `supabase/` contain database schema, migrations, and local configuration.
- `public/images/` contains storefront and catalogue images.
