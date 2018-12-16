import { Routes } from '@angular/router';

import { BasicUsageComponent } from './basic-usage/basic-usage.component';
import { OptionConfigurationsComponent } from './option-configurations/option-configurations.component';

export const appRoutes: Routes = [
  { path: '', component: BasicUsageComponent },
  { path: 'options', component: OptionConfigurationsComponent }
];
