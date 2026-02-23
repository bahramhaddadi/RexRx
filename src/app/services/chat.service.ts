import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  GetChatMessagesResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly apiService = inject(ApiService);

  /**
   * Fetches chat messages for a given order
   * @param orderId Order ID to fetch messages for
   */
  getMessages(orderId: string | null = null): Observable<GetChatMessagesResponse> {
    return this.apiService.post<GetChatMessagesResponse>(
      '/Pharma/User/GetOrderMessages',
      { body: { orderId } }
    );
  }

  /**
   * Sends a message for a given order
   * @param message The message text
   * @param orderId Linked order ID
   */
  sendMessage(
    message: string,
    orderId: string | null = null
  ): Observable<SendChatMessageResponse> {
    const request: SendChatMessageRequest = { message, orderId };
    return this.apiService.post<SendChatMessageResponse>(
      '/Pharma/User/SendOrderMessage',
      { body: request }
    );
  }
}
