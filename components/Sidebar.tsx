import React from 'react';
import { Icons } from './Icon';
import { GeminiModel } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  currentModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  onClearHistory: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  currentModel, 
  onModelChange,
  onClearHistory
}) => {
  
  const models = [
    { id: GeminiModel.FLASH, name: 'Flash 3.8', icon: Icons.Zap, desc: 'Fast & Recommended' },
    { id: GeminiModel.FLASH_LITE, name: 'Flash Lite 3.1', icon: Icons.Sparkles, desc: 'Ultra Fast' },
    { id: GeminiModel.PRO, name: 'Pro 3.1', icon: Icons.Brain, desc: 'Advanced Reasoning' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out z-50 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full text-slate-300">
          
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Icons.Bot className="w-5 h-5 text-white" />
              </div>
              <span>TalkHub</span>
            </div>
            <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-4 pb-6">
            <button 
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full group flex items-center justify-center gap-2 bg-white text-slate-900 py-3 px-4 rounded-xl hover:bg-violet-50 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <Icons.Plus className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
              New Conversation
            </button>
          </div>

          {/* Model Selection */}
          <div className="px-4 py-2 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">AI Model</h3>
            <div className="space-y-2">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onModelChange(m.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                    currentModel === m.id 
                      ? 'bg-slate-800 border-slate-700 text-white shadow-md' 
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${currentModel === m.id ? 'bg-slate-700 text-violet-400' : 'bg-slate-800/50 text-slate-500 group-hover:text-slate-300'}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className={`text-[10px] ${currentModel === m.id ? 'text-slate-400' : 'text-slate-600'}`}>{m.desc}</div>
                  </div>
                  {currentModel === m.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
             <button 
              onClick={onClearHistory}
              className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-all text-sm font-medium"
            >
              <Icons.Trash2 className="w-4 h-4" />
              Clear History
            </button>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-600 font-medium">Powered by Gemini</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;