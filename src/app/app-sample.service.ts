import { Injectable } from '@angular/core';
import { BehaviorSubject, observable, Observable, Subject } from 'rxjs';
import { first, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppSampleService {
  public observableWithLog$ = new BehaviorSubject<boolean>(true);

  public toggleObservableWithLog(): void {
    this.observableWithLog$.pipe(first()).subscribe((value: any) => {
      this.observableWithLog$.next(!value);
    });
  }
}
