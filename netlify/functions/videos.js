const { connectLambda, getStore } = require('@netlify/blobs');

// Public read-only endpoint: returns the list of videos/memes published
// through the hidden admin panel. Always responds 200 with a JSON array —
// an empty store (or any read error) just yields [], never an error page,
// so the site never breaks because of this endpoint.
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    connectLambda(event);
    const store = getStore('videos');
    const lista = (await store.get('lista', { type: 'json' })) || [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(lista),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([]),
    };
  }
};
