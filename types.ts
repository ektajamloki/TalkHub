export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export enum GeminiModel {
  FLASH = 'gemini-3.8-flash',
  PRO = 'gemini-3.1-pro-preview',
  FLASH_LITE = 'gemini-3.1-flash-lite'
}
