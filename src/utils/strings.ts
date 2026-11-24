import { UI_STRINGS } from 'src/utils/strings.generated';

// Translations live in translations/translations.mjs; run `yarn translations` after editing.
type Templates = Record<keyof (typeof UI_STRINGS)['en'], string>;

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );

const LOCALE_TEMPLATES = UI_STRINGS as unknown as Record<string, Templates>;

// Exact locale first ("pt-BR", "sr-Latn"), then any locale of the same language, then English.
const pickTemplates = (locale: string | null | undefined): Templates => {
  if (!locale) return LOCALE_TEMPLATES.en;
  if (LOCALE_TEMPLATES[locale]) return LOCALE_TEMPLATES[locale];
  const language = locale.split('-')[0].toLowerCase();
  const sameLanguage = Object.keys(LOCALE_TEMPLATES).find(
    (candidate) => candidate.split('-')[0].toLowerCase() === language,
  );
  return sameLanguage ? LOCALE_TEMPLATES[sameLanguage] : LOCALE_TEMPLATES.en;
};

export const getStrings = (locale: string | null | undefined) => {
  const s = pickTemplates(locale);
  return {
    ...s,
    openImage: (name: string) => fill(s.openImage, { name }),
    removeFile: (name: string) => fill(s.removeFile, { name }),
    imagesCount: (count: number) => fill(s.imagesCount, { count }),
    uploadFailed: (name: string, reason: string) => fill(s.uploadFailed, { name, reason }),
    sendFailed: (reason: string) => fill(s.sendFailed, { reason }),
    deleteFailed: (reason: string) => fill(s.deleteFailed, { reason }),
    loadFailed: (reason: string) => fill(s.loadFailed, { reason }),
  };
};
