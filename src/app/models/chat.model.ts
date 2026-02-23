/**
 * Sender type IDs as returned by the API
 * 0 = System Generic Message
 * 1 = Doctor Assigned
 * 3 = Doctor Message
 * 5 = User Message
 */
export type SenderTypeId = 0 | 1 | 3 | 5;

/**
 * A single chat message matching the API response structure
 */
export interface ChatMessage {
  id: number;
  orderId: string;
  senderId: string;
  senderTypeId: SenderTypeId;
  senderType: string;
  senderName: string;
  senderImageUrl: string;
  message: string;
  messageDate: string; // ISO date string
  unreadMessages: number;
}

/**
 * A group of messages under a single date, as returned by the API
 */
export interface MessageGroup {
  dateOnly: string; // e.g. "3 Feb"
  messages: ChatMessage[];
}

/**
 * Response from GetOrderMessages endpoint
 */
export interface GetChatMessagesResponse {
  body: {
    messageGroups: MessageGroup[];
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
