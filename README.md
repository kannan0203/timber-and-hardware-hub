# Timber And Hardware Hub

Build a Professional E-Commerce Website for Sri Amman Marailaipagam & Senthivelan Hardwares



Act as a senior UI/UX designer, React developer, and full-stack engineer. Build a complete, professional, responsive e-commerce website for my family business, combining a timber shop and a hardware shop into one online platform.



Do not create just a static landing page or a visual mockup. Build a functional website with working navigation, product browsing, search, filters, shopping cart, checkout, WhatsApp ordering, and a secure admin dashboard.



1. Business Information



Business name: Sri Amman Marailaipagam & Senthivelan Hardwares



Business type: Timber, plywood, doors, wooden frames, and hardware products.



Shop address: Thiruvapadi, Kattumavadi Road, Aranthangi Taluk, Pudukkottai District, Tamil Nadu, India – 614630.



Business phone / WhatsApp: +91 6385743172



Website language: English.



Initial deployment: Lovable preview only. Do not purchase a domain or claim the website is publicly deployed.



Do not invent business history, customer reviews, certifications, delivery policies, product prices, stock quantities, or other business information.



2. Design and Branding



Create a premium, elegant, trustworthy website inspired by natural wood and professional building-material stores.



Design requirements:



- Primary colors: dark walnut brown, warm wood brown, and cream.

- Accent colors: muted gold and natural beige.

- Use readable typography and consistent spacing.

- Use high-quality sample images of timber, plywood, wooden doors, tools, paint products, screws, locks, and hinges.

- Create a professional text-based logo using “Sri Amman” and “Senthivelan Hardwares.” Do not imitate an existing brand logo.

- Use clean product cards, subtle shadows, rounded corners, and tasteful hover animations.

- Use a responsive layout for mobile phones, tablets, laptops, and desktops.

- Add accessible contrast, visible keyboard focus, descriptive image alt text, and properly labelled forms.

- Avoid excessive animations, clutter, and oversized decorative elements.



The website should look like a genuine local business website, not a generic AI-generated template.



3. Website Pages and Navigation



Create the following pages with working navigation:



1. Home

2. All Products

3. Timber and Plywood

4. Doors and Wooden Frames

5. Hardware

6. Paints and Tools

7. Shopping Cart

8. Checkout

9. About Us

10. Contact Us

11. Privacy Policy

12. Terms and Conditions

13. Admin Login

14. Admin Dashboard



Create a consistent header with the business name/logo, navigation links, search icon or search bar, shopping cart icon with item count, and a mobile hamburger menu.



Create a professional footer containing the business name, supplied address, phone number, useful page links, and WhatsApp contact option.



4. Homepage



Design a premium homepage containing:



- A hero banner with the heading “Quality Timber. Reliable Hardware.”

- Supporting text: “Your trusted destination for timber, plywood, doors, and hardware supplies.”

- A primary “Shop Products” button.

- A secondary “Enquire on WhatsApp” button.

- Featured product categories with appropriate images.

- Popular products, populated from the product database.

- A section introducing the two business divisions: timber and hardware.

- A “Why Choose Us?” section using general service-oriented content without inventing claims about years of experience, certifications, or awards.

- A contact section displaying the provided address and phone number.

- A prominent WhatsApp contact button.



Use sample images initially. Make it easy to replace them with actual shop and product photographs later.



5. Product Catalogue and Categories



Create a functional product catalogue with these categories:



- Timber and plywood

- Doors and wooden frames

- Paints

- Hand tools

- Nails and screws

- Locks and hinges

- General hardware



Each product should support:



- Product name

- Unique product ID or SKU

- Category

- Description

- Product image

- Price in Indian Rupees (INR)

- Optional discount price

- Stock quantity

- Availability status

- Product unit, such as piece, pack, litre, sheet, or other appropriate unit

- Optional size, material, colour, or brand variants



These fields must be editable in the admin dashboard.



Build working search, category filters, sorting, and product detail pages.



Allow sorting by price and name. Add clear empty states when no products match the search.



IMPORTANT: Populate the initial catalogue with clearly identified DEMO products and placeholder prices. Never present invented prices or stock quantities as the shop's real data. Make all sample data easy for the administrator to replace before launch.



6. Shopping Cart



Implement a functional shopping cart.



Features:



- Add products to the cart.

- Increase or decrease quantities.

- Remove items.

- Display product images, names, unit prices, quantities, and line totals.

- Display subtotal and the final calculated total.

- Validate quantities against available stock when real stock data is configured.

- Persist the cart across page navigation and browser refreshes.

- Show a clear empty-cart message with a button to continue shopping.



Calculate totals from trusted product data, not from prices supplied by the browser.



Do not add unconfigured taxes, delivery charges, or discounts. Display these separately only when the relevant settings are configured.



7. Checkout and WhatsApp Ordering



The preferred initial ordering method is WhatsApp.



Create a checkout form containing:



- Customer full name

- Mobile number

- Delivery or collection preference

- Delivery address, if delivery is selected

- Optional order notes



Validate required fields and phone number format. Show understandable error messages.



When the customer submits the form:



1. Validate the cart and customer details.

2. Generate a readable order summary containing product names, quantities, unit prices, and the calculated subtotal.

