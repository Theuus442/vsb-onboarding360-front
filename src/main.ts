import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Development mode information
if (!environment.production) {
  console.group('🚀 VSB Onboard360 - Development Mode');
  console.log(`📦 Version: ${environment.version}`);
  console.log(`🔗 API URL: ${environment.apiUrl}`);
  console.log('🛠️ Development commands will be available after app initialization');
  console.groupEnd();
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
