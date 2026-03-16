// netlify/functions/callback.js
// GitHub OAuth callback handler
// Env vars yang perlu di-set di Netlify Dashboard:
//   GH_CLIENT_ID     = Ov23liXUaVxgX2xDzjlO
//   GH_CLIENT_SECRET = (dari GitHub Developer Settings)

exports.handler = async (event) => {
  const { code, state } = event.queryStringParameters || {};

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code parameter",
    };
  }

  try {
    // 1. Tukar code -> access_token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Token error:", tokenData);
      return redirect("/?error=token_failed");
    }

    // 2. Ambil data user GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "WebStore-OAuth",
      },
    });

    const userData = await userRes.json();

    if (!userData.login) {
      return redirect("/?error=user_failed");
    }

    // 3. Redirect balik ke index dengan username
    return redirect(`/?gh_user=${encodeURIComponent(userData.login)}&gh_name=${encodeURIComponent(userData.name || userData.login)}&state=${state || ""}`);

  } catch (err) {
    console.error("OAuth error:", err);
    return redirect("/?error=server_error");
  }
};

function redirect(url) {
  return {
    statusCode: 302,
    headers: { Location: url },
    body: "",
  };
}
