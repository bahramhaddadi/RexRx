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
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

// Local
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, MessageGroup } from '../../models/chat.model';

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
  messageGroups: MessageGroup[] = [];
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

    this.chatService.getMessages(this.orderId).subscribe({
      next: (response) => {
        if (response.body) {
          this.messageGroups = response.body.messageGroups || [];
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

    this.chatService.getMessages(this.orderId).subscribe({
      next: (response) => {
        if (response.body) {
          const newGroups = response.body.messageGroups || [];
          // Count total messages to detect new ones
          const newTotal = newGroups.reduce((sum, g) => sum + g.messages.length, 0);
          const currentTotal = this.messageGroups.reduce((sum, g) => sum + g.messages.length, 0);
          if (newTotal !== currentTotal) {
            this.messageGroups = newGroups;
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
      next: () => {
        this.messageInput = '';
        this.isSending = false;
        // Reload to get updated groups from server
        this.loadMessages();
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

  isUserMessage(msg: ChatMessage): boolean {
    return msg.senderTypeId === 5;
  }

  isSystemMessage(msg: ChatMessage): boolean {
    return msg.senderTypeId === 0;
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

  get hasMessages(): boolean {
    return this.messageGroups.some(g => g.messages.length > 0);
  }

  get skeletonRows(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get chatHeaderTitle(): string {
    return this.orderId ? `Support · Order #${this.orderId}` : 'Support Chat';
  }
}
