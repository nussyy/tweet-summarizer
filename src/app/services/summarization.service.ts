// src/app/services/summarization.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Import the environment configuration
import { environment } from '../../environments/environment'; 

// Define an interface for the expected API response structure
interface SummarizationResponse {
  summary_text: string;
}

@Injectable({
  providedIn: 'root'
})
export class SummarizationService {

  // --- Use the token FROM the environment file ---
  private hfToken = environment.hfToken; 
  // --- ---

  private apiUrl = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

  constructor(private http: HttpClient) { }

  summarize(textToSummarize: string): Observable<string> {
    console.log('SERVICE: Text received by service:', JSON.stringify(textToSummarize));
  
    if (!this.hfToken) { 
      console.error('Hugging Face API Token is not configured in the current environment file.');

      const errorMessage = environment.production
        ? 'API token not configured for production deployment. The deployed app cannot summarize.'
        : 'API token not found in src/environments/environment.ts. Please add it for local testing.';
      return throwError(() => new Error(errorMessage));
    }
    // --- ---

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.hfToken}`, 
      'Content-Type': 'application/json'
    });

    const payload = {
      inputs: textToSummarize,
      parameters: {
        min_length: 15,
        max_length: 60
      }
    };

    console.log("Sending payload to API (using environment token):", payload);

    return this.http.post<SummarizationResponse[]>(this.apiUrl, payload, { headers }).pipe(
      map(response => {
        console.log("SERVICE: Raw API Response received:", JSON.stringify(response));
        console.log("API Response received:", response);
        if (response && Array.isArray(response) && response.length > 0 && response[0]?.summary_text) {
          return response[0].summary_text;
        } else {
          console.error('Unexpected API response structure:', response);
          throw new Error('Invalid response structure from summarization API.');
        }
      }),
      catchError(error => {
        console.error('Error calling Hugging Face API:', error);
        let errorMessage = 'Failed to summarize text. ';
        if (error.status === 401) {
            errorMessage += 'Authorization error. Check if the API token is correct and valid.';
        } else if (error.status === 503) {
            errorMessage += 'The AI model might be loading or unavailable. Please try again.';
        } else if (error.error && typeof error.error.error === 'string') {
            errorMessage += `API Error: ${error.error.error}`;
        } else if (error.message) {
            errorMessage += error.message;
        } else {
             errorMessage += 'An unknown error occurred. Check browser console.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}