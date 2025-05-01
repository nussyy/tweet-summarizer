
import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // For *ngIf, etc.
import { FormsModule } from '@angular/forms';    // For [(ngModel)]
import { SummarizationService } from './services/summarization.service';


@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,  // Import necessary modules directly
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Properties for the template
  tweetContent: string = '';
  summary: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Inject the service
  constructor(private summarizationService: SummarizationService) {}

  // Method called by the button
  getSummary(): void {
    if (!this.tweetContent || this.tweetContent.trim().length === 0) {
      this.errorMessage = 'Please enter some text to summarize.';
      this.summary = null;
      return;
    }

    this.isLoading = true;
    this.summary = null;
    this.errorMessage = null;

    console.log('Requesting summary...');

    const textBeingSent = this.tweetContent.trim();
console.log('COMPONENT: Text being sent to service:', JSON.stringify(textBeingSent));

    this.summarizationService.summarize(this.tweetContent.trim())
      .pipe(
        finalize(() => {
          this.isLoading = false; // Always stop loading indicator
          console.log('Summarization call finished.');
        })
      )
      .subscribe({
        next: (summaryResult) => {
          
          this.summary = summaryResult;
          console.log('Summary received.');
        },
        error: (error: Error) => {
          // Display the error message from the service
          this.errorMessage = error.message;
          console.error('Summarization failed:', error);
        }
      });
  }
}