// UI strings. English is the fallback; add a language by adding an entry.
const en = {
  newComment: 'New comment (Ctrl+Enter to send)',
  placeholder: 'Write a comment…',
  attachImage: 'Attach image',
  send: 'Send',
  loading: 'Loading…',
  empty: 'No comments yet.',
  noName: 'Unknown',
  delete: 'Delete',
  deleteComment: 'Delete comment',
  deleteTitle: 'Delete this comment?',
  original: 'Original',
  close: 'Close',
  closeImage: 'Close image',
  clickToClose: 'Click to close',
  openRecord: 'Open a record to see its comments.',
  unsupportedRecord: 'Comments are not available for this record type.',
  onlyImages: 'Only images can be attached',
  imageTooBig: 'Images over 10 MB were not attached',
  uploadUnavailable: 'Image upload is not available yet, please try again',
  openImage: (name: string) => `Open image ${name}`,
  removeFile: (name: string) => `Remove ${name}`,
  imagesCount: (count: number) => `Images: ${count}`,
  uploadFailed: (name: string, reason: string) => `image "${name}" was not uploaded (${reason})`,
  sendFailed: (reason: string) => `Could not send: ${reason}`,
  deleteFailed: (reason: string) => `Could not delete: ${reason}`,
  loadFailed: (reason: string) => `Could not load comments: ${reason}`,
};

type Strings = typeof en;

const ru: Strings = {
  newComment: 'Новый комментарий (Ctrl+Enter — отправить)',
  placeholder: 'Напишите комментарий…',
  attachImage: 'Прикрепить картинку',
  send: 'Отправить',
  loading: 'Загрузка…',
  empty: 'Комментариев пока нет.',
  noName: 'Без имени',
  delete: 'Удалить',
  deleteComment: 'Удалить комментарий',
  deleteTitle: 'Удалить комментарий?',
  original: 'Оригинал',
  close: 'Закрыть',
  closeImage: 'Закрыть картинку',
  clickToClose: 'Нажмите, чтобы закрыть',
  openRecord: 'Откройте запись, чтобы увидеть комментарии.',
  unsupportedRecord: 'Для этого типа записей комментарии недоступны.',
  onlyImages: 'Можно прикреплять только картинки',
  imageTooBig: 'Картинки больше 10 МБ не прикреплены',
  uploadUnavailable: 'Загрузка картинок пока недоступна, попробуйте ещё раз',
  openImage: (name) => `Открыть картинку ${name}`,
  removeFile: (name) => `Убрать ${name}`,
  imagesCount: (count) => `Картинок: ${count}`,
  uploadFailed: (name, reason) => `картинка «${name}» не загрузилась (${reason})`,
  sendFailed: (reason) => `Не удалось отправить: ${reason}`,
  deleteFailed: (reason) => `Не удалось удалить: ${reason}`,
  loadFailed: (reason) => `Не удалось загрузить комментарии: ${reason}`,
};

const STRINGS: Record<string, Strings> = { en, ru };

export const getStrings = (locale: string | null | undefined): Strings =>
  STRINGS[(locale ?? 'en').slice(0, 2).toLowerCase()] ?? en;
