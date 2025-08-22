"use client"

import { useChat, type UseChatOptions } from "@ai-sdk/react"

import { cn } from "@/lib/utils"
import { transcribeAudio } from "@/lib/audio-utils"
import { Chat } from "@/components/ui/chat"
import { AI_ANALYZE_URL } from "@/urls"
import { toast, Toaster } from "sonner"

// Suggestions shown when the chat is empty
const DEFAULT_SUGGESTIONS = [
  "What is the capital of England?",
  "What is Newton's 2nd law",
  "Design a simple algorithm to find the longest palindrome in a string.",
]

type ChatBotProps = {
  /**
   * Optional initial messages displayed in the chat (e.g. demo conversation).
   */
  initialMessages?: UseChatOptions["initialMessages"]
  /**
   * Additional utility class names for the outer container.
   */
  className?: string
}


export default function ChatBot({ initialMessages, className }: ChatBotProps) {

  const user_id = Number(localStorage.getItem('user_id'))

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    status,
    setMessages,
  } = useChat({
    initialMessages,
    api: `${AI_ANALYZE_URL}/question`,
    body: {
      "user_id": user_id
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const isLoading = status === "submitted" || status === "streaming"

  return (
    <div className={cn("flex", "flex-col", "w-full", className)}>
      <Toaster richColors position="top-center"/>
      <Chat
        className="grow"
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        transcribeAudio={transcribeAudio}
        suggestions={DEFAULT_SUGGESTIONS}
      />
    </div>
  )
}