import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { Icons } from './components/Icon';
import { Role, Message, GeminiModel } from './types';
import { sendMessageStream } from './services/geminiService';

const SUGGESTIONS = [
  { icon: Icons.Brain, text: "Explain quantum computing to a 5-year-old" },
  { icon: Icons.Zap, text: "Write a Python script to scrape a website" },
  { icon: Icons.Sparkles, text: "Give me 5 creative date ideas" },
  { icon: Icons.MessageSquare, text: "Draft a professional email for a sick leave" },
];

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<GeminiModel>(GeminiModel.FLASH);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initial Load
  useEffect(() => {
    // Welcome Message
    setMessages([
      {
        id: uuidv4(),
        role: Role.MODEL,
        content: `Hello! I'm TalkHub running on **${currentModel}**. I'm here to help you code, write, or brainstorm. What's on your mind?`,
        timestamp: new Date()
      }
    ]);
  }, [currentModel]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Input Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (content?: string) => {
    const textToSend = content || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsgId = uuidv4();
    const userMessage: Message = {
      id: userMsgId,
      role: Role.USER,
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Placeholder for AI response
    const modelMsgId = uuidv4();
    const initialModelMessage: Message = {
      id: modelMsgId,
      role: Role.MODEL,
      content: '', // Start empty
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, initialModelMessage]);

    try {
      let accumulatedText = '';
      
      // Get history (excluding welcome message if you prefer, or just pass all except the one currently generating)
      // Since welcome is role 'model', that's fine. We pass everything up to (but not including) the placeholder
      const historyToPass = messages.slice(1);
      
      await sendMessageStream(
        currentModel,
        historyToPass,
        userMessage.content,
        (chunkText) => {
          accumulatedText += chunkText;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === modelMsgId 
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        }
      );

    } catch (error: any) {
      const errorText = error?.message || "Sorry, I encountered an error. Please try again.";
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, content: errorText, isError: true }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setMessages([
      {
        id: uuidv4(),
        role: Role.MODEL,
        content: `Started a new session with **${currentModel}**.`,
        timestamp: new Date()
      }
    ]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900 selection:bg-violet-100 selection:text-violet-900">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={startNewChat}
        currentModel={currentModel}
        onModelChange={(m) => {
          setCurrentModel(m);
        }}
        onClearHistory={() => setMessages([])}
      />

      <div className="flex-1 flex flex-col h-full w-full relative bg-gray-50/50">
        
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.4]"></div>
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-violet-200/20 blur-[100px]"></div>
          <div className="absolute top-[30%] -left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-200/20 blur-[80px]"></div>
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 md:px-6 justify-between z-10 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                TalkHub 
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 uppercase tracking-wide">
                  <Icons.Zap className="w-3 h-3" />
                  {currentModel.replace('gemini-', '').replace('-preview', '')}
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-xs font-semibold text-gray-700">TalkHub AI</span>
               <span className="text-[10px] text-gray-400">v1.0.0</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-white shadow-sm flex items-center justify-center">
               <Icons.User className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto pt-20 pb-32 px-4 md:px-6 scroll-smooth z-0">
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            
            {/* Messages */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Loading Indicator */}
            {isLoading && messages[messages.length - 1]?.role === Role.USER && (
               <div className="flex w-full mb-8 justify-start animate-in fade-in duration-300">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm ring-2 ring-white">
                       <Icons.Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-14">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                    </div>
                  </div>
               </div>
            )}
            
            {/* Empty State Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion.text)}
                    className="flex items-center gap-3 p-4 bg-white hover:bg-violet-50 border border-gray-200 hover:border-violet-200 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
                  >
                    <div className="p-2 bg-gray-50 group-hover:bg-white rounded-lg text-gray-500 group-hover:text-violet-600 transition-colors">
                      <suggestion.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-violet-900">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent z-10">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
            <div className="relative flex items-end bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
               <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 pl-6 pr-14 py-4 focus:outline-none resize-none max-h-40"
                style={{ minHeight: '60px' }}
              />
              <div className="pb-2.5 pr-2.5">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                    inputValue.trim() && !isLoading
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95' 
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Icons.Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="text-center mt-3">
               <p className="text-[10px] font-medium text-gray-400">
                 TalkHub can make mistakes. Consider checking important information.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;