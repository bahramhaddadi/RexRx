/**
 * Chat message sender type
 */
export type MessageSenderType = 'user' | 'support';

/**
 * A single chat message
 */
export interface ChatMessage {
  id: number;
  message: string;
  senderType: MessageSenderType;
  senderName: string;
  createdAt: string; // ISO date string
  isRead: boolean;
}

/**
 * Chat / support ticket info
 */
export interface ChatTicket {
  id: number;
  orderId: string | null;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
}

/**
 * Request to get chat messages
 */
export interface GetChatMessagesRequest {
  orderId?: string | null;
  pageNumber: number;
  pageSize: number;
}

/**
 * Response from get chat messages
 */
export interface GetChatMessagesResponse {
  body: {
    list: ChatMessage[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    subject: string;
    orderId: string | null;
  };
  errorCode: number;
  errorMessage: string | null;
}

/**
 * Request to send a chat message
 */
export interface SendChatMessageRequest {
  orderId?: string | null;
  message: string;
}

/**
 * Response from sending a chat message
 */
export interface SendChatMessageResponse {
  body: ChatMessage;
  errorCode: number;
  errorMessage: string | null;
}

/**
 * Request to get user chat tickets list
 */
export interface GetChatTicketsRequest {
  pageNumber: number;
  pageSize: number;
}

/**
 * Response from get chat tickets
 */
export interface GetChatTicketsResponse {
  body: {
    list: ChatTicket[];
    totalRecords: number;
  };
  errorCode: number;
  errorMessage: string | null;
}
