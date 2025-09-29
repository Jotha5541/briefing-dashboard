import handler from './spotify';

export default async function callback(request, res) {
  try {
    const { code, state } = request.query;
    const user_id = state; // state holds user_id from Supabase

    if (!code || !user_id) {
      return res.status(400).json({ error: "Missing code or user_id" });
    }

    // Call handler with POST to store tokens
    request.method = 'POST';
    request.body = { code, user_id };
    return handler(request, res);

  } catch (error) {
    console.error("Spotify callback error:", error);
    return res.status(500).json({ error: error.message });
  }
}
