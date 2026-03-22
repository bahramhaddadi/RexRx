import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {
  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef
  ) {}

  /**
   * Initialize the service worker update checker
   */
  init(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('Service Worker is not enabled');
      return;
    }

    // Check for updates every 30 seconds
    this.checkForUpdates();

    // Listen for version updates
    this.handleVersionUpdates();

    // Check for unrecoverable state
    this.handleUnrecoverableState();
  }

  /**
   * Check for updates periodically
   */
  private checkForUpdates(): void {
    // Wait for app to stabilize before checking for updates
    this.appRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe() => {
        // Check for updates every 30 seconds
        interval(30000).subscribe(() => {
          this.swUpdate.checkForUpdate().then(() => {
            console.log('Checked for updates');
          }).catch(err => {
            console.error('Failed to check for updates:', err);
          });
        });
      });
  }

  /**
   * Handle version ready events (new version available)
   */
  private handleVersionUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe((evt) => {
        console.log('New version available:', evt.latestVersion);

        // Show notification to user
        const shouldUpdate = confirm(
          'A new version of the app is available. Do you want to reload to get the latest version?'
        );

        if (shouldUpdate) {
          this.activateUpdate();
        }
      });
  }

  /**
   * Handle unrecoverable state (service worker broken)
   */
  private handleUnrecoverableState(): void {
    this.swUpdate.unrecoverable.subscribe((event) => {
      console.error('Service worker in unrecoverable state:', event.reason);

      // Notify user
      const shouldReload = confirm(
        'The app is in an unrecoverable state. Do you want to reload?'
      );

      if (shouldReload) {
        window.location.reload();
      }
    });
  }

  /**
   * Activate the latest version and reload
   */
  private activateUpdate(): void {
    this.swUpdate.activateUpdate().then(() => {
      console.log('New version activated, reloading...');
      window.location.reload();
    }).catch(err => {
      console.error('Failed to activate update:', err);
    });
  }

  /**
   * Force check for updates now
   */
  forceCheckForUpdate(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then((updateFound) => {
        if (updateFound) {
          console.log('Update found!');
        } else {
          console.log('No update found');
        }
      }).catch(err => {
        console.error('Error checking for update:', err);
      });
    }
  }
}
