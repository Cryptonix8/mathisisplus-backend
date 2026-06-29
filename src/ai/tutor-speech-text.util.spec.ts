import { prepareTutorSpeechText } from './tutor-speech-text.util';

describe('tutor-speech-text.util', () => {
  it('removes LaTeX delimiters and reads equations naturally in English', () => {
    const spoken = prepareTutorSpeechText('Solve $2x + 5 = 13$ for x.', 'en');
    expect(spoken).not.toMatch(/\$/);
    expect(spoken.toLowerCase()).toContain('equals');
    expect(spoken.toLowerCase()).toContain('plus');
  });

  it('converts fractions for speech', () => {
    const spoken = prepareTutorSpeechText('The answer is $$\\frac{3}{4}$$.', 'en');
    expect(spoken.toLowerCase()).toContain('three quarters');
  });

  it('strips quotes and commas that TTS would read aloud', () => {
    const spoken = prepareTutorSpeechText('"Step 1:", x^2, and "done".', 'en');
    expect(spoken).not.toContain('"');
    expect(spoken).not.toContain(',');
    expect(spoken.toLowerCase()).toContain('squared');
  });
});
