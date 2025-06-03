# SparkReply 🚀

An AI-powered social media reply generator that helps you create viral, engaging responses for Twitter/X and craft personalized direct messages. Built with React, TypeScript, Supabase, and OpenRouter AI.

## ✨ Features

### 🔥 Viral Reply Generator
- **Dual Input Support**: Generate replies from tweet URLs or direct text input
- **4 Reply Styles**: Contrarian, Insight, Story, and Question formats
- **Viral Optimization**: AI-trained to create scroll-stopping, engagement-driving responses
- **Character Limit**: All replies optimized for Twitter's 280-character limit
- **Goal-Oriented**: Customize replies based on your specific objectives

### 💬 DM Generator
- **Personalized Messages**: Create tailored direct messages for networking and outreach
- **Context-Aware**: Incorporates recipient information and your goals
- **Professional Tone**: Maintains authenticity while maximizing response rates

### 🎯 Smart Features
- **Real-time Tweet Analysis**: Fetches tweet metadata, engagement metrics, and author info
- **Content Library**: Save and organize your best-performing replies
- **User Authentication**: Secure login with Supabase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **React Router** for navigation

### Backend
- **Supabase** for database and authentication
- **Supabase Edge Functions** for serverless AI processing
- **OpenRouter API** for AI model access (Claude 3 Sonnet)
- **Twitter API v2** for tweet data fetching

### AI & APIs
- **OpenRouter**: Access to Claude 3 Sonnet for high-quality text generation
- **Twitter API**: Real-time tweet data and metadata
- **Custom Prompts**: Optimized for viral content creation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- OpenRouter API key
- Twitter API Bearer Token (optional, for tweet URL support)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/momenweb/SparkReply.git
   cd SparkReply
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Set up the following environment variables in your Supabase project:
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `TWITTER_BEARER_TOKEN`: Your Twitter API Bearer Token (optional)

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy reply-generator --use-api
   supabase functions deploy dm-generator --use-api
   ```

6. **Start the development server**
   ```bash
npm run dev
   # or
   bun dev
   ```

## 📁 Project Structure

```
SparkReply/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── ...             # Custom components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and API clients
│   ├── pages/              # Page components
│   └── main.tsx           # App entry point
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── reply-generator/
│   │   └── dm-generator/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── ...                    # Config files
```

## 🔧 Configuration

### OpenRouter Setup
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add it to your Supabase project's environment variables

### Twitter API Setup (Optional)
1. Create a Twitter Developer account
2. Create a new app and get your Bearer Token
3. Add it to your Supabase project's environment variables

### Supabase Setup
1. Create a new project at [Supabase](https://supabase.com/)
2. Copy your project URL and anon key to `.env`
3. Run the database migrations
4. Deploy the edge functions

## 🎯 Usage

### Reply Generator
1. Choose between Tweet URL or Direct Text input
2. Paste a Twitter/X URL or enter text directly
3. Optionally add your goal and context
4. Generate 4 different viral reply styles
5. Copy or save your favorite replies

### DM Generator
1. Enter recipient information
2. Specify your outreach goal
3. Add context about yourself
4. Generate personalized DM
5. Copy and send

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Backend (Supabase)
- Edge functions are deployed via Supabase CLI
- Database migrations run automatically
- Environment variables set in Supabase dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI model access
- [Supabase](https://supabase.com/) for backend infrastructure
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email support@sparkreply.com or open an issue on GitHub.

---

**Made with ❤️ by [Momen](https://github.com/momenweb)**
