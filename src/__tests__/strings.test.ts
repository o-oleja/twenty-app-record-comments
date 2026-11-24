import { describe, expect, it } from 'vitest';

import { getStrings } from 'src/utils/strings';
import { UI_STRINGS } from 'src/utils/strings.generated';

// Locales of Twenty 2.58 (APP_LOCALES in twenty-sdk, not exported), without pseudo-en.
const TWENTY_LOCALES = [
  'en', 'af-ZA', 'ar-SA', 'ca-ES', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'es-ES', 'fa-IR', 'fi-FI', 'fr-FR', 'he-IL', 'hu-HU', 'hy-AM', 'it-IT', 'ja-JP', 'ko-KR', 'nl-NL', 'no-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sr-Cyrl', 'sr-Latn', 'sv-SE', 'tr-TR', 'uk-UA', 'uz-UZ', 'vi-VN', 'zh-CN', 'zh-TW',
];

describe('UI strings', () => {
  it('should cover every Twenty locale', () => {
    const missing = TWENTY_LOCALES.filter((locale) => !(locale in UI_STRINGS));
    expect(missing).toEqual([]);
  });

  it('should pick the exact locale, then the same language, then English', () => {
    expect(getStrings('ru-RU').send).toBe('Отправить');
    expect(getStrings('pt-PT').delete).toBe('Eliminar');
    expect(getStrings('de-AT').send).toBe('Senden');
    expect(getStrings('xx-XX').send).toBe('Send');
    expect(getStrings(null).send).toBe('Send');
  });

  it('should fill placeholders', () => {
    expect(getStrings('en').imagesCount(3)).toBe('Images: 3');
    expect(getStrings('ru-RU').uploadFailed('a.png', 'timeout')).toBe(
      'картинка «a.png» не загрузилась (timeout)',
    );
  });
});
