# Nova - Personalized News Aggregator SaaS

A modern, full-stack news aggregator application built with Next.js 14, featuring AI-powered personalization, reading mode, favorites, and premium features.

## Features

### Core Features
- **News Aggregation**: Integrates with NewsAPI.org to fetch articles from multiple sources
- **Authentication**: Secure JWT-based authentication with NextAuth.js
- **Personalization**: AI-powered smart feed that learns from user behavior
- **Favorites**: Save and manage favorite articles
- **Reading Mode**: Distraction-free reading experience with customizable font and dark mode
- **Filtering**: Advanced filtering by topic, source, date, and region

### Premium Features
- **AI Summaries**: Generate concise summaries of articles (rate-limited for free users)
- **Smart Feed**: Personalized feed based on reading patterns and preferences
- **Insights Dashboard**: Analytics and trends visualization
- **Dark Mode**: System-aware dark/light mode with manual toggle
- **Collections**: Organize articles into custom collections

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand, React Query
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQL Server (via Prisma)
- **Authentication**: NextAuth.js with JWT
- **AI**: OpenAI API for summaries
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- SQL Server (SQL Server Management Studio)
- NewsAPI.org API key
- OpenAI API key (for AI summaries - opciono)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nova-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Kopiraj primer fajl
cp .env.local.example .env.local

# ILI kreiraj .env.local ručno i kopiraj sadržaj iz .env.local.example
```

**Primer `.env.local` fajla:**
```env
DATABASE_URL="sqlserver://localhost:1433;database=nova_app;user=sa;password=;encrypt=true"
NEXTAUTH_SECRET="majkic-dev-secret-key-change-in-production-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEWS_API_KEY="3fd68501676944488853206a556c03c6"
OPENAI_API_KEY="your-openai-key"
```

Edit `.env.local` with your configuration:
```env
# Database Connection (SQL Server)
# Format: sqlserver://server:port;database=database_name;user=username;password=password;encrypt=true
# Primer: sqlserver://localhost:1433;database=nova_app;user=sa;password=majkic;encrypt=true
# 
# Objašnjenje:
# - server: localhost ili IP adresa SQL Server instance
# - port: 1433 je default SQL Server port
# - database: ime baze podataka (kreiraj u SSMS)
# - user: SQL Server korisničko ime (obično 'sa' za SQL Server Authentication)
# - password: lozinka za SQL Server
# - encrypt: true za sigurnu konekciju
#
# PRIMER (zameni sa svojim podacima):
DATABASE_URL="sqlserver://localhost:1433;database=nova_app;user=sa;password=majkic;encrypt=true"

# NextAuth Secret
# Ovo je tajni ključ za enkripciju JWT tokena - MORA biti siguran!
# Generiši novi sa: openssl rand -base64 32
# ILI koristi bilo koji dugi random string (minimum 32 karaktera)
# NIKADA ne deli ovaj ključ javno!
NEXTAUTH_SECRET="majkic"

# NextAuth URL
# URL tvoje aplikacije (za development koristi localhost)
NEXTAUTH_URL="http://localhost:3000"

# NewsAPI Key
# Dobij besplatni API ključ na: https://newsapi.org/register
# Format je uvek 32 karaktera (hexadecimal)
# Ovo je tvoj API ključ - možeš ga koristiti za testiranje
NEWS_API_KEY="3fd68501676944488853206a556c03c6"

# OpenAI API Key (opciono)
# Potreban samo za AI summary feature
# Dobij na: https://platform.openai.com/api-keys
# Za sada može ostati "your-openai-key" - aplikacija će raditi bez AI summary
OPENAI_API_KEY="your-openai-key"
```

### Objašnjenje konfiguracije:

**1. DATABASE_URL (SQL Server):**
- Format: `sqlserver://server:port;database=database_name;user=username;password=password;encrypt=true`
- `localhost:1433` - server i port (1433 je default SQL Server port)
- `nova_app` - ime baze podataka (kreiraj u SQL Server Management Studio)
- `sa` - SQL Server korisničko ime (obično 'sa' za SQL Server Authentication)
- `majkic` - tvoja SQL Server lozinka
- `encrypt=true` - omogućava enkripciju konekcije
- **Kako kreirati bazu u SSMS:**
  1. Otvori SQL Server Management Studio
  2. Poveži se na server (obično `localhost` ili `.\SQLEXPRESS`)
  3. Desni klik na "Databases" → "New Database"
  4. Unesi ime: `nova_app`
  5. Klikni "OK"

**2. NEXTAUTH_SECRET:**
- **VAŽNO:** Ovo je sigurnosni ključ - ne sme biti kratak ili jednostavan!
- `"majkic"` je previše kratak i nesiguran za produkciju
- **Preporučeno:** Generiši novi sa `openssl rand -base64 32` ili koristi dugi random string
- Minimum 32 karaktera za sigurnost
- **Za development može biti bilo šta, ali za produkciju MORA biti siguran**

