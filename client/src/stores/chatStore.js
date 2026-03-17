import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversation) =>
    set({ activeConversation: conversation }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    })),

  setTyping: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),

  updateConversationLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, lastMessage: message } : c
      ),
    })),
}))
