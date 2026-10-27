import * as http from 'http';
function getHtml(variant) {
    const isRegression = variant === 'regression';
    const buttonColor = isRegression ? '#dc2626' : '#2563eb';
    const cardPadding = isRegression ? '40px' : '24px';
    // Dynamic values that change on every request
    const timestamp = variant === 'dynamic' ? new Date().toISOString() : '2026-10-27T20:00:00.000Z';
    const sessionToken = variant === 'dynamic' ? Math.random().toString(36).substring(7) : 'sess-fixed-99';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: ${cardPadding};
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
      width: 420px;
      border: 1px solid #334155;
    }
    h2 { margin-top: 0; color: #38bdf8; }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      background: #334155;
      font-family: monospace;
      font-size: 13px;
      margin-bottom: 16px;
    }
    button {
      background: ${buttonColor};
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Account Dashboard</h2>
    <p>Manage deployment settings and monitor performance metrics.</p>
    
    <!-- Volatile Dynamic Elements -->
    <div>Session: <span class="session-id badge">${sessionToken}</span></div>
    <div style="margin-top: 6px;">Last Sync: <span class="sync-time badge">${timestamp}</span></div>

    <div style="margin-top: 20px;">
      <button class="primary-btn">Deploy Service</button>
    </div>
  </div>
</body>
</html>
  `;
}
export function startDemoServer(port = 9090) {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if (req.url === '/dynamic') {
            res.end(getHtml('dynamic'));
            return;
        }
        if (req.url === '/regression') {
            res.end(getHtml('regression'));
            return;
        }
        res.end(getHtml('baseline'));
    });
    server.listen(port);
    return server;
}
