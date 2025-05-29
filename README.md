# 🦡 Project Bobcat

**Project Bobcat** is a dynamic, collaborative form-building platform designed to support the next generation of residential appraisal reports, including UAD 3.6. It empowers appraisers and developers to build, customize, and manage complex forms with advanced logic, validations, and live previews.

## 🚀 Features

- **Modular Form Builder**  
  Drag-and-drop UI for creating multi-page forms with sections and fields.

- **Advanced Field Types**  
  Supports standard inputs, calculated fields, lookup tables, image uploads, and more.

- **UAD 3.6 Compliance**  
  Built to align with Fannie Mae’s URAR Delivery Specification and MISMO standards.

- **Rules Engine & Decision Manager**  
  Configure field-level rules, validations, and business logic with a no-code interface.

- **Collaboration Tools**  
  Real-time editing, live user presence indicators, and form access management.

- **Preview & Export**  
  View forms in real-time preview mode, export to JSON/XML, and generate PDF previews.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript  
- **Styling:** Tailwind CSS, shadcn/ui  
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)  
- **Hosting:** Vercel (Frontend), Supabase (Backend)

## 📁 Project Structure

- `src/components/form-builder` — Main form builder UI components  
- `src/lib/schema` — UAD 3.6-compliant field schema and JSON models  
- `src/pages/dashboard` — User dashboard and saved forms  
- `src/pages/preview` — Public form preview mode  
- `src/pages/rules-engine` — Rules and decision manager module  
- `supabase/` — Edge functions, RLS policies, and database setup

## 🧠 Key Concepts

- **Field Schema**: Each field includes metadata, validation, layout, and optional logic rules.  
- **Rules Engine**: Define visibility, requirements, and value calculations using conditionals.  
- **Form States**: Draft, Published, Archived with user access controls.  
- **Live Collaboration**: Powered by Supabase real-time listeners and presence tracking.

## 📦 Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/bobcat.git
cd bobcat
pnpm install
pnpm dev
