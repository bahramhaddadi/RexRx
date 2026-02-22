import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  GetChatMessagesRequest,
  GetChatMessagesResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
  GetChatTicketsRequest,
  GetChatTicketsResponse,
} from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiService = inject(ApiService);

  /**
   * Fetches chat messages for a given order (or general support chat)
   * @param orderId Optional order ID to filter messages
   * @param pageNumber Page number (0-indexed)
   * @param pageSize Number of messages per page
   */
  getMessages(
    orderId: string | null = null,
    pageNumber: number = 0,
    pageSize: number = 50
  ): Observable<GetChatMessagesResponse> {
    const request: GetChatMessagesRequest = { orderId, pageNumber, pageSize };
    return this.apiService.post<GetChatMessagesResponse>(
      '/Pharma/User/GetOrderMessages',
      { body: request.orderId }
    );
  }

  /**
   * Sends a support chat message
   * @param message The message text
   * @param orderId Optional linked order ID
   */
  sendMessage(
    message: string,
    orderId: string | null = null
  ): Observable<SendChatMessageResponse> {
    const request: SendChatMessageRequest = { message, orderId };
    return this.apiService.post<SendChatMessageResponse>(
      '/Pharma/Support/SendMessage',
      { body: request }
    );
  }

  /**
   * Fetches the list of user's support chat tickets
   * @param pageNumber Page number (0-indexed)
   * @param pageSize Number of tickets per page
   */
  getTickets(
    pageNumber: number = 0,
    pageSize: number = 20
  ): Observable<GetChatTicketsResponse> {
    const request: GetChatTicketsRequest = { pageNumber, pageSize };
    return this.apiService.post<GetChatTicketsResponse>(
      '/Pharma/Support/GetTickets',
      { body: request }
    );
  }
}
