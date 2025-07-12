# ANKID - AI-Powered Learning Platform

A gamified learning adventure app with AI tutoring capabilities powered by Google Gemini.

## 🚀 Features

- **AI Tutor**: Chat with an intelligent AI tutor powered by Google Gemini
- **Collection Management**: Organize your learning materials
- **Marketplace**: Trade and discover new content
- **Quest System**: Gamified learning achievements
- **Leaderboards**: Compete with other learners
- **Dashboard**: Track your learning progress

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Google Gemini API**
   
   a. Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   
   b. Update the `.env.local` file with your API key:
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🤖 AI Tutor Features

- **Real-time Chat**: Ask questions and get instant educational responses
- **Auto-scroll**: Chat automatically scrolls to show latest messages
- **Quick Topics**: Pre-defined learning subjects for easy access
- **Educational Context**: AI responses are optimized for learning and education
- **Error Handling**: Graceful fallbacks if API is not configured

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for AI responses | Yes |

## 🎨 Design System

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom Material 3 design system
- **Typography**: UT Breado Sans font
- **Colors**: Navy blue (#1a237e) and light pink (#f8bbd9)
- **Icons**: Lucide React

## 🚦 Getting Started with AI Tutor

1. Navigate to the "AI Tutor" tab
2. Type any learning question in the chat input
3. Use quick topic buttons for common subjects
4. Chat with the AI for personalized learning assistance

The AI tutor is designed to help with:
- Math problems and concepts
- Science explanations
- History facts and timelines
- Language learning assistance
- Study tips and techniques

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main application component
│   ├── globals.css       # Global styles and design system
│   └── layout.tsx        # Root layout
└── components/           # Reusable components (future)
```
