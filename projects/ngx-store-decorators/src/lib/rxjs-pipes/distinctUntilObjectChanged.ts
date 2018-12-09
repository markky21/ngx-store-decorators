import * as fastDeepEqual_ from 'fast-deep-equal';
import { distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

const fastDeepEqual = fastDeepEqual_;


export const distinctUntilObjectChanged = (fn: (p: any, q: any) => boolean = (p: any, q: any) => fastDeepEqual(p, q)) => <T>(
  source: Observable<T>
) => {
  return source.pipe(distinctUntilChanged(fn));
};
