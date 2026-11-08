import { describe, expect, it } from 'vitest';
import { sanitizeUrl } from '../src/utils/security';

describe('sanitizeUrl', () => {
  it('aceita http e https', () => {
    expect(sanitizeUrl('https://elevenlabs.io')).toBe('https://elevenlabs.io/');
    expect(sanitizeUrl('http://example.com/a?b=1')).toBe('http://example.com/a?b=1');
  });

  it('assume https quando não há esquema', () => {
    expect(sanitizeUrl('canva.com')).toBe('https://canva.com/');
    expect(sanitizeUrl('  opus.pro/path  ')).toBe('https://opus.pro/path');
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'about:blank',
    'mailto:a@b.com',
    '',
    'https://',
  ])('bloqueia %j', (input) => {
    const out = sanitizeUrl(input);
    expect(out === '#' || out.startsWith('https://')).toBe(true);
    expect(out.toLowerCase()).not.toMatch(/^(javascript|data|vbscript|file|about|mailto):/);
  });
});
