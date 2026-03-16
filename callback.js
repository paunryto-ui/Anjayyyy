// api/callback.js — Vercel Serverless Function
// Set environment variables di Vercel Dashboard:
//   GH_CLIENT_ID     = Ov23liXUaVxgX2xDzjlO
//   GH_CLIENT_SECRET = (dari GitHub Developer Settings → Generate secret)

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect('/?error=missing_code');
  }

  try {
    // 1. Tukar code → access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('Token error:', tokenData);
      return res.redirect('/?error=token_failed');
    }

    // 2. Ambil data user GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'WebStore-OAuth',
      },
    });

    const userData = await userRes.json();

    if (!userData.login) {
      return res.redirect('/?error=user_failed');
    }

    // 3. Redirect balik ke index dengan username & display name
    const ghUser = encodeURIComponent(userData.login);
    const ghName = encodeURIComponent(userData.name || userData.login);
    return res.redirect(`/?gh_user=${ghUser}&gh_name=${ghName}&state=${state || ''}`);

  } catch (err) {
    console.error('OAuth error:', err);
    return res.redirect('/?error=server_error');
  }
}
