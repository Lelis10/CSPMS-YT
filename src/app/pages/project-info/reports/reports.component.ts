import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  uploadedAssignments: any[] = [];

  onAssignmentFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    // Perform file validation if needed, e.g., check file format, size, etc.
    // For example, you can check if the selected file is a docx file:
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      this.uploadedAssignments.push(file);
    } else {
      // Handle invalid file format
      alert('Please select a file in docx format.');
    }
  }

  uploadAssignment() {
    // Here, you can implement the logic to upload the assignment file to the server (backend).
    // You may need to use the Angular HttpClient to send the file to the server.
    // For simplicity, we'll just display an alert with the uploaded file names and sizes.
    for (const assignment of this.uploadedAssignments) {
      console.log('Uploaded Assignment: ', assignment.name, '-', assignment.size, 'bytes');
    }
  }
}
