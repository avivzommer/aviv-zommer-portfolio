// Gates /sysaid.html and /groundcover.html behind a server-side password check.
// The real password lives only in the Netlify env var CASE_STUDY_PASSWORD and is
// never sent to the browser in any response. See netlify.toml for routing.

const COOKIE_NAME = "cs_unlocked";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function gateHtml({ error } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Password required</title>
<style>
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: #fffefe; color: #14110d;
  }
  .pw-box {
    background: #f5f1ea; border: 1px solid #ebe6dc; border-radius: 16px;
    padding: 36px 40px; width: 100%; max-width: 360px;
    box-shadow: 0 8px 48px rgba(20,17,13,0.14);
    display: flex; flex-direction: column; gap: 16px;
  }
  .pw-label { font-size: 14px; font-weight: 500; margin: 0; }
  form { display: flex; gap: 8px; }
  input {
    flex: 1; font-size: 14px; font-family: inherit; color: inherit;
    background: #fffefe; border: 1px solid #ebe6dc; border-radius: 8px;
    padding: 9px 12px; outline: none;
  }
  button {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; background: #14110d; color: #fffefe;
    border: none; border-radius: 8px; cursor: pointer; flex-shrink: 0; font-size: 16px;
  }
  #pw-error { font-size: 12px; color: #c0392b; margin: 0; }
</style>
</head>
<body>
  <div class="pw-box">
    <p class="pw-label">This case study is password protected</p>
    <form method="POST" autocomplete="off">
      <input name="password" type="password" placeholder="Enter password" autocomplete="new-password" autofocus>
      <button type="submit" aria-label="Submit password">&#8594;</button>
    </form>
    ${error ? '<p id="pw-error">Incorrect password</p>' : ""}
  </div>
</body>
</html>`;
}

export default async (request, context) => {
  const password = Netlify.env.get("CASE_STUDY_PASSWORD");
  const expectedCookieValue = password ? await sha256Hex(password) : null;

  if (request.method === "POST") {
    const form = await request.formData();
    const submitted = form.get("password");

    if (password && submitted === password) {
      const url = new URL(request.url);
      const response = Response.redirect(url.toString(), 303);
      context.cookies.set({
        name: COOKIE_NAME,
        value: expectedCookieValue,
        path: "/",
        maxAge: MAX_AGE,
        secure: true,
        sameSite: "Lax",
        // Intentionally NOT httpOnly: index.html's client-side JS reads this
        // cookie (cosmetically, not as a security boundary) to decide whether
        // to show "Password required" or "Read case study" on the work cards.
      });
      return response;
    }

    return new Response(gateHtml({ error: true }), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const currentCookie = context.cookies.get(COOKIE_NAME);
  if (expectedCookieValue && currentCookie === expectedCookieValue) {
    // Already unlocked — pass the request straight through to the real
    // static file, untouched (normal caching/compression preserved).
    return context.next();
  }

  return new Response(gateHtml({ error: false }), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};
