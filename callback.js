// api/callback.js
// Env vars di Vercel Dashboard → Settings → Environment Variables:
//   GH_CLIENT_ID     = Ov23liXUaVxgX2xDzjlO
//   GH_CLIENT_SECRET = (dari GitHub)

module.exports = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect('/?error=missing_code');
  }

  try {
    // Tukar code -> access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET,
        code,
      }),
    });
    const token = await tokenRes.json();

    if (!token.access_token) {
      console.error('Token error:', token);
      return res.redirect('/?error=token_failed');
    }

    // Ambil data user
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'User-Agent': 'WebStore-OAuth',
      },
    });
    const user = await userRes.json();

    if (!user.login) {
      return res.redirect('/?error=user_failed');
    }

    const ghUser = encodeURIComponent(user.login);
    const ghName = encodeURIComponent(user.name || user.login);

    return res.redirect(`/?gh_user=${ghUser}&gh_name=${ghName}&state=${state || ''}`);

  } catch (err) {
    console.error('OAuth error:', err);
    return res.redirect('/?error=server_error');
  }
};
