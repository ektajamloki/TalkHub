import React from 'react';
import { Message, Role } from '../types';
import { Icons } from './Icon';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${
          isUser 
            ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white ring-2 ring-white' 
            : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white ring-2 ring-white'
        }`}>
          {isUser ? <Icons.User className="w-4 h-4" /> : <Icons.Bot className="w-4 h-4" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
            isUser 
              ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-sm shadow-indigo-200' 
              : message.isError 
                ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm'
                : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
          }`}>
             {message.content}
          </div>
          
          <span className={`text-[10px] mt-1.5 px-1 font-medium ${isUser ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;