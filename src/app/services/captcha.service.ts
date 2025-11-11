import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { CaptchaResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private readonly apiService = inject(ApiService);
  private readonly CAPTCHA_ENDPOINT = '/Pharma/Security/GetCaptcha';

  /**
   * Get CAPTCHA image and reference ID
   * @returns Observable with CAPTCHA data
   */
  getCaptcha(): Observable<CaptchaResponse> {
    return this.apiService.get<string[]>(this.CAPTCHA_ENDPOINT).pipe(
      map(response => ({
        refId: response[0],
        imageBase64: response[1]
      }))
    );
  }

  /**
   * Get the data URL for displaying the CAPTCHA image
   * @param imageBase64 - Base64 encoded image string
   * @returns Data URL string for img src
   */
  getCaptchaImageUrl(imageBase64: string): string {
    return `data:image/jpeg;base64,${imageBase64}`;
  }
}
