import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

// Local
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-support-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    AvatarModule,
    BadgeModule,
    TooltipModule,
    SkeletonModule,
    PageLayoutComponent
  ],
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly chatService = inject(ChatService);

  orderId: string | null = null;
  messages: ChatMessage[] = [];
  messageInput = '';
  isLoadingMessages = false;
  isSending = false;
  errorMessage = '';
  shouldScrollToBottom = false;

  // Polling interval for new messages (5 seconds)
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private readonly POLL_INTERVAL_MS = 5000;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.orderId = params.get('orderId');
      this.loadMessages();
    });

    // Start polling for new messages
    this.pollingInterval = setInterval(() => this.pollNewMessages(), this.POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadMessages(): void {
    this.isLoadingMessages = true;
    this.errorMessage = '';

    this.chatService.getMessages(this.orderId, 0, 50).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          this.messages = response.body.list || [];
          this.shouldScrollToBottom = true;
        } else {
          this.errorMessage = response.errorMessage || 'Failed to load messages.';
        }
        this.isLoadingMessages = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load messages. Please try again.';
        this.isLoadingMessages = false;
      }
    });
  }

  private pollNewMessages(): void {
    if (this.isSending || this.isLoadingMessages) return;

    this.chatService.getMessages(this.orderId, 0, 50).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          const newMessages = response.body.list || [];
          if (newMessages.length !== this.messages.length) {
            this.messages = newMessages;
            this.shouldScrollToBottom = true;
          }
        }
      },
      error: () => { /* Silently ignore polling errors */ }
    });
  }

  sendMessage(): void {
    const text = this.messageInput.trim();
    if (!text || this.isSending) return;

    this.isSending = true;
    this.errorMessage = '';

    this.chatService.sendMessage(text, this.orderId).subscribe({
      next: (response) => {
        if (response.errorCode === 0 && response.body) {
          this.messages = [...this.messages, response.body];
          this.messageInput = '';
          this.shouldScrollToBottom = true;
        } else {
          this.errorMessage = response.errorMessage || 'Failed to send message.';
        }
        this.isSending = false;
      },
      error: () => {
        this.errorMessage = 'Failed to send message. Please try again.';
        this.isSending = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch { /* ignore */ }
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /** Groups messages by date for date separators */
  getDateGroups(): { date: string; messages: ChatMessage[] }[] {
    const groups: { [date: string]: ChatMessage[] } = {};

    for (const msg of this.messages) {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    }

    return Object.entries(groups).map(([, messages]) => ({
      date: this.formatDate(messages[0].createdAt),
      messages
    }));
  }

  get skeletonRows(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get chatHeaderTitle(): string {
    return this.orderId ? `Support · Order #${this.orderId}` : 'Support Chat';
  }
}
