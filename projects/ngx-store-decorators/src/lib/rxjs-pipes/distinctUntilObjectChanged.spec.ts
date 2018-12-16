import { from } from 'rxjs';

import { distinctUntilObjectChanged } from './distinctUntilObjectChanged';

const myArrayWithDuplicatesInARow = from([1, 1, 2, 2, 3, 1, 2, 3]);

const obj1a = { a: 1, b: 2 };
const obj1b = { b: 2, a: 1 };
const obj2a = { c: 1, d: 2 };
const obj2b = { c: 1, d: 2 };

const obj3a = { a: { b: 1, c: 2 } };
const obj3b = { a: { c: 2, b: 1 } };
const obj4a = { a: { b: 2, c: 1 } };

const myArrayWithDuplicatesFlatObjectsInARow = from([obj1a, obj1a, obj1b, obj2a, obj2a, obj2b]);
const myArrayWithDuplicatesDeepObjectsInARow = from([obj3a, obj3a, obj3b, obj4a]);

describe('distinctUntilObjectChanged', () => {
  it('should pass different primitive values', () => {
    const response = [];

    myArrayWithDuplicatesInARow.pipe(distinctUntilObjectChanged()).subscribe(val => response.push(val));

    expect(response).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it('should pass different flat objects', () => {
    const response = [];

    myArrayWithDuplicatesFlatObjectsInARow.pipe(distinctUntilObjectChanged()).subscribe(val => response.push(val));

    expect(JSON.stringify(response)).toEqual(JSON.stringify([obj1a, obj2a]));
  });

  it('should pass different deep objects', () => {
    const response = [];

    myArrayWithDuplicatesDeepObjectsInARow.pipe(distinctUntilObjectChanged()).subscribe(val => response.push(val));

    expect(JSON.stringify(response)).toEqual(JSON.stringify([obj3a, obj4a]));
  });
});
