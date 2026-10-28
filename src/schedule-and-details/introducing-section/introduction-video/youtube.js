// Studio stores the course introduction video as a YouTube video ID only (it rebuilds the
// player address from it), so a link pasted by the author is reduced to its ID here.

const VIDEO_ID = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = ['youtube.com', 'youtube-nocookie.com'];
// youtube.com/embed/<id>, /shorts/<id>, /live/<id>, /v/<id>, /e/<id>
const ID_IN_PATH = ['embed', 'shorts', 'live', 'v', 'e'];

/**
 * The YouTube video ID in `value`: a video ID, or the address of a YouTube video in any of the
 * forms YouTube offers (watch page, youtu.be share link, embed, Shorts, live, mobile, music,
 * with or without "https://" and extra parameters such as a start time). '' when there is none.
 */
export const youTubeVideoId = (value) => {
  const text = (value || '').trim();
  if (VIDEO_ID.test(text)) {
    return text;
  }
  let url;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text.replace(/^\/\//, '')}`);
  } catch {
    return '';
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m|music)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);
  let id = '';
  if (host === 'youtu.be') {
    [id] = parts;
  } else if (YOUTUBE_HOSTS.includes(host)) {
    id = url.searchParams.get('v') || (ID_IN_PATH.includes(parts[0]) ? parts[1] : '');
  }
  return VIDEO_ID.test(id || '') ? id : '';
};

/** True when `value` is empty or names a YouTube video. */
export const isValidIntroVideo = (value) => !(value || '').trim() || Boolean(youTubeVideoId(value));
