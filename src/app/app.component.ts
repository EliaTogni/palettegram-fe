import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  originalImage: string | null = null;      // immagine utente da visualizzare
  originalFile: File | null = null;         // file per l’invio al BE
  transformedImage: string | null = null;   // immagine trasformata da mostrare
  transformedBlob: Blob | null = null;      // blob per il download

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.originalFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.originalImage = reader.result as string;
        this.transformedImage = null;  // reset immagine trasformata
        this.transformedBlob = null;   // reset blob
      };
      reader.readAsDataURL(this.originalFile);
    }
  }

  applyTransformation() {
    if (!this.originalFile) return;

    const formData = new FormData();
    formData.append('file', this.originalFile);

    this.http.post('http://localhost:8080/image/upload', formData, { responseType: 'blob' })
        .subscribe(blob => {
          this.transformedBlob = blob;
          const reader = new FileReader();
          reader.onload = () => {
            this.transformedImage = reader.result as string;
          };
          reader.readAsDataURL(blob);
        });
  }

  downloadImage() {
    if (!this.transformedBlob) return;

    const url = URL.createObjectURL(this.transformedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed-image.png';
    a.click();
    URL.revokeObjectURL(url);
  }
}
