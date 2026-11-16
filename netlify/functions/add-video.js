const { connectLambda, getStore } = require('@netlify/blobs');

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function respond(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

// Accepts a full YouTube URL (watch, youtu.be, shorts, embed) or a bare
// 11-character video ID pasted directly.
function extractYouTubeId(input) {
  if (!input) return null;
  const trimmed = String(input).trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Protected write endpoint used by the hidden admin panel to publish a new
// YouTube video/meme without touching the codebase. Password is only ever
// compared against process.env.ADMIN_PASSWORD — never hardcoded here.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, { message: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return respond(400, { message: 'Invalid JSON body' });
  }

  const { password, link, seccion, titulo } = payload;

  if (!process.env.ADMIN_PASSWORD) {
    return respond(500, { message: 'ADMIN_PASSWORD is not configured on the server' });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return respond(401, { message: 'Wrong password' });
  }

  const id = extractYouTubeId(link);
  if (!id) {
    return respond(400, { message: 'Could not find a valid YouTube video ID in that link' });
  }

  if (seccion !== 'video' && seccion !== 'meme') {
    return respond(400, { message: 'seccion must be exactly "video" or "meme"' });
  }

  try {
    connectLambda(event);
    const store = getStore('videos');
    const lista = (await store.get('lista', { type: 'json' })) || [];

    lista.unshift({
      id,
      seccion,
      titulo: titulo || '',
      fecha: new Date().toISOString(),
    });

    await store.setJSON('lista', lista);

    return respond(200, lista);
  } catch (err) {
    return respond(500, { message: 'Could not save the video. Please try again.' });
  }
};
