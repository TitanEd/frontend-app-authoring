import { isValidIntroVideo, youTubeVideoId } from './youtube';

describe('youTubeVideoId', () => {
  it.each([
    ['BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['  BvgNgTPTkSo ', 'BvgNgTPTkSo'],
    ['https://www.youtube.com/watch?v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://www.youtube.com/watch?v=BvgNgTPTkSo&t=42s&list=PL123', 'BvgNgTPTkSo'],
    ['https://youtube.com/watch?feature=shared&v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['www.youtube.com/watch?v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['youtube.com/watch?v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://m.youtube.com/watch?v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://music.youtube.com/watch?v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://youtu.be/BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://youtu.be/BvgNgTPTkSo?si=abc&t=10', 'BvgNgTPTkSo'],
    ['https://www.youtube.com/embed/BvgNgTPTkSo?rel=0', 'BvgNgTPTkSo'],
    ['//www.youtube.com/embed/BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://www.youtube-nocookie.com/embed/BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://www.youtube.com/shorts/BvgNgTPTkSo', 'BvgNgTPTkSo'],
    ['https://www.youtube.com/live/BvgNgTPTkSo?feature=share', 'BvgNgTPTkSo'],
    ['HTTPS://WWW.YOUTUBE.COM/watch?v=BvgNgTPTkSo', 'BvgNgTPTkSo'],
  ])('finds the video ID in %s', (value, expected) => {
    expect(youTubeVideoId(value)).toBe(expected);
  });

  it.each([
    '',
    null,
    undefined,
    '/assets',
    'not a video',
    'BvgNgTPTkS',
    'https://www.youtube.com/',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv',
    'https://vimeo.com/123456789',
    'https://example.com/watch?v=BvgNgTPTkSo',
    'https://notyoutube.com/watch?v=BvgNgTPTkSo',
  ])('finds no video ID in %p', (value) => {
    expect(youTubeVideoId(value)).toBe('');
  });
});

describe('isValidIntroVideo', () => {
  it('accepts an empty field, an ID and a link', () => {
    expect(isValidIntroVideo('')).toBe(true);
    expect(isValidIntroVideo('BvgNgTPTkSo')).toBe(true);
    expect(isValidIntroVideo('https://youtu.be/BvgNgTPTkSo')).toBe(true);
  });

  it('refuses anything else', () => {
    expect(isValidIntroVideo('https://vimeo.com/123456789')).toBe(false);
  });
});
