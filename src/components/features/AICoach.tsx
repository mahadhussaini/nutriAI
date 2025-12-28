'use client'

import { useState, useRef, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
// Removed direct AI service import - now using API routes
import { generateId } from '@/lib/utils'
import { Send, Bot, User, Loader2, Lightbulb, Heart, Zap, Apple } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatMessage, ChatSession } from '@/types'

const quickQuestions = [
  { icon: Apple, text: "What's a healthy snack under 200 calories?" },
  { icon: Zap, text: "Suggest a protein-rich breakfast" },
  { icon: Heart, text: "How can I improve my heart health?" },
  { icon: Lightbulb, text: "Tips for staying hydrated" }
]

export default function AICoach() {
  const { profile, chatSessions, activeChatSession, addChatSession, setActiveChatSession } = useUserStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load active chat session or create a new one
    if (activeChatSession) {
      const session = chatSessions.find(s => s.id === activeChatSession)
      if (session) {
        setMessages(session.messages)
      }
    } else {
      // Create initial welcome message
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        content: `Hello${profile?.name ? ` ${profile.name}` : ''}! I'm your AI nutrition coach. I'm here to help you with healthy eating advice, meal suggestions, and answer any nutrition questions you might have. How can I assist you today?`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([welcomeMessage])
    }
  }, [activeChatSession, chatSessions, profile])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim()
    if (!messageText || isLoading) return

    const userMessage: ChatMessage = {
      id: generateId(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      // Get context from recent messages
      const recentContext = updatedMessages
        .slice(-5) // Last 5 messages for context
        .filter(m => m.role === 'assistant')
        .map(m => m.content)

      // Call AI chat API route
      const apiResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          userProfile: profile || undefined,
          context: recentContext,
        }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await apiResponse.json()
      const response = data.response

      const assistantMessage: ChatMessage = {
        id: generateId(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)

      // Save chat session
      if (!activeChatSession) {
        const newSession: ChatSession = {
          id: generateId(),
          userId: profile?.id || 'anonymous',
          messages: finalMessages,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        addChatSession(newSession)
        setActiveChatSession(newSession.id)
      } else {
        // Update existing session - this would typically be done via API
        const sessionIndex = chatSessions.findIndex(s => s.id === activeChatSession)
        if (sessionIndex >= 0) {
          chatSessions[sessionIndex].messages = finalMessages
          chatSessions[sessionIndex].updatedAt = new Date()
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className="h-[600px] flex flex-col card-hover">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          AI Nutrition Coach
        </CardTitle>
        <CardDescription>
          Get personalized nutrition advice and healthy eating tips
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="flex-shrink-0">
            <p className="text-sm text-muted-foreground mb-2">Quick questions to get started:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question.text)}
                  className="justify-start h-auto py-2 px-3 text-left button-hover hover-lift"
                  disabled={isLoading}
                >
                  <question.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-xs">{question.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 flex space-x-2">
          <Input
            ref={inputRef}
            placeholder="Ask me anything about nutrition..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
            className="button-hover hover-lift gradient-primary"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 spinner" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}