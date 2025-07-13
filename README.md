# Period Tracker App

A modern, privacy-focused period tracking application built with React, TypeScript, and Supabase.

## Features

- **Cycle Tracking**: Log and track your menstrual cycles with detailed insights
- **Symptom Logger**: Record symptoms and mood changes throughout your cycle
- **Health Monitoring**: Comprehensive health logging and tracking
- **AI Chat Assistant**: Get personalized insights and answers about your health
- **Privacy-First**: Your data stays private and secure
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

This project is built with:

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database, Auth, Functions)
- **AI Integration**: Google Gemini for chat assistance
- **Package Manager**: npm/pnpm/bun

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_REPOSITORY_URL>
   cd period-tracker-app
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```sh
   npm run dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── ChatBot.tsx     # AI chat interface
│   ├── Dashboard.tsx   # Main dashboard
│   └── ...             # Other feature components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
└── pages/              # Page components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.