3. Prepare a WhatsApp message addressed to +91 6385743172 using a properly URL-encoded WhatsApp link.

4. Open WhatsApp with the order summary prefilled so the customer can review and send it.

5. Show a clear notice that the order is only an enquiry until the shop confirms it.



Do not falsely show an order as confirmed simply because WhatsApp was opened. Do not collect or store payment card details.



Keep WhatsApp ordering separate from actual online payment processing.



If an order database is configured, save a pending enquiry securely and generate a unique reference number. Avoid creating duplicate orders on repeated submissions.



8. Secure Admin Dashboard



Create a separate admin login and protected dashboard for the shop owner.



Admin features:



- Dashboard overview.

- Add new products.

- Edit product details.

- Delete products with confirmation.

- Upload and replace product images.

- Manage categories.

- Update prices and discounts.

- Update stock quantities and availability.

- View and manage customer enquiries or orders when order storage is configured.

- Change order status where supported.

- View essential business contact settings.



The dashboard should be responsive and easy for a non-technical shop owner to use.



SECURITY REQUIREMENTS:



- Use a proper authentication system, preferably Supabase Auth if Supabase is selected.

- Never hardcode admin passwords or expose secrets in frontend code.

- Protect admin pages using authentication.

- Enforce authorization on the backend/database, not just by hiding admin links.

- If Supabase is used, configure Row Level Security (RLS) policies for products, admin-only operations, customer enquiries, and order data.

- Public users must not be able to create admin accounts or modify products and prices.

- Store privileged credentials only in secure server-side secrets.

- Validate and sanitize inputs on the server.

- Restrict uploaded image file types and sizes.

- Do not expose customer personal information to unauthorized users.



Create an initial admin setup procedure. Do not invent admin credentials. Explain how the owner can securely create the first administrator account.



9. Technology Stack



Use Lovable's supported React and TypeScript setup with clean, reusable components.



Recommended technologies:



- React and TypeScript

- Tailwind CSS or the supported styling system

- React Router or an equivalent routing solution

- Supabase for database, authentication, and product image storage, if backend functionality is required

- Lucide icons or an equivalent consistent icon library



Use a suitable data structure for products, categories, users, enquiries, and orders.



Create reusable components for the header, footer, product cards, category filters, cart items, forms, and admin tables.



Use proper loading states, error handling, success messages, and empty states.



Do not rely on static frontend arrays as the permanent database. Sample data may be used during development, but clearly explain how it is replaced by real database records.



10. Contact and Location



Display the supplied business details accurately:



Sri Amman Marailaipagam & Senthivelan Hardwares



Thiruvapadi, Kattumavadi Road, Aranthangi Taluk, Pudukkottai District, Tamil Nadu, India – 614630



Phone / WhatsApp: +91 6385743172



Add working Call and WhatsApp links.



Include a Google Maps directions link based on the supplied address. Do not invent exact coordinates or claim the pin is verified. If the address cannot be resolved precisely, allow the owner to replace the directions link with the verified shop location.



Do not fabricate business opening hours, email addresses, or social media profiles.



11. Future-Ready Product Management



Make the website easy to maintain as the business grows.



- Support additional product categories.

- Support multiple images per product where practical.

- Keep prices and stock manageable through the admin dashboard.

- Keep components modular and reusable.

- Allow the business to replace sample images with real photos without redesigning the site.

- Make it possible to add an online payment gateway later without pretending payment functionality already exists.



12. Testing and Quality Assurance



Before completing the project, test:



- All navigation links and routes.

- Mobile navigation.

- Product search and filters.

- Product detail pages.

- Cart quantity changes and removal.

- Correct subtotal calculations.

- Checkout validation.

- WhatsApp message generation and recipient number.

- Admin login and logout.

- Unauthorized access to admin functions.

- Product creation, editing, and deletion.

- Database permissions and RLS policies, if Supabase is connected.

- Responsive layouts and accessible form controls.

- Loading, error, and empty states.



Fix errors rather than merely listing them.



Do not claim features are working if they have not been implemented or tested. Clearly identify anything requiring external configuration.



13. Build Process and Final Instructions



Build the website in a structured way, beginning with the responsive design and core navigation, then implement the catalogue, cart, checkout, WhatsApp ordering, backend integration, and admin dashboard.



Do not stop after creating only the homepage. Continue until the requested functionality is implemented, or clearly identify any unfinished parts and the steps needed to complete them.



Use realistic-looking sample content but label all demo products and prices clearly. Never invent real business data.



After implementation, provide a concise setup guide covering:



1. How to preview the website.

2. How to connect and configure Supabase, if used.

3. How to securely create the first admin account.

4. How to replace sample products, images, prices, and stock with real information.

5. How to test WhatsApp enquiries.

6. What remains before the website is ready for real customers.

7. How to publish the website later using a custom domain if desired.



The final result should be a polished, trustworthy, fully responsive timber and hardware e-commerce website for Sri Amman Marailaipagam & Senthivelan Hardwares, with a premium brown-and-cream visual identity and WhatsApp-based customer ordering.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://timber-and-hardware-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/03730c82-8d36-5605-90c3-620cb259e8fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
