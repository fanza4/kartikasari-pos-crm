import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCustomMenuPhotos,
  saveCustomMenuPhoto,
  removeCustomMenuPhoto,
  resetAllCustomMenuPhotos,
} from '../src/services/storage';

describe('Custom Menu Photo Management System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. returns empty photo map by default', () => {
    const photos = getCustomMenuPhotos();
    expect(photos).toEqual({});
  });

  it('2. saves and retrieves custom photo for a menu item', () => {
    const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
    saveCustomMenuPhoto('kuah-seporsi', sampleBase64);

    const photos = getCustomMenuPhotos();
    expect(photos['kuah-seporsi']).toBe(sampleBase64);
  });

  it('3. updates multiple menu photos independently', () => {
    const photo1 = 'data:image/jpeg;base64,photo1...';
    const photo2 = 'data:image/jpeg;base64,photo2...';

    saveCustomMenuPhoto('kuah-seporsi', photo1);
    saveCustomMenuPhoto('yamin-manis-seporsi', photo2);

    const photos = getCustomMenuPhotos();
    expect(photos['kuah-seporsi']).toBe(photo1);
    expect(photos['yamin-manis-seporsi']).toBe(photo2);
  });

  it('4. removes custom photo for a specific menu item, keeping others intact', () => {
    saveCustomMenuPhoto('kuah-seporsi', 'photo1');
    saveCustomMenuPhoto('yamin-manis-seporsi', 'photo2');

    removeCustomMenuPhoto('kuah-seporsi');

    const photos = getCustomMenuPhotos();
    expect(photos['kuah-seporsi']).toBeUndefined();
    expect(photos['yamin-manis-seporsi']).toBe('photo2');
  });

  it('5. resets all custom menu photos back to default', () => {
    saveCustomMenuPhoto('kuah-seporsi', 'photo1');
    saveCustomMenuPhoto('yamin-manis-seporsi', 'photo2');

    resetAllCustomMenuPhotos();

    const photos = getCustomMenuPhotos();
    expect(photos).toEqual({});
  });
});
