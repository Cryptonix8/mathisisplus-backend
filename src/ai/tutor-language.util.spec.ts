import {
  detectTextLanguage,
  extractSessionResolvedLanguage,
  mergeSessionLanguageTransition,
  resolveTutorResponseLanguage,
  resolveWhisperLanguage,
} from './tutor-language.util';

describe('tutor-language.util', () => {
  it('detects English text', () => {
    expect(detectTextLanguage('Can you help me with fractions?')).toBe('en');
  });

  it('auto-detects English when app locale is Greek', () => {
    expect(
      resolveTutorResponseLanguage({
        appLocale: 'el-GR',
        messageText: 'How do I solve this equation?',
      }),
    ).toBe('en');
  });

  it('falls back to app locale when text is ambiguous', () => {
    expect(
      resolveTutorResponseLanguage({
        appLocale: 'el-GR',
        messageText: '2+2',
      }),
    ).toBe('el');
  });

  it('keeps session language for short follow-ups', () => {
    expect(
      resolveTutorResponseLanguage({
        appLocale: 'el-GR',
        messageText: 'yes',
        sessionResolvedLanguage: 'en',
      }),
    ).toBe('en');
  });

  it('stores resolved language in session transition', () => {
    const merged = mergeSessionLanguageTransition({ mode: 'model_response' }, 'en');
    expect(extractSessionResolvedLanguage(merged)).toBe('en');
  });

  it('lets Whisper auto-detect even when a session language already exists', () => {
    expect(resolveWhisperLanguage(undefined)).toBeUndefined();
    expect(resolveWhisperLanguage('en')).toBeUndefined();
    expect(resolveWhisperLanguage('el')).toBeUndefined();
  });
});
