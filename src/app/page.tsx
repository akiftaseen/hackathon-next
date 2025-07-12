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
      content: 'Hi! I\'m your curious student friend! I love learning new things. Can you pick something you know about and help me understand it step by step? Maybe science, math, or anything you find interesting!',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isStartingListening, setIsStartingListening] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [conversationRating, setConversationRating] = useState<{
    score: number;
    feedback: string;
    improvements: string[];
    strengths: string[];
  } | null>(null);
  const [isGeneratingRating, setIsGeneratingRating] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Only auto-scroll if user is near the bottom (within 100px)
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      
      if (isNearBottom) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 100);
      }
    }
  }, [chatMessages, isLoading]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;  // Keep listening
        recognitionRef.current.interimResults = true;  // Show interim results
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setIsStartingListening(false); // Reset starting flag
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          setInterimTranscript(''); // Clear interim transcript when ending
          // Auto-restart in conversation mode
          if (isConversationMode && !isSpeaking) {
            setTimeout(() => {
              if (recognitionRef.current && isConversationMode && !isListening) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.error('Failed to restart recognition:', error);
                }
              }
            }, 1000);
          }
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // Update interim transcript for live display
          setInterimTranscript(interimTranscript);

          if (finalTranscript.trim()) {
            console.log('Final transcript:', finalTranscript);
            setCurrentMessage(finalTranscript);
            setInterimTranscript('');
            setIsListening(false);
            // Don't auto-send - wait for user to click send button
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsStartingListening(false); // Reset starting flag on error
          
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone permissions and try again.');
          } else if (event.error === 'no-speech') {
            console.log('No speech detected, stopping recognition');
          } else {
            alert(`Speech recognition error: ${event.error}`);
          }
        };

        console.log('Speech recognition initialized successfully');
        setSpeechSupported(true);
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setSpeechSupported(false);
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
      setSpeechSupported(false);
    }

    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Function to load and select the best voice
      const loadVoices = () => {
        const voices = speechSynthesisRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        
        // Prioritize natural-sounding voices
        const preferredVoices = [
          // English voices - prioritize neural/natural voices
          'Samantha', 'Alex', 'Victoria', 'Daniel', 'Karen', 'Moira',
          // Google voices (Chrome)
          'Google US English', 'Google UK English Female', 'Google UK English Male',
          // Microsoft voices (Edge)
          'Microsoft Aria Online (Natural) - English (United States)',
          'Microsoft Jenny Online (Natural) - English (United States)',
          'Microsoft Guy Online (Natural) - English (United States)',
          'Microsoft Zira Desktop - English (United States)',
          // Fallback voices
          'en-US', 'en-GB'
        ];
        
        let bestVoice = null;
        
        // Try to find the best voice
        for (const preferredName of preferredVoices) {
          bestVoice = voices.find(voice => 
            voice.name.includes(preferredName) || 
            voice.voiceURI.includes(preferredName)
          );
          if (bestVoice) break;
        }
        
        // If no preferred voice found, use a female English voice or first English voice
        if (!bestVoice) {
          bestVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
          ) || voices.find(voice => voice.lang.startsWith('en'));
        }
        
        // Final fallback to first available voice
        if (!bestVoice && voices.length > 0) {
          bestVoice = voices[0];
        }
        
        setSelectedVoice(bestVoice || null);
      };
      
      // Load voices immediately
      loadVoices();
      
      // Also load when voices change (some browsers load voices asynchronously)
      if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
        speechSynthesisRef.current.onvoiceschanged = loadVoices;
      }
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
    { id: 3, title: 'Knowledge Explorer', description: 'Complete 5 learning conversations', reward: 25, completed: true, type: 'daily', progress: 5, target: 5 },
    { id: 4, title: 'Knowledge Seeker', description: 'Master 10 cards', reward: 75, completed: false, type: 'weekly', progress: 8, target: 10 }
  ]);

  // Card data based on available card images
  const cardDatabase = [
    { 
      id: 1, 
      front: 'Hero Creation Mastery', 
      back: 'Master the art of creating compelling hero characters with unique backstories and abilities',
      subject: 'Creative Writing',
      difficulty: 'Medium',
      image: '/cards/创建英雄卡片封面-2.png',
      type: 'uncommon'
    },
    { 
      id: 2, 
      front: 'Advanced Hero Design', 
      back: 'Learn advanced techniques for designing heroes with complex motivations and character arcs',
      subject: 'Storytelling',
      difficulty: 'Hard',
      image: '/cards/创建英雄卡片封面-3.png',
      type: 'rare'
    },
    { 
      id: 3, 
      front: 'Hero Powers & Abilities', 
      back: 'Explore the balance between power levels and interesting limitations in hero design',
      subject: 'Game Design',
      difficulty: 'Medium',
      image: '/cards/创建英雄卡片封面-5.png',
      type: 'uncommon'
    },
    { 
      id: 4, 
      front: 'Legendary Hero Concepts', 
      back: 'Create heroes that become legendary through their actions and personal growth',
      subject: 'Character Development',
      difficulty: 'Hard',
      image: '/cards/创建英雄卡片封面-6.png',
      type: 'legendary'
    },
    { 
      id: 5, 
      front: 'Game Cover Design Basics', 
      back: 'Learn the fundamentals of creating eye-catching game cover art that sells',
      subject: 'Graphic Design',
      difficulty: 'Easy',
      image: '/cards/制作游戏卡片封面.png',
      type: 'common'
    },
    { 
      id: 6, 
      front: 'Advanced Cover Composition', 
      back: 'Master advanced composition techniques for professional game cover design',
      subject: 'Visual Arts',
      difficulty: 'Medium',
      image: '/cards/制作游戏卡片封面-2.png',
      type: 'uncommon'
    },
    { 
      id: 7, 
      front: 'Digital Art Mastery', 
      back: 'Advanced digital painting techniques for creating stunning game artwork',
      subject: 'Digital Art',
      difficulty: 'Hard',
      image: '/cards/制作游戏卡片封面-3.png',
      type: 'rare'
    },
    { 
      id: 8, 
      front: 'Epic Cover Design', 
      back: 'Create epic, award-winning game covers that stand out in any marketplace',
      subject: 'Professional Design',
      difficulty: 'Hard',
      image: '/cards/制作游戏卡片封面-10.png',
      type: 'legendary'
    }
  ];

  const [marketplaceItems] = useState<MarketplaceListing[]>([
    { id: 1, cardId: 1, seller: 'CreativeGuru', price: 45, type: 'uncommon', front: cardDatabase[0].front, back: cardDatabase[0].back, subject: cardDatabase[0].subject, difficulty: cardDatabase[0].difficulty },
    { id: 2, cardId: 5, seller: 'DesignPro', price: 25, type: 'common', front: cardDatabase[4].front, back: cardDatabase[4].back, subject: cardDatabase[4].subject, difficulty: cardDatabase[4].difficulty },
    { id: 3, cardId: 8, seller: 'EpicArtist', price: 120, type: 'legendary', front: cardDatabase[7].front, back: cardDatabase[7].back, subject: cardDatabase[7].subject, difficulty: cardDatabase[7].difficulty },
    { id: 4, cardId: 3, seller: 'GameMaster', price: 35, type: 'uncommon', front: cardDatabase[2].front, back: cardDatabase[2].back, subject: cardDatabase[2].subject, difficulty: cardDatabase[2].difficulty },
    { id: 5, cardId: 2, seller: 'StoryWeaver', price: 75, type: 'rare', front: cardDatabase[1].front, back: cardDatabase[1].back, subject: cardDatabase[1].subject, difficulty: cardDatabase[1].difficulty },
    { id: 6, cardId: 7, seller: 'DigitalArt_Pro', price: 65, type: 'rare', front: cardDatabase[6].front, back: cardDatabase[6].back, subject: cardDatabase[6].subject, difficulty: cardDatabase[6].difficulty }
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

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="ankid-paper p-8">
        <div className="text-center">
          <h2 className="ankid-section-title">
            <span className="fun-emoji">🎓</span> Welcome back, Scholar! <span className="fun-emoji">✨</span>
          </h2>
          <p className="ankid-section-subtitle">Ready to continue your learning adventure? <span className="fun-emoji">🚀</span></p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 group-hover:scale-110" 
                   style={{background: 'linear-gradient(135deg, var(--md3-primary) 0%, var(--md3-tertiary) 100%)'}}>
                <span className="fun-emoji">{userStats.level}</span>
              </div>
              <p className="text-sm font-bold" style={{color: 'var(--md3-on-surface-variant)'}}>
                Level <span className="fun-emoji">📈</span>
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                   style={{background: 'linear-gradient(135deg, var(--md3-secondary) 0%, var(--md3-tertiary) 100%)'}}>
                <Flame size={28} className="fun-icon" style={{color: '#ff4444'}} />
              </div>
              <p className="text-sm font-bold" style={{color: 'var(--md3-on-surface-variant)'}}>
                {userStats.streak} Day Streak <span className="fun-emoji">🔥</span>
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                   style={{background: 'linear-gradient(135deg, var(--md3-primary) 0%, var(--md3-secondary) 100%)'}}>
                <Gem size={28} className="fun-icon" color="white" />
              </div>
              <p className="text-sm font-bold" style={{color: 'var(--md3-on-surface-variant)'}}>
                {userStats.gems} Gems <span className="fun-emoji">💎</span>
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                   style={{background: 'linear-gradient(135deg, var(--md3-secondary) 0%, var(--md3-primary) 100%)'}}>
                <Layers size={28} className="fun-icon" color="white" />
              </div>
              <p className="text-sm font-bold" style={{color: 'var(--md3-on-surface-variant)'}}>
                {userStats.totalCards} Cards <span className="fun-emoji">📚</span>
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2" style={{color: 'var(--md3-on-surface-variant)'}}>
              <span className="font-bold">Level {userStats.level} <span className="fun-emoji">⭐</span></span>
              <span className="font-bold">{userStats.xpToNext} XP to next level <span className="fun-emoji">🎯</span></span>
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
        <div className="ankid-card group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                 style={{background: 'linear-gradient(135deg, var(--md3-primary) 0%, var(--md3-tertiary) 100%)'}}>
              <BookOpen size={24} className="fun-icon" color="white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{color: 'var(--md3-on-surface)'}}>
                Continue Studying <span className="fun-emoji">📖</span>
              </h3>
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface-variant)'}}>
                Pick up where you left off! <span className="fun-emoji">🎯</span>
              </p>
            </div>
          </div>
          <button onClick={() => showSection('study')} className="ankid-button w-full mt-4">
            <span className="fun-emoji">🚀</span> Start Session <span className="fun-emoji">✨</span>
          </button>
        </div>
        
        <div className="ankid-card group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                 style={{background: 'linear-gradient(135deg, var(--md3-secondary) 0%, var(--md3-tertiary) 100%)'}}>
              <Plus size={24} className="fun-icon" color="white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{color: 'var(--md3-on-surface)'}}>
                Review Collection <span className="fun-emoji">📚</span>
              </h3>
              <p className="text-sm font-medium" style={{color: 'var(--md3-on-surface-variant)'}}>
                Browse your knowledge collection! <span className="fun-emoji">�</span>
              </p>
            </div>
          </div>
          <button onClick={() => showSection('collection')} className="ankid-button-secondary w-full mt-4">
            <span className="fun-emoji">👀</span> View Collection <span className="fun-emoji">✨</span>
          </button>
        </div>
      </div>

      <div className="ankid-paper p-8">
        <h3 className="ankid-section-title">
          <span className="fun-emoji">📊</span> Today's Progress <span className="fun-emoji">🎉</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Zap, label: '15 Cards Studied', progress: 75, color: 'var(--md3-primary)', emoji: '⚡' },
            { icon: Trophy, label: '2 Quests Complete', progress: 100, color: 'var(--md3-secondary)', emoji: '🏆' },
            { icon: Sparkles, label: '150 XP Earned', progress: 60, color: 'var(--md3-tertiary)', emoji: '✨' },
            { icon: Flame, label: 'Streak Maintained', progress: 100, color: 'var(--md3-secondary)', emoji: '🔥' }
          ].map((item, index) => (
            <div key={index} className="text-center p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:rotate-1 group" 
                 style={{
                   background: 'var(--md3-surface-container)',
                   borderColor: 'var(--md3-outline-variant)'
                 }}>
              <div className="flex items-center justify-center mb-2">
                <item.icon size={32} style={{color: item.color}} className="fun-icon mr-2" />
                <span className="text-2xl fun-emoji">{item.emoji}</span>
              </div>
              <p className="text-sm font-bold" style={{color: 'var(--md3-on-surface)'}}>{item.label}</p>
              <div className="ankid-progress-bar mt-2 h-2">
                <div className="ankid-progress-fill" style={{width: `${item.progress}%`}} />
              </div>
              <p className="text-xs font-bold mt-1" style={{color: 'var(--md3-primary)'}}>
                {item.progress}% Complete! {item.progress === 100 ? '🎉' : '💪'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIChat = () => {
    const handleSpeechMessage = async (spokenText: string) => {
      if (!spokenText.trim()) return;
      
      const userMessage = { role: 'user' as const, content: spokenText, timestamp: new Date() };
      setChatMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      setIsLoading(true);
      
      // Briefly speak back the user's message for confirmation
      setTimeout(() => {
        speakText(`I heard: ${spokenText}`);
      }, 100);
      
      // Stop listening while processing
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          throw new Error('Please set your Gemini API key in .env.local');
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Build conversation history for context
        const conversationHistory = chatMessages.map(msg => 
          `${msg.role === 'user' ? 'Student' : 'AI Teacher'}: ${msg.content}`
        ).join('\n');

        // Optimized prompt for guided teaching methodology with full conversation context
        const prompt = `You are a friendly primary school teacher with expertise in child psychology. You are pretending to be a "student" who wants to learn from them, but your real goal is to GUIDE them to understanding through strategic questions.

CONVERSATION HISTORY:
${conversationHistory}

Student just said: "${spokenText}"

TEACHING STRATEGY (based on conversation flow):
1. If they give a CORRECT answer: Acknowledge it enthusiastically and provide the complete explanation to reinforce their learning
2. If they give a PARTIAL answer: Guide them to the missing pieces with specific hints
3. If they're STRUGGLING: Break it down into smaller, easier steps
4. If they're OFF-TRACK: Gently redirect with a helpful clue
5. REMEMBER what was discussed before - build on previous knowledge

GUIDED QUESTIONING APPROACH:
- Start with their level and build UP to understanding
- Each question should give them a HINT toward the answer
- When they get it right, CELEBRATE and explain the full concept
- Don't just ask random questions - each one should teach something
- Reference what they've already shared to show you're listening

EXAMPLES:
Topic: Photosynthesis
❌ Bad: "What is photosynthesis?" (too broad)
✅ Good: "I notice plants are green! What do you think that green color helps them do with sunlight?"

If they say "make food":
✅ "Exactly! You're so smart! Plants use their green parts to catch sunlight and make food. The green stuff is called chlorophyll, and it's like a tiny solar panel! What do you think plants need besides sunlight to make this food?"

RULES:
- Use simple words for ages 6-12
- 1-2 sentences maximum (spoken aloud)
- ALWAYS acknowledge correct answers before moving on
- Give helpful hints, don't just repeat questions
- When they understand, give them the complete picture as a reward
- REMEMBER and reference previous parts of the conversation

Current conversation context: Continue the learning journey based on what's been discussed. Guide them to discover the answer step by step, then celebrate their success with the full explanation.

Respond as an excited student who wants to learn:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponseText = response.text();
        
        const aiResponse = {
          role: 'assistant' as const,
          content: aiResponseText,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, aiResponse]);
        
        // Speak the response immediately
        setTimeout(() => {
          speakText(aiResponseText);
        }, 300);
        
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        const errorMessage = "Sorry, I'm having trouble connecting right now. Can you try asking again?";
        const errorResponse = {
          role: 'assistant' as const,
          content: errorMessage,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, errorResponse]);
        speakText(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    const startConversation = () => {
      setIsConversationMode(true);
      setIsListening(true);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      // Brief welcome message
      const welcomeMessage = "Hi! What would you like to learn about today?";
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
      speakText(welcomeMessage);
    };

    const stopConversation = () => {
      setIsConversationMode(false);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current && isSpeaking) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
    };

    const startListening = () => {
      // Prevent rapid clicks
      if (isStartingListening) {
        console.log('Already starting recognition, ignoring click');
        return;
      }

      if (recognitionRef.current && !isListening) {
        try {
          setIsStartingListening(true);
          console.log('Starting speech recognition...');
          
          // Check if recognition is already running
          if (recognitionRef.current.state === 'started' || recognitionRef.current.state === 'listening') {
            console.log('Speech recognition already running');
            setIsStartingListening(false);
            return;
          }
          
          recognitionRef.current.start();
          
          // Reset the starting flag after a delay
          setTimeout(() => {
            setIsStartingListening(false);
          }, 1000);
          
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setIsStartingListening(false);
          
          if (error instanceof Error && error.message.includes('already started')) {
            console.log('Recognition already started, ignoring...');
            return;
          }
          
          setIsListening(false); // Reset state on error
          alert('Speech recognition failed to start. Please check your microphone permissions.');
        }
      } else if (!recognitionRef.current) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      } else if (isListening) {
        console.log('Speech recognition already listening');
      }
    };

    const stopListening = () => {
      if (recognitionRef.current && isListening) {
        try {
          console.log('Stopping speech recognition...');
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
          setIsListening(false); // Reset state on error
        }
      }
    };

    const speakText = (text: string) => {
      if (speechSynthesisRef.current && !isSpeaking) {
        // Cancel any ongoing speech
        speechSynthesisRef.current.cancel();
        
        // Clean text for better speech (remove markdown, excessive punctuation)
        const cleanText = text
          .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markdown
          .replace(/`([^`]+)`/g, '$1')       // Remove code markdown
          .replace(/#+\s/g, '')              // Remove headers
          .replace(/\n\s*\n/g, '. ')         // Replace double newlines with periods
          .replace(/\n/g, ', ')              // Replace single newlines with commas
          .replace(/([.!?])\s*([.!?])/g, '$1 ') // Fix multiple punctuation
          .trim();
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Use selected voice if available
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Optimized settings for conversational speech
        utterance.rate = 1.2;    // Faster for natural conversation
        utterance.pitch = 1.0;   // Natural pitch
        utterance.volume = 0.9;  // Comfortable volume
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          // Don't automatically resume listening - wait for user interaction
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };
        
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
      await handleSpeechMessage(currentMessage);
    };

    const endConversation = async () => {
      if (chatMessages.length <= 1) {
        alert('Have a conversation first before getting a rating!');
        return;
      }

      setIsGeneratingRating(true);
      
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
          throw new Error('Please set your Gemini API key in .env.local');
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Build conversation history for analysis
        const conversationHistory = chatMessages
          .filter(msg => msg.content !== 'Hi! I\'m your curious student friend! I love learning new things. Can you pick something you know about and help me understand it step by step? Maybe science, math, or anything you find interesting!')
          .map(msg => `${msg.role === 'user' ? 'Student' : 'AI Teacher'}: ${msg.content}`)
          .join('\n');

        const ratingPrompt = `You are a friendly teacher helping a student understand their learning progress. Analyze this conversation to see how well the student understands the topic they talked about.

CONVERSATION TO ANALYZE:
${conversationHistory}

Please provide a JSON response with the following structure:
{
  "score": [number from 1-10, representing their knowledge level],
  "feedback": "[2-3 sentences speaking directly to the student about their understanding, using simple words]",
  "strengths": ["You understand [specific concept] really well!", "You did a great job explaining [specific thing]!", "You clearly know about [specific area]!"],
  "improvements": ["To learn more, you could [simple suggestion]", "Try learning about [specific topic] next", "Practice explaining [specific concept] in more detail"]
}

HOW TO EVALUATE THE STUDENT:
- Did they give correct information?
- How well do they understand the topic?
- Can they explain things clearly?
- Do they know how different parts connect?

SCORING GUIDE:
1-3: You're just starting to learn about this topic - that's okay!
4-5: You know some basics, but there's room to learn more
6-7: You understand the main ideas pretty well!
8-9: Wow! You really know this topic well!
10: Amazing! You're like a mini-expert on this!

WRITING STYLE:
- Talk directly to the student using "You"
- Use simple, encouraging words
- Make it feel like a helpful friend explaining things
- In "strengths": Start with "You understand..." or "You did great at..."
- In "improvements": Give specific, easy-to-follow suggestions like "Try reading about..." or "Practice explaining..."
- If they had wrong information, gently correct it: "Actually, [correct fact]. You can remember this by..."
- Make learning sound fun and achievable!`;
        
        const result = await model.generateContent(ratingPrompt);
        const response = await result.response;
        let ratingText = response.text();
        
        // Clean up the response to extract JSON
        ratingText = ratingText.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
        
        try {
          const rating = JSON.parse(ratingText);
          setConversationRating(rating);
          setShowRating(true);
          
          // Speak the rating feedback out loud
          setTimeout(() => {
            const ratingMessage = `Conversation complete! Your score is ${rating.score} out of 10. ${rating.feedback}`;
            speakText(ratingMessage);
          }, 500);
        } catch (parseError) {
          console.error('Failed to parse rating JSON:', parseError);
          // Fallback rating
          const fallbackRating = {
            score: 7,
            feedback: "You did a great job sharing what you know! You explained things clearly and showed good understanding of the topic.",
            strengths: ["You participated really well!", "You shared your knowledge clearly", "You stayed focused on learning"],
            improvements: ["Try exploring this topic in more detail", "Practice explaining the connections between different parts", "Look up some fun facts about this subject"]
          };
          setConversationRating(fallbackRating);
          setShowRating(true);
          
          // Speak the fallback rating feedback out loud
          setTimeout(() => {
            const ratingMessage = `Conversation complete! Your score is ${fallbackRating.score} out of 10. ${fallbackRating.feedback}`;
            speakText(ratingMessage);
          }, 500);
        }
        
      } catch (error) {
        console.error('Error generating rating:', error);
        // Fallback rating
        const errorFallbackRating = {
          score: 7,
          feedback: "Thanks for having a great conversation with me! You showed that you really want to learn and share knowledge.",
          strengths: ["You joined in actively", "You shared what you know", "You kept trying to learn"],
          improvements: ["Keep practicing and learning new things", "Try reading more about topics you're curious about", "Practice explaining things to friends or family"]
        };
        setConversationRating(errorFallbackRating);
        setShowRating(true);
        
        // Speak the error fallback rating feedback out loud
        setTimeout(() => {
          const ratingMessage = `Conversation complete! Your score is ${errorFallbackRating.score} out of 10. ${errorFallbackRating.feedback}`;
          speakText(ratingMessage);
        }, 500);
      } finally {
        setIsGeneratingRating(false);
      }
    };

    const startNewConversation = () => {
      setChatMessages([{
        role: 'assistant',
        content: 'Hi! I\'m your curious student friend! I love learning new things. Can you pick something you know about and help me understand it step by step? Maybe science, math, or anything you find interesting!',
        timestamp: new Date()
      }]);
      setShowRating(false);
      setConversationRating(null);
      setCurrentMessage('');
    };

    return (
      <div className="max-w-4xl mx-auto flex flex-col h-screen" style={{ height: 'calc(100vh - 120px)', maxHeight: '800px' }}>
        <div className="ankid-paper p-6 mb-6 flex-shrink-0">
          <h2 className="ankid-section-title">
            <span className="fun-emoji">🤖</span> Your Teaching Assistant <span className="fun-emoji">🎓</span>
          </h2>
          <p className="ankid-section-subtitle">
            I'm your teacher who wants to learn from YOU! <span className="fun-emoji">🌟</span> Teach me something today. <span className="fun-emoji">🚀</span>
          </p>
          
          {/* Voice Selector */}
          {availableVoices.length > 0 && (
            <div className="flex items-center justify-center mt-4 mb-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium" style={{color: 'var(--md3-on-surface)'}}>
                  Voice:
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  className="px-3 py-1 rounded-lg border text-sm"
                  style={{
                    background: 'var(--md3-surface-variant)',
                    borderColor: 'var(--md3-outline-variant)',
                    color: 'var(--md3-on-surface)'
                  }}
                >
                  {availableVoices
                    .filter(voice => voice.lang.startsWith('en'))
                    .map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name.replace(/^.*?-\s*/, '').replace(/\s*\(.*?\)/, '')} 
                        {voice.name.toLowerCase().includes('neural') ? ' ⭐' : ''}
                        {voice.name.toLowerCase().includes('natural') ? ' ⭐' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
          
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
            
            {selectedVoice && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                <span className="text-sm">🎵 {selectedVoice.name.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 ankid-paper p-6 mb-4 overflow-y-auto"
          style={{ 
            minHeight: '400px',
            maxHeight: '500px',
            height: '100%',
            scrollBehavior: 'smooth',
            overflowY: 'scroll'
          }}
        >
          {showRating && conversationRating ? (
            /* Rating Display */
            <div className="space-y-6 animate-bounce-in">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 animate-wiggle" style={{color: 'var(--md3-primary)'}}>
                  <span className="fun-emoji">🎓</span> Conversation Complete! <span className="fun-emoji">✨</span>
                </h3>
                
                {/* Score Display */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold text-white mb-4 shadow-lg transform hover:scale-110 transition-all duration-300 animate-glow-pulse"
                       style={{
                         background: conversationRating.score >= 8 ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : 
                                    conversationRating.score >= 6 ? 'linear-gradient(135deg, #FF9800, #FFC107)' : 
                                    conversationRating.score >= 4 ? 'linear-gradient(135deg, #FFC107, #FFEB3B)' : 'linear-gradient(135deg, #F44336, #E91E63)'
                       }}>
                    {conversationRating.score}/10
                    <span className="fun-emoji ml-1">
                      {conversationRating.score >= 8 ? '🌟' : 
                       conversationRating.score >= 6 ? '👍' : 
                       conversationRating.score >= 4 ? '👌' : '💪'}
                    </span>
                  </div>
                  <p className="text-lg animate-float" style={{color: 'var(--md3-on-surface)'}}>
                    <span className="fun-emoji">💭</span> {conversationRating.feedback} <span className="fun-emoji">💡</span>
                  </p>
                </div>

                {/* Strengths */}
                <div className="mb-6 p-4 rounded-lg shadow-lg hover:shadow-green-300 transition-all duration-300 transform hover:scale-105 animate-bounce-in" 
                     style={{background: 'linear-gradient(135deg, var(--md3-secondary-container), #bbf7d0)'}}>
                  <h4 className="text-lg font-bold mb-3 flex items-center justify-center animate-wiggle" 
                      style={{color: 'var(--md3-on-secondary-container)'}}>
                    <span className="fun-emoji mr-2">⭐</span> Your Strengths <span className="fun-emoji ml-2">💪</span>
                  </h4>
                  <ul className="space-y-2">
                    {conversationRating.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center text-sm hover:bg-green-100 p-2 rounded transition-all duration-200"
                          style={{color: 'var(--md3-on-secondary-container)'}}>
                        <span className="mr-2 fun-emoji">✅</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="mb-6 p-4 rounded-lg shadow-lg hover:shadow-yellow-300 transition-all duration-300 transform hover:scale-105 animate-bounce-in" 
                     style={{background: 'linear-gradient(135deg, var(--md3-tertiary-container), #fef3c7)'}}>
                  <h4 className="text-lg font-bold mb-3 flex items-center justify-center animate-wiggle"
                      style={{color: 'var(--md3-on-tertiary-container)'}}>
                    <span className="fun-emoji mr-2">🚀</span> Ways to Improve <span className="fun-emoji ml-2">📈</span>
                  </h4>
                  <ul className="space-y-2">
                    {conversationRating.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-center text-sm hover:bg-yellow-100 p-2 rounded transition-all duration-200"
                          style={{color: 'var(--md3-on-tertiary-container)'}}>
                        <span className="mr-2 fun-emoji">💡</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={startNewConversation}
                    className="ankid-button px-6 py-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-300 animate-bounce-in"
                  >
                    <span className="fun-emoji mr-2">🔄</span> Start New Conversation <span className="fun-emoji ml-2">✨</span>
                  </button>
                  <button
                    onClick={() => setShowRating(false)}
                    className="ankid-button-secondary px-6 py-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-300 animate-bounce-in"
                  >
                    <span className="fun-emoji mr-2">📖</span> Review Conversation <span className="fun-emoji ml-2">👀</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Chat Messages */
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-bounce-in`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                      message.role === 'user'
                        ? 'ml-4 hover:shadow-cyan-300'
                        : 'mr-4 hover:shadow-yellow-300'
                    }`}
                    style={{
                      background: message.role === 'user' 
                        ? 'linear-gradient(135deg, var(--md3-primary), #0891b2)' 
                        : 'linear-gradient(135deg, var(--md3-secondary-container), #fbbf24)',
                      color: message.role === 'user' ? 'var(--md3-on-primary)' : 'var(--md3-on-secondary-container)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <span className="fun-emoji text-lg">
                          {message.role === 'user' ? '🧠' : '🤖'}
                        </span>
                        <p className="mb-2 whitespace-pre-wrap flex-1">{message.content}</p>
                      </div>
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
                <div className="flex justify-start animate-bounce-in">
                  <div className="mr-4 p-4 rounded-2xl shadow-lg hover:shadow-yellow-300 transition-all duration-300" 
                       style={{background: 'linear-gradient(135deg, var(--md3-secondary-container), #fbbf24)'}}>
                    <div className="flex items-center space-x-2">
                      <span className="fun-emoji">🤖</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm opacity-70">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {isGeneratingRating && (
                <div className="flex justify-center animate-bounce-in">
                  <div className="p-4 rounded-2xl text-center shadow-lg hover:shadow-cyan-300 transition-all duration-300" 
                       style={{background: 'linear-gradient(135deg, var(--md3-primary-container), #0891b2)'}}>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="fun-emoji animate-wiggle">🎓</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-4 bg-current rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-4 h-4 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="fun-emoji animate-wiggle">📊</span>
                    </div>
                    <p style={{color: 'var(--md3-on-primary-container)'}}>
                      <span className="fun-emoji">✨</span> Analyzing your conversation and generating rating... <span className="fun-emoji">✨</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Speech Input Controls */}
        <div className="ankid-paper p-6 flex-shrink-0">
          <div className="space-y-4">
            {/* Conversation Controls */}
            {!showRating && chatMessages.length > 1 && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={endConversation}
                  disabled={isGeneratingRating || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-purple-300 disabled:opacity-50 transition-all duration-300 shadow-lg transform hover:scale-105 animate-glow-pulse"
                  style={{ fontFamily: "'Feather', 'Fredoka', sans-serif", fontWeight: "700" }}
                >
                  {isGeneratingRating ? (
                    <>
                      <span className="fun-emoji animate-wiggle mr-2">📊</span> 
                      Generating Rating... 
                      <span className="fun-emoji animate-wiggle ml-2">✨</span>
                    </>
                  ) : (
                    <>
                      <span className="fun-emoji mr-2">🏁</span> 
                      End Conversation & Get Rating 
                      <span className="fun-emoji ml-2">🎓</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Voice Input Section */}
            {!showRating && (
              <div className="flex space-x-3 p-4 bg-gradient-to-r from-cyan-50 to-pink-50 rounded-lg border border-pink-200 shadow-lg">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  placeholder="💭 Type your question or use voice input... ✨"
                  className="flex-1 p-4 border-2 border-gradient-to-r from-cyan-300 to-pink-300 rounded-lg text-lg shadow-inner hover:shadow-lg transition-all duration-300 focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400"
                  disabled={isLoading || isListening}
                  style={{ 
                    fontFamily: "'Feather', 'Fredoka', sans-serif", 
                    fontWeight: "700",
                    background: 'linear-gradient(135deg, #ffffff, #f0f9ff)'
                  }}
                />
                
                {/* Voice Input Button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading || isSpeaking || !speechSupported || isStartingListening}
                  className={`px-6 py-4 rounded-lg font-bold transition-all duration-300 text-lg shadow-lg transform hover:scale-105 ${
                    !speechSupported 
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : isStartingListening
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white cursor-wait animate-pulse'
                      : isListening 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-red-300 animate-wiggle' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-blue-300'
                  }`}
                  title={
                    !speechSupported 
                      ? 'Speech recognition not supported' 
                      : isStartingListening
                      ? 'Starting voice recognition...'
                      : isListening 
                      ? 'Stop listening' 
                      : 'Start voice input'
                  }
                  style={{ fontFamily: "'Feather', 'Fredoka', sans-serif", fontWeight: "700" }}
                >
                  {!speechSupported 
                    ? '🚫 No Mic' 
                    : isStartingListening
                    ? '⏳ Starting...'
                    : isListening 
                    ? '🛑 Stop' 
                    : '🎤 Voice'
                  }
                </button>
                
                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim() || isListening}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:shadow-green-300 disabled:opacity-50 transition-all duration-300 text-lg shadow-lg transform hover:scale-105"
                  style={{ fontFamily: "'Feather', 'Fredoka', sans-serif", fontWeight: "700" }}
                >
                  {isLoading ? '🤔 Thinking...' : '� Send'}
                </button>
              </div>
            )}

            {/* Live Transcript Display */}
            {isListening && !showRating && (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800 font-bold" style={{ fontFamily: "'Feather', sans-serif" }}>
                    Listening...
                  </span>
                </div>
                <p className="text-gray-800 text-lg min-h-[1.5rem]" style={{ fontFamily: "'Feather', sans-serif", fontWeight: "700" }}>
                  {interimTranscript || "Say something..."}
                </p>
              </div>
            )}

            {/* AI Speaking Status */}
            {isSpeaking && !showRating && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="animate-pulse text-green-600" size={20} />
                    <span className="text-green-800 font-bold" style={{ fontFamily: "'Feather', sans-serif" }}>
                      AI is speaking...
                    </span>
                  </div>
                  <button
                    onClick={stopSpeaking}
                    className="text-green-600 hover:text-green-800 underline font-bold"
                    style={{ fontFamily: "'Feather', sans-serif" }}
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            {/* Voice Selection */}
            {!showRating && (
              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="cursor-pointer text-gray-700 font-bold" style={{ fontFamily: "'Feather', sans-serif" }}>
                  🎵 Voice Settings
                </summary>
                <div className="mt-3">
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      setSelectedVoice(voice || null);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white font-bold"
                    style={{ fontFamily: "'Feather', sans-serif" }}
                  >
                    <option value="">Default Voice</option>
                    {availableVoices
                      .filter(voice => voice.lang.startsWith('en'))
                      .map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                  </select>
                </div>
              </details>
            )}

            {/* Instructions */}
            {!showRating && (
              <div className="p-4 bg-gray-100 rounded-lg">
                {!speechSupported ? (
                  <p className="text-sm text-red-600" style={{ fontFamily: "'Feather', sans-serif", fontWeight: "700" }}>
                    ⚠️ <strong>Speech recognition not supported in your browser.</strong> Please use Chrome, Edge, or Safari for voice input. You can still type your messages!
                  </p>
                ) : (
                  <p className="text-sm text-gray-600" style={{ fontFamily: "'Feather', sans-serif", fontWeight: "700" }}>
                    🎓 <strong>How it works:</strong> Share what you know about any topic! I'll ask helpful questions to guide you to deeper understanding. 
                    When you get things right, I'll celebrate and explain the complete picture to help you learn even more!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCollection = () => (
    <div className="max-w-6xl mx-auto">
      <div className="ankid-paper p-8">
        <h2 className="ankid-section-title">
          <span className="fun-emoji">📚</span> Your Collection <span className="fun-emoji">✨</span>
        </h2>
        <p className="ankid-section-subtitle">
          Browse and review your flashcard collection <span className="fun-emoji">🔍</span>
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {flashcards.map(card => (
            <div key={card.id} className="ankid-card">
              <div className="flex justify-between items-start mb-3">
                <div className="ankid-badge" style={{
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
                  {card.mastered ? 'Mastered ⭐' : 'Learning 📖'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {flashcards.length === 0 && (
          <div className="text-center py-12">
            <div className="fun-emoji text-6xl mb-4">📝</div>
            <h3 className="ankid-section-title mb-2">No Cards Yet</h3>
            <p className="ankid-section-subtitle">
              Your collection is empty. Use the Teaching Assistant to learn and create cards through conversation! <span className="fun-emoji">🎓</span>
            </p>
          </div>
        )}
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
        {marketplaceItems.map(item => {
          const cardData = cardDatabase.find(card => card.id === item.cardId);
          return (
            <div key={item.id} className="ankid-card">
              {/* Card Image */}
              {cardData?.image && (
                <div className="mb-4 relative h-48 rounded-lg overflow-hidden">
                  <img 
                    src={cardData.image} 
                    alt={item.front}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                  />
                  <div className="absolute top-2 right-2">
                    <div className="ankid-badge text-xs" style={{
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
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div className="ankid-badge" style={{
                  background: 'var(--md3-surface-container)',
                  color: 'var(--md3-on-surface)'
                }}>
                  {item.subject}
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
                <span className="ankid-badge">{item.difficulty}</span>
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
          );
        })}
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
          <div className="ankid-nav">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'dashboard', label: '🏠 Dashboard', shortLabel: '🏠' },
                { id: 'ai-chat', label: '✨ AI Tutor', shortLabel: '✨' },
                { id: 'collection', label: '📚 Collection', shortLabel: '📚' },
                { id: 'marketplace', label: '🛒 Market', shortLabel: '🛒' },
                { id: 'quests', label: '⚡ Quests', shortLabel: '⚡' },
                { id: 'leaderboard', label: '🏆 Leaders', shortLabel: '🏆' }
              ].map(nav => (
                <button 
                  key={nav.id}
                  onClick={() => showSection(nav.id)} 
                  className={`ankid-nav-button ${currentSection === nav.id ? 'active' : ''}`}
                >
                  <span className="hidden sm:inline">{nav.label}</span>
                  <span className="sm:hidden text-2xl">{nav.shortLabel}</span>
                </button>
              ))}
            </div>
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
