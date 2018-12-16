import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { FacadesModule } from './store/facades/facades.module';
import { reducers } from './store/reducers/app.reducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainNavComponent } from './main-nav/main-nav.component';
import { BasicUsageComponent } from './basic-usage/basic-usage.component';
import { OptionConfigurationsComponent } from './option-configurations/option-configurations.component';

@NgModule({
  declarations: [AppComponent, MainNavComponent, BasicUsageComponent, OptionConfigurationsComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FacadesModule,
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production // Restrict extension to log-only mode
    }),
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
