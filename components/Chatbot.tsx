import React, { useState, useEffect, useRef, useContext } from 'react';
import type { Chat } from '@google/genai';
import { ai } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import Logo from './icons/Logo';

const Chatbot: React.FC = () => {
    const { t } = useContext(LanguageContext)!;
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const systemInstruction = `You are Aqua, a friendly and knowledgeable AI assistant for the AquaCare app. Your purpose is to help users conserve water. Provide practical, actionable advice on reducing water consumption, identifying leaks, and adopting water-saving habits. You can also give tips for other family members, like parents or children. If asked for advice for someone else (e.g., 'my mother'), tailor your suggestions to be simple, clear, and easy for them to follow. Keep your responses concise, encouraging, and easy to understand. Do not go off-topic.`;
        
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
        });
        setChat(newChat);
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);


    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: messageText }] };
        setHistory(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: messageText });
            
            // Add an empty model message to the history that we can append to
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        lastMessage.parts[0].text += chunkText;
                    }
                    return newHistory;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }] };
            // Replace the empty model message with an error message
            setHistory(prev => {
                const newHistory = [...prev];
                if (newHistory[newHistory.length - 1]?.role === 'model') {
                    newHistory[newHistory.length - 1] = errorMessage;
                    return newHistory;
                }
                return [...newHistory, errorMessage];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
        setUserInput('');
    };

    const PromptStarters = () => (
        <div className="flex flex-col items-center justify-center text-center p-4">
            <Logo className="w-20 h-20 mb-4 text-cyan-500" />
            <p className="text-lg font-semibold text-white">{t('chatSubtitle')}</p>
            <div className="mt-4 space-y-2 w-full">
                <button onClick={() => sendMessage(t('chatPromptStarter1'))} className="w-full text-left text-sm p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">{t('chatPromptStarter1')}</button>
                <button onClick={() => sendMessage(t('chatPromptStarter2'))} className="w-full text-left text-sm p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">{t('chatPromptStarter2')}</button>
                <button onClick={() => sendMessage(t('chatPromptStarter3'))} className="w-full text-left text-sm p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">{t('chatPromptStarter3')}</button>
                <button onClick={() => sendMessage(t('chatPromptStarter4'))} className="w-full text-left text-sm p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">{t('chatPromptStarter4')}</button>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full max-h-full animate-slide-in-up">
            <div className="flex-grow overflow-y-auto space-y-4 p-2">
                {history.length === 0 && !isLoading && <PromptStarters />}
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold">A</div>}
                        <div 
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl whitespace-pre-wrap shadow-md animate-slide-in-up ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-lg' : 'bg-slate-700 text-slate-200 rounded-bl-lg'}`}
                            style={{ animationDuration: '0.3s' }}
                        >
                           {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {isLoading && history[history.length-1]?.role !== 'model' && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold">A</div>
                        <div className="px-4 py-2.5 rounded-2xl bg-slate-700 rounded-bl-lg">
                           <div className="flex items-center space-x-1">
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="mt-4 flex gap-3 p-1 bg-slate-800 rounded-full border border-slate-700 shadow-lg">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={t('chatPlaceholder')}
                    className="flex-grow w-full px-4 py-2 bg-transparent border-none rounded-full placeholder-slate-500 focus:outline-none focus:ring-0"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-cyan-600 text-white rounded-full p-2.5 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-95 flex-shrink-0" disabled={isLoading || !userInput.trim()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </form>
        </div>
    );
};

export default Chatbot;