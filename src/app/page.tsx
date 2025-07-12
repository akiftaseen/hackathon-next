'use client';

import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  BookOpen, 
  Zap, 
  Plus, 
  Trophy, 
  Sparkles, 
  Flame, 
  Gem, 
  Layers,
  ArrowLeft,
  XCircle,
  CheckCircle,
  Star,
  Users,
  Crown,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

// Types
interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mastered: boolean;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalCards: number;
  masteredCards: number;
  gems: number;
  coins: number;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  type: string;
  progress: number;
  target: number;
}

interface MarketplaceListing {
  id: number;
  cardId: number;
  seller: string;
  price: number;
  type: string;
  front: string;
  back: string;
  subject: string;
  difficulty: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
}

export default function ANKIDApp() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [newCard, setNewCard] = useState<{ front: string; back: string; subject: string; difficulty: 'Easy' | 'Medium' | 'Hard' }>({ 
    front: '', 
    back: '', 
    subject: '', 
    difficulty: 'Easy' 
  });
  
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 350,
    xpToNext: 150,
    streak: 5,
    totalCards: 12,
    masteredCards: 8,
    gems: 35,
    coins: 250
  });

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: Date }[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI tutor. I\'m here to help you learn anything you\'d like. What would you like to study today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { id: 1, front: 'What is photosynthesis?', back: 'The process by which plants convert sunlight into energy', subject: 'Biology', difficulty: 'Easy', mastered: true },
    { id: 2, front: 'What is the capital of France?', back: 'Paris', subject: 'Geography', difficulty: 'Easy', mastered: true },
    { id: 3, front: 'What is 15 × 7?', back: '105', subject: 'Math', difficulty: 'Medium', mastered: false },
    { id: 4, front: 'Who wrote Romeo and Juliet?', back: 'William Shakespeare', subject: 'Literature', difficulty: 'Medium', mastered: false },
    { id: 5, front: 'What is the chemical symbol for gold?', back: 'Au', subject: 'Chemistry', difficulty: 'Hard', mastered: false }
  ]);

  const [quests] = useState<Quest[]>([
    { id: 1, title: 'Study Master', description: 'Study 20 cards today', reward: 50, completed: false, type: 'daily', progress: 15, target: 20 },
    { id: 2, title: 'Streak Keeper', description: 'Maintain a 7-day streak', reward: 100, completed: false, type: 'weekly', progress: 5, target: 7 },
    { id: 3, title: 'Collection Builder', description: 'Create 5 new cards', reward: 25, completed: true, type: 'daily', progress: 5, target: 5 },
    { id: 4, title: 'Knowledge Seeker', description: 'Master 10 cards', reward: 75, completed: false, type: 'weekly', progress: 8, target: 10 }
  ]);

  const [marketplaceItems] = useState<MarketplaceListing[]>([
    { id: 1, cardId: 10, seller: 'StudyMaster99', price: 50, type: 'rare', front: 'What is quantum entanglement?', back: 'A quantum mechanical phenomenon...', subject: 'Physics', difficulty: 'Hard' },
    { id: 2, cardId: 11, seller: 'BrainBox42', price: 25, type: 'common', front: 'Capital of Japan?', back: 'Tokyo', subject: 'Geography', difficulty: 'Easy' },
    { id: 3, cardId: 12, seller: 'CardCollector', price: 100, type: 'legendary', front: 'Prove Fermat\'s Last Theorem', back: 'Andrew Wiles\' proof (1995)...', subject: 'Mathematics', difficulty: 'Hard' },
    { id: 4, cardId: 13, seller: 'LanguageLover', price: 30, type: 'uncommon', front: '¿Cómo estás?', back: 'How are you? (Spanish)', subject: 'Spanish', difficulty: 'Medium' }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'StudyNinja', xp: 2847, level: 15, streak: 23 },
    { rank: 2, name: 'BrainMaster', xp: 2634, level: 14, streak: 18 },
    { rank: 3, name: 'CardWizard', xp: 2401, level: 13, streak: 31 },
    { rank: 4, name: 'You', xp: 350, level: 1, streak: 5 },
    { rank: 5, name: 'QuizKing', xp: 298, level: 1, streak: 3 }
  ]);

  const showSection = (section: string) => {
    setCurrentSection(section);
  };

  const addNewCard = () => {
    if (newCard.front && newCard.back && newCard.subject) {
      const card: Flashcard = {
        id: flashcards.length + 1,
        ...newCard,
        mastered: false
      };
      setFlashcards(prev => [...prev, card]);
      setUserStats(prev => ({ ...prev, totalCards: prev.totalCards + 1 }));
      setNewCard({ front: '', back: '', subject: '', difficulty: 'Easy' });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="ankid-paper p-8">
        <div className="text-center">
          <h2 className="ankid-section-title">Welcome back, Scholar!</h2>
          <p className="ankid-section-subtitle">Ready to continue your learning adventure?</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-xl font-bold" 
                   style={{background: 'var(--md3-primary)'}}>
                {userStats.level}
              </div>
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface-variant)'}}>Level</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                   style={{background: 'var(--md3-secondary)'}}>
                <Flame size={28} color="black" />
              </div>
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface-variant)'}}>{userStats.streak} Day Streak</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                   style={{background: 'var(--md3-primary)'}}>
                <Gem size={28} color="white" />
              </div>
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface-variant)'}}>{userStats.gems} Gems</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                   style={{background: 'var(--md3-secondary)'}}>
                <Layers size={28} color="black" />
              </div>
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface-variant)'}}>{userStats.totalCards} Cards</p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2" style={{color: 'var(--md3-on-surface-variant)'}}>
              <span>Level {userStats.level}</span>
              <span>{userStats.xpToNext} XP to next level</span>
            </div>
            <div className="ankid-progress-bar">
              <div 
                className="ankid-progress-fill"
                style={{width: `${((500 - userStats.xpToNext) / 500) * 100}%`}}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="ankid-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{background: 'var(--md3-primary-container)'}}>
              <BookOpen size={24} style={{color: 'var(--md3-primary)'}} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{color: 'var(--md3-on-surface)'}}>Continue Studying</h3>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Pick up where you left off</p>
            </div>
          </div>
          <button onClick={() => showSection('study')} className="ankid-button w-full mt-4">
            Start Session
          </button>
        </div>
        
        <div className="ankid-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{background: 'var(--md3-secondary-container)'}}>
              <Plus size={24} style={{color: 'var(--md3-secondary)'}} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{color: 'var(--md3-on-surface)'}}>Create Cards</h3>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Add new knowledge to your collection</p>
            </div>
          </div>
          <button onClick={() => showSection('collection')} className="ankid-button-secondary w-full mt-4">
            Create New
          </button>
        </div>
      </div>

      <div className="ankid-paper p-8">
        <h3 className="ankid-section-title">Today's Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Zap, label: '15 Cards Studied', progress: 75, color: 'var(--md3-primary)' },
            { icon: Trophy, label: '2 Quests Complete', progress: 100, color: 'var(--md3-secondary)' },
            { icon: Sparkles, label: '150 XP Earned', progress: 60, color: 'var(--md3-tertiary)' },
            { icon: Flame, label: 'Streak Maintained', progress: 100, color: 'var(--md3-secondary)' }
          ].map((item, index) => (
            <div key={index} className="text-center p-4 rounded-xl border" 
                 style={{
                   background: 'var(--md3-surface-container)',
                   borderColor: 'var(--md3-outline-variant)'
                 }}>
              <item.icon size={32} style={{color: item.color}} className="mx-auto mb-2" />
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface)'}}>{item.label}</p>
              <div className="ankid-progress-bar mt-2 h-1">
                <div className="ankid-progress-fill" style={{width: `${item.progress}%`}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIChat = () => {
    const startListening = () => {
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
      }
    };

    const stopListening = () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };

    const speakText = (text: string) => {
      if (speechSynthesisRef.current && !isSpeaking) {
        // Cancel any ongoing speech
        speechSynthesisRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        speechSynthesisRef.current.speak(utterance);
      }
    };

    const stopSpeaking = () => {
      if (speechSynthesisRef.current && isSpeaking) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
    };

    const sendMessage = async () => {
      if (!currentMessage.trim()) return;
      
      const userMessage = { role: 'user' as const, content: currentMessage, timestamp: new Date() };
      const messageToSend = currentMessage;
      setChatMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      setIsLoading(true);
      
      try {
        // Initialize Gemini AI
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          throw new Error('Please set your Gemini API key in .env.local');
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Create educational context for better responses
        const prompt = `You are an AI tutor helping students learn. Please provide a clear, educational, and engaging response to this question: "${messageToSend}". 

If the question is about a specific subject, explain concepts step by step. If it's a general question, provide helpful learning guidance. Keep your response informative but concise (2-3 paragraphs max). Since this will be spoken aloud, use natural conversational language.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponseText = response.text();
        
        const aiResponse = {
          role: 'assistant' as const,
          content: aiResponseText,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, aiResponse]);
        
        // Automatically speak the AI response
        setTimeout(() => {
          speakText(aiResponseText);
        }, 500);
        
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        const errorResponse = {
          role: 'assistant' as const,
          content: `I'm sorry, I encountered an error. ${error instanceof Error ? error.message : 'Please make sure your Gemini API key is set correctly in .env.local file.'} 

You can get a free API key from: https://aistudio.google.com/app/apikey

For now, here's a helpful response: I'd be happy to help you learn about "${messageToSend}". Please try again once your API key is configured!`,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        <div className="ankid-paper p-6 mb-6">
          <h2 className="ankid-section-title">AI Tutor - Speech Mode</h2>
          <p className="ankid-section-subtitle">Speak to learn! Ask me anything with your voice.</p>
          
          {/* Speech Status Indicators */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isListening ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              <span className="text-sm">{isListening ? 'Listening...' : 'Ready to listen'}</span>
            </div>
            
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isSpeaking ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isSpeaking ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="text-sm">{isSpeaking ? 'Speaking...' : 'Ready to speak'}</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 ankid-paper p-6 mb-4 overflow-y-auto"
        >
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'ml-4'
                      : 'mr-4'
                  }`}
                  style={{
                    background: message.role === 'user' ? 'var(--md3-primary)' : 'var(--md3-secondary-container)',
                    color: message.role === 'user' ? 'var(--md3-on-primary)' : 'var(--md3-on-secondary-container)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <p className="mb-2 whitespace-pre-wrap flex-1">{message.content}</p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => speakText(message.content)}
                        disabled={isSpeaking}
                        className="ml-2 p-1 rounded opacity-70 hover:opacity-100 transition-opacity"
                        title="Speak this message"
                      >
                        {isSpeaking ? <Volume2 size={16} /> : <Volume2 size={16} />}
                      </button>
                    )}
                  </div>
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-4 p-4 rounded-2xl" style={{background: 'var(--md3-secondary-container)'}}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Speech Input Controls */}
        <div className="ankid-paper p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder="Speak or type your question..."
              className="flex-1 ankid-input"
              disabled={isLoading || isListening}
            />
            
            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || isSpeaking}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'ankid-button-secondary'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Stop speaking"
              >
                <VolumeX size={20} />
              </button>
            )}
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim() || isListening}
              className="ankid-button disabled:opacity-50"
            >
              Send
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Quick topics (click to speak):</span>
            {['Math help', 'Science concepts', 'History facts', 'Language learning', 'Study tips'].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setCurrentMessage(topic);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="ankid-badge cursor-pointer hover:opacity-80 transition-opacity"
                style={{background: 'var(--md3-tertiary-container)', color: 'var(--md3-on-tertiary-container)'}}
              >
                {topic}
              </button>
            ))}
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-3 rounded-lg" style={{background: 'var(--md3-surface-container)', color: 'var(--md3-on-surface-variant)'}}>
            <p className="text-sm">
              🎤 <strong>Speech Mode:</strong> Click the microphone to speak your question, or type normally. 
              AI responses will be spoken automatically. Click the speaker icon on any message to hear it again.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCollection = () => (
    <div className="max-w-6xl mx-auto">
      <div className="ankid-paper p-8 mb-8">
        <h2 className="ankid-section-title">Create New Card</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--md3-on-surface)'}}>
              Front (Question)
            </label>
            <textarea
              value={newCard.front}
              onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              style={{
                background: 'var(--md3-surface-variant)',
                borderColor: 'var(--md3-outline-variant)',
                color: 'var(--md3-on-surface)'
              }}
              rows={3}
              placeholder="Enter your question here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--md3-on-surface)'}}>
              Back (Answer)
            </label>
            <textarea
              value={newCard.back}
              onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              style={{
                background: 'var(--md3-surface-variant)',
                borderColor: 'var(--md3-outline-variant)',
                color: 'var(--md3-on-surface)'
              }}
              rows={3}
              placeholder="Enter your answer here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--md3-on-surface)'}}>
              Subject
            </label>
            <input
              type="text"
              value={newCard.subject}
              onChange={(e) => setNewCard(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              style={{
                background: 'var(--md3-surface-variant)',
                borderColor: 'var(--md3-outline-variant)',
                color: 'var(--md3-on-surface)'
              }}
              placeholder="e.g., Biology, Math, History"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--md3-on-surface)'}}>
              Difficulty
            </label>
            <select
              value={newCard.difficulty}
              onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
              className="w-full p-3 border rounded-lg"
              style={{
                background: 'var(--md3-surface-variant)',
                borderColor: 'var(--md3-outline-variant)',
                color: 'var(--md3-on-surface)'
              }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
        <button onClick={addNewCard} className="ankid-button mt-6">
          Create Card
        </button>
      </div>

      <div className="ankid-paper p-8">
        <h3 className="ankid-section-title">Your Collection</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {flashcards.map(card => (
            <div key={card.id} className="ankid-card">
              <div className="flex justify-between items-start mb-3">              <div className="ankid-badge" style={{
                background: card.difficulty === 'Easy' ? 'var(--md3-secondary-container)' : 
                           card.difficulty === 'Medium' ? 'var(--md3-tertiary-container)' : 
                           'var(--md3-primary-container)',
                color: card.difficulty === 'Easy' ? 'var(--md3-on-secondary-container)' : 
                       card.difficulty === 'Medium' ? 'var(--md3-on-tertiary-container)' : 
                       'var(--md3-on-primary-container)'
              }}>
                  {card.subject}
                </div>
                {card.mastered && <Star size={16} style={{color: 'var(--md3-secondary)'}} fill="currentColor" />}
              </div>
              <h4 className="font-semibold mb-2" style={{color: 'var(--md3-on-surface)'}}>
                {card.front}
              </h4>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>
                {card.back.length > 60 ? card.back.substring(0, 60) + '...' : card.back}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="ankid-badge">{card.difficulty}</span>
                <span className="text-xs" style={{color: card.mastered ? 'var(--md3-secondary)' : 'var(--md3-on-surface-variant)'}}>
                  {card.mastered ? 'Mastered' : 'Learning'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketplace = () => (
    <div className="max-w-6xl mx-auto">
      <div className="ankid-paper p-8 mb-8">
        <h2 className="ankid-section-title">Card Marketplace</h2>
        <p className="ankid-section-subtitle">Trade and discover new flashcards from the community</p>
        
        <div className="flex items-center space-x-4 mt-6">
          <div className="ankid-badge flex items-center space-x-2">
            <span>🪙 Your Balance: {userStats.coins}</span>
          </div>
          <div className="ankid-badge flex items-center space-x-2">
            <span>💎 Gems: {userStats.gems}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceItems.map(item => (
          <div key={item.id} className="ankid-card">
            <div className="flex justify-between items-start mb-3">
              <div className="ankid-badge" style={{
                background: item.type === 'common' ? 'var(--md3-surface-container)' :
                           item.type === 'uncommon' ? 'var(--md3-secondary-container)' :
                           item.type === 'rare' ? 'var(--md3-tertiary-container)' :
                           'var(--md3-primary-container)',
                color: item.type === 'common' ? 'var(--md3-on-surface)' :
                       item.type === 'uncommon' ? 'var(--md3-on-secondary-container)' :
                       item.type === 'rare' ? 'var(--md3-on-tertiary-container)' :
                       'var(--md3-on-primary-container)'
              }}>
                {item.type.toUpperCase()}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold">🪙 {item.price}</span>
              </div>
            </div>
            
            <h4 className="font-semibold mb-2" style={{color: 'var(--md3-on-surface)'}}>
              {item.front}
            </h4>
            <p className="text-sm mb-3" style={{color: 'var(--md3-on-surface-variant)'}}>
              {item.back.length > 80 ? item.back.substring(0, 80) + '...' : item.back}
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="ankid-badge">{item.subject}</span>
              <span className="text-xs" style={{color: 'var(--md3-on-surface-variant)'}}>
                by {item.seller}
              </span>
            </div>
            
            <button 
              className="ankid-button w-full"
              disabled={userStats.coins < item.price}
            >
              {userStats.coins >= item.price ? 'Buy Card' : 'Insufficient Coins'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuests = () => (
    <div className="max-w-4xl mx-auto">
      <div className="ankid-paper p-8 mb-8 text-center">
        <h2 className="ankid-section-title">Daily Quests</h2>
        <p className="ankid-section-subtitle">Complete challenges to earn rewards and boost your learning</p>
      </div>

      <div className="space-y-4">
        {quests.map(quest => (
          <div key={quest.id} className="ankid-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                     style={{background: quest.completed ? 'var(--md3-secondary)' : 'var(--md3-primary)'}}>
                  {quest.completed ? <CheckCircle size={24} color="black" /> : <Trophy size={24} color="white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{color: 'var(--md3-on-surface)'}}>
                    {quest.title}
                  </h3>
                  <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>
                    {quest.description}
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1" style={{color: 'var(--md3-on-surface-variant)'}}>
                      <span>Progress</span>
                      <span>{quest.progress}/{quest.target}</span>
                    </div>
                    <div className="ankid-progress-bar h-2">
                      <div 
                        className="ankid-progress-fill"
                        style={{width: `${(quest.progress / quest.target) * 100}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="ankid-badge" style={{background: 'var(--md3-secondary-container)'}}>
                  +{quest.reward} XP
                </div>
                <div className="ankid-badge mt-1">
                  {quest.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="max-w-4xl mx-auto">
      <div className="ankid-paper p-8 mb-8 text-center">
        <h2 className="ankid-section-title">Global Leaderboard</h2>
        <p className="ankid-section-subtitle">See how you rank among learners worldwide</p>
      </div>

      <div className="ankid-paper p-8">
        <div className="space-y-4">
          {leaderboard.map(entry => (
            <div key={entry.rank} className={`flex items-center justify-between p-4 rounded-lg ${
              entry.name === 'You' ? 'border-2' : 'border'
            }`} style={{
              borderColor: entry.name === 'You' ? 'var(--md3-primary)' : 'var(--md3-outline-variant)',
              background: entry.name === 'You' ? 'var(--md3-primary-container)' : 'var(--md3-surface-container)'
            }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                     style={{
                       background: entry.rank === 1 ? '#FFD700' : 
                                  entry.rank === 2 ? '#C0C0C0' : 
                                  entry.rank === 3 ? '#CD7F32' : 
                                  'var(--md3-primary)',
                       color: entry.rank <= 3 ? '#000000' : '#ffffff'
                     }}>
                  {entry.rank <= 3 ? <Crown size={20} /> : entry.rank}
                </div>
                <div>
                  <h3 className="font-semibold" style={{color: 'var(--md3-on-surface)'}}>
                    {entry.name} {entry.name === 'You' && '(You)'}
                  </h3>
                  <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>
                    Level {entry.level} • {entry.streak} day streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{color: 'var(--md3-primary)'}}>
                  {entry.xp.toLocaleString()} XP
                </div>
                <div className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>
                  #{entry.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch(currentSection) {
      case 'dashboard':
        return renderDashboard();
      case 'ai-chat':
        return renderAIChat();
      case 'collection':
        return renderCollection();
      case 'marketplace':
        return renderMarketplace();
      case 'quests':
        return renderQuests();
      case 'leaderboard':
        return renderLeaderboard();
      default:
        return <div className="text-center p-8">
          <h3 className="ankid-section-title">{currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</h3>
          <p className="ankid-section-subtitle">Coming Soon - This section is under development</p>
        </div>;
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'var(--md3-background)'}}>
      {/* Header */}
      <div className="border-b" style={{borderColor: 'var(--md3-outline-variant)'}}>
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <h1 className="text-4xl font-bold m-0" 
                  style={{
                    fontFamily: "'UT Breado Sans', 'Helvetica', 'Arial', sans-serif",
                    color: 'var(--md3-primary)'
                  }}>
                ANKID
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-4 mr-4">
                <div className="ankid-badge">
                  🪙 {userStats.coins}
                </div>
                <div className="ankid-badge" style={{background: 'var(--md3-secondary-container)', color: 'var(--md3-on-secondary-container)'}}>
                  💎 {userStats.gems}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-2 pb-4">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'ai-chat', label: 'AI Tutor' },
              { id: 'collection', label: 'Collection' },
              { id: 'marketplace', label: 'Marketplace' },
              { id: 'quests', label: 'Quests' },
              { id: 'leaderboard', label: 'Leaderboard' }
            ].map(nav => (
              <button 
                key={nav.id}
                onClick={() => showSection(nav.id)} 
                className={`ankid-nav-tab ${currentSection === nav.id ? 'active' : ''}`}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {renderCurrentSection()}
      </div>
    </div>
  );
}
