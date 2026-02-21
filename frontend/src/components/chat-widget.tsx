"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import api from "@/lib/api"; // Assuming we have an axios instance

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi there! I'm your AI health assistant. Ask me to find a doctor, e.g., 'I need a cardiologist'.", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Call Backend API
            // using local fetch for now if api lib is not set up fully, or use api.post
            // Assuming endpoint is http://localhost:8000/api/chatbot/chat/
            // But we'll use the relative path if proxy/env is set, or full path

            const response = await api.post("/chatbot/chat/", { message: userMsg.text });

            const botMsg: Message = {
                id: Date.now() + 1,
                text: response.data.message || "I found some doctors for you.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to the server.", sender: 'bot' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Trigger Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                >
                    <MessageCircle className="h-8 w-8 text-white" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="w-80 sm:w-96 shadow-2xl border-teal-100 flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="bg-teal-600 text-white rounded-t-lg px-4 py-3 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6" />
                            <CardTitle className="text-lg">AI Assistant</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-teal-700 h-8 w-8">
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                        ? 'bg-teal-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <CardFooter className="p-3 bg-white border-t shrink-0">
                        <form
                            className="flex w-full gap-2"
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        >
                            <Input
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 focus-visible:ring-teal-500"
                            />
                            <Button type="submit" size="icon" className="bg-teal-600 hover:bg-teal-700" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
