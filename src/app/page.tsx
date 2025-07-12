'use client';

import { useState } from 'react';
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
  Mic,
  Settings,
  Star,
  Users,
  Crown
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
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

  const startStudySession = () => {
    setIsStudying(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const endStudySession = () => {
    setIsStudying(false);
    setShowAnswer(false);
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const markCard = (correct: boolean) => {
    const xpGain = correct ? 10 : 5;
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + xpGain,
      xpToNext: prev.xpToNext - xpGain
    }));
    
    if (correct) {
      setFlashcards(prev => prev.map(card => 
        card.id === flashcards[currentCardIndex].id 
          ? { ...card, mastered: true }
          : card
      ));
    }
    
    nextCard();
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

  const renderStudy = () => {
    if (isStudying && flashcards.length > 0) {
      const currentCard = flashcards[currentCardIndex];
      return (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={endStudySession} className="ankid-button-secondary flex items-center space-x-2">
              <ArrowLeft size={20} />
              <span>End Session</span>
            </button>
            <div className="ankid-badge">
              Card {currentCardIndex + 1} of {flashcards.length}
            </div>
          </div>

          <div className="ankid-paper p-8 text-center">
            <div className="mb-6">
              <div className="ankid-badge mb-4" style={{background: 'var(--md3-secondary-container)'}}>
                {currentCard.subject} • {currentCard.difficulty}
              </div>
              <h2 className="ankid-section-title text-2xl mb-4">
                {showAnswer ? 'Answer' : 'Question'}
              </h2>
              <p className="text-xl" style={{color: 'var(--md3-on-surface)'}}>
                {showAnswer ? currentCard.back : currentCard.front}
              </p>
            </div>

            {!showAnswer ? (
              <button onClick={() => setShowAnswer(true)} className="ankid-button">
                Show Answer
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>
                  How well did you know this?
                </p>
                <div className="flex justify-center space-x-4">
                  <button onClick={() => markCard(false)} className="ankid-button-secondary flex items-center space-x-2">
                    <XCircle size={20} />
                    <span>Didn't Know</span>
                  </button>
                  <button onClick={() => markCard(true)} className="ankid-button flex items-center space-x-2">
                    <CheckCircle size={20} />
                    <span>Got It!</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t" style={{borderColor: 'var(--md3-outline-variant)'}}>
              <button 
                onClick={prevCard} 
                disabled={currentCardIndex === 0}
                className="ankid-button-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={nextCard} 
                disabled={currentCardIndex === flashcards.length - 1}
                className="ankid-button-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="ankid-paper p-8 text-center mb-8">
          <h2 className="ankid-section-title">Study Session</h2>
          <p className="ankid-section-subtitle">Choose your study method</p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="ankid-card">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                     style={{background: 'var(--md3-primary)'}}>
                  <BookOpen size={32} color="white" />
                </div>
                <h3 className="font-semibold mb-2">Flashcard Review</h3>
                <p className="text-sm mb-4" style={{color: 'var(--md3-on-surface-variant)'}}>
                  Traditional flashcard study with spaced repetition
                </p>
                <button onClick={startStudySession} className="ankid-button w-full">
                  Start Review ({flashcards.length} cards)
                </button>
              </div>
            </div>
            
            <div className="ankid-card">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                     style={{background: 'var(--md3-secondary)'}}>
                  <Zap size={32} color="black" />
                </div>
                <h3 className="font-semibold mb-2">Quick Quiz</h3>
                <p className="text-sm mb-4" style={{color: 'var(--md3-on-surface-variant)'}}>
                  Fast-paced quiz mode for rapid learning
                </p>
                <button className="ankid-button-secondary w-full">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="ankid-paper p-8">
          <h3 className="ankid-section-title">Study Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{color: 'var(--md3-primary)'}}>
                {userStats.totalCards}
              </div>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Total Cards</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{color: 'var(--md3-secondary)'}}>
                {userStats.masteredCards}
              </div>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Mastered</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{color: 'var(--md3-tertiary)'}}>
                {Math.round((userStats.masteredCards / userStats.totalCards) * 100)}%
              </div>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1" style={{color: 'var(--md3-primary)'}}>
                {userStats.streak}
              </div>
              <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Day Streak</p>
            </div>
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

  const renderAvatar = () => (
    <div className="max-w-4xl mx-auto">
      <div className="ankid-paper p-8 mb-8 text-center">
        <h2 className="ankid-section-title">Avatar Customization</h2>
        <p className="ankid-section-subtitle">Personalize your learning companion</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="ankid-paper p-8 text-center">
          <h3 className="ankid-section-title mb-6">Your Avatar</h3>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl"
               style={{background: 'var(--md3-primary-container)'}}>
            🎓
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold" style={{color: 'var(--md3-on-surface)'}}>Study Scholar</h4>
            <p className="text-sm" style={{color: 'var(--md3-on-surface-variant)'}}>Level {userStats.level} Learner</p>
            <div className="ankid-badge">🔥 {userStats.streak} Day Streak</div>
          </div>
        </div>

        <div className="ankid-paper p-8">
          <h3 className="ankid-section-title mb-6">Customization</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3" style={{color: 'var(--md3-on-surface)'}}>Avatar Style</h4>
              <div className="grid grid-cols-4 gap-3">
                {['🎓', '🤓', '🧠', '📚', '✨', '🏆', '🔥', '⭐'].map((emoji, index) => (
                  <button key={index} className="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl hover:border-blue-500 transition-colors"
                          style={{borderColor: 'var(--md3-outline-variant)'}}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{color: 'var(--md3-on-surface)'}}>Background</h4>
              <div className="grid grid-cols-4 gap-3">
                {['#45bfdb', '#f5dd59', '#ff6b9d', '#72777b'].map((color, index) => (
                  <button key={index} className="w-12 h-12 rounded-lg border-2"
                          style={{background: color, borderColor: 'var(--md3-outline-variant)'}} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{color: 'var(--md3-on-surface)'}}>Achievements</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🏆', name: 'First Steps', unlocked: true },
                  { icon: '🔥', name: 'Streak Master', unlocked: true },
                  { icon: '📚', name: 'Bookworm', unlocked: false },
                  { icon: '🎯', name: 'Perfectionist', unlocked: false },
                  { icon: '⚡', name: 'Speed Learner', unlocked: false },
                  { icon: '👑', name: 'Legend', unlocked: false }
                ].map((achievement, index) => (
                  <div key={index} className={`p-3 rounded-lg border text-center ${
                    achievement.unlocked ? 'border-yellow-300' : 'border-gray-300'
                  }`} style={{
                    background: achievement.unlocked ? 'var(--md3-secondary-container)' : 'var(--md3-surface-variant)',
                    opacity: achievement.unlocked ? 1 : 0.5
                  }}>
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <p className="text-xs font-medium">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch(currentSection) {
      case 'dashboard':
        return renderDashboard();
      case 'study':
        return renderStudy();
      case 'collection':
        return renderCollection();
      case 'marketplace':
        return renderMarketplace();
      case 'quests':
        return renderQuests();
      case 'leaderboard':
        return renderLeaderboard();
      case 'avatar':
        return renderAvatar();
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
      <div className="border-b-2" style={{borderColor: 'var(--md3-outline-variant)'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <h1 className="text-4xl font-bold m-0" 
                  style={{
                    fontFamily: "'UT Breado Script', 'UT Breado Sans', 'Helvetica', 'Arial', sans-serif",
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
              <button className="p-3 rounded-full border-2 transition-all duration-200"
                      style={{
                        background: 'var(--md3-surface-variant)',
                        borderColor: 'var(--md3-outline-variant)',
                        color: 'var(--md3-on-surface-variant)'
                      }}>
                <Mic size={20} />
              </button>
              <button className="p-3 rounded-full border-2 transition-all duration-200"
                      style={{
                        background: 'var(--md3-surface-variant)',
                        borderColor: 'var(--md3-outline-variant)',
                        color: 'var(--md3-on-surface-variant)'
                      }}>
                <Settings size={20} />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-2 pb-4">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'study', label: 'Study' },
              { id: 'collection', label: 'Collection' },
              { id: 'marketplace', label: 'Marketplace' },
              { id: 'quests', label: 'Quests' },
              { id: 'leaderboard', label: 'Leaderboard' },
              { id: 'avatar', label: 'Avatar' }
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderCurrentSection()}
      </div>
    </div>
  );
}