**3. NEWS_API_KEY:**
- Format je ispravan (32 karaktera, hexadecimal)
- Ovo je tvoj API ključ - možeš ga koristiti
- Besplatni plan ima ograničenja (100 zahteva/dan)
- Za produkciju razmotri upgrade plan

**4. OPENAI_API_KEY:**
- Za sada može ostati `"your-openai-key"`
- Aplikacija će raditi bez AI summary feature-a
- Kada budeš spreman, zameni sa pravim ključem sa https://platform.openai.com/api-keys

4. Kreiraj bazu podataka u SQL Server Management Studio:
   - Otvori SQL Server Management Studio (SSMS)
   - Poveži se na SQL Server instance (obično `localhost` ili `.\SQLEXPRESS`)
   - Desni klik na "Databases" → "New Database"
   - Ime baze: `nova_app`
   - Klikni "OK"

5. Set up Prisma i migracije:
```bash
npx prisma generate
npx prisma db push
```

**Napomena:** Ako imaš problema sa konekcijom (P1000 Authentication failed):

**1. Proveri da li je SQL Server pokrenut:**
   - Otvori SQL Server Configuration Manager
   - Proveri da li je "SQL Server (MSSQLSERVER)" ili "SQL Server (SQLEXPRESS)" pokrenut
   - Ako nije, desni klik → Start

**2. Proveri instance name:**
   - Ako koristiš SQL Server Express, instance je obično `SQLEXPRESS`
   - Connection string za Express: `sqlserver://localhost\SQLEXPRESS:1433;database=nova_app;user=sa;password=TvojaLozinka;encrypt=true;trustServerCertificate=true`
   - Ili probaj: `sqlserver://.\SQLEXPRESS:1433;database=nova_app;user=sa;password=TvojaLozinka;encrypt=true;trustServerCertificate=true`

**3. Omogući SQL Server Authentication:**
   - Otvori SQL Server Management Studio (SSMS)
   - Poveži se na server (možeš koristiti Windows Authentication)
   - Desni klik na server → Properties
   - Security → Server authentication → izaberi "SQL Server and Windows Authentication mode"
   - Klikni OK
   - Restartuj SQL Server servis (SQL Server Configuration Manager → Restart)

**4. Proveri `sa` korisnika:**
   - U SSMS: Security → Logins → desni klik na `sa` → Properties
   - Proveri da li je "sa" enabled
   - Ako nemaš lozinku, postavi je: Status → Login: Enabled, SQL Server authentication: Enabled

**5. Kreiraj bazu prvo u SSMS:**
   - Otvori SSMS
   - Desni klik na "Databases" → "New Database"
   - Ime: `nova_app`
   - Klikni OK

**6. Alternativa - Windows Authentication:**
   Ako ne možeš da koristiš SQL Server Authentication, probaj Windows Authentication:
   ```
   DATABASE_URL="sqlserver://localhost:1433;database=nova_app;trusted_connection=true;encrypt=true;trustServerCertificate=true"
   ```
   Ili za Express:
   ```
   DATABASE_URL="sqlserver://localhost\SQLEXPRESS:1433;database=nova_app;trusted_connection=true;encrypt=true;trustServerCertificate=true"
   ```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nova-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── news/             # News-related components
│   ├── filters/          # Filter components
│   ├── auth/             # Auth components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── api/              # API clients
│   ├── ai/               # AI utilities
│   ├── db/               # Database utilities
│   └── middleware/       # Middleware functions
├── store/                # Zustand stores
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── prisma/               # Prisma schema
```

## Database Schema

The application uses Prisma ORM with SQL Server and the following main models:
- `User`: User accounts with plan information
- `UserPreferences`: User preferences and settings
- `Favorite`: Saved articles
- `Collection`: User-created collections
- `AISummary`: Cached AI-generated summaries
- `UserInteraction`: Tracks user behavior for personalization

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (via NextAuth)
- `GET /api/auth/me` - Get current user

### News
- `GET /api/news` - Fetch news articles
- `GET /api/news/trending` - Get trending news
- `GET /api/news/personalized` - Get personalized feed (Premium)

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Save article to favorites
- `DELETE /api/favorites/[id]` - Remove favorite

### AI
- `POST /api/ai/summarize` - Generate article summary

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

## Monetization

The application supports three plans:

- **FREE**: Basic features, 10 AI summaries/month, 3 collections
- **PREMIUM** ($9.99/month): Unlimited summaries, smart feed, unlimited collections
- **TEAM** ($29.99/month): Everything in Premium + team features, integrations

## Development

### Database Commands
```bash
npm run db:generate  # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
```

### Building for Production
```bash
npm run build
npm start
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

