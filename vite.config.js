import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'github-auth-proxy',
        configureServer(server) {
          server.middlewares.use('/api/auth', async (req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const code = url.searchParams.get('code');

            if (!code) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Code parameter is missing' }));
            }

            try {
              // Tukar code dengan access_token ke GitHub
              const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                body: JSON.stringify({
                  client_id: env.VITE_GITHUB_CLIENT_ID,
                  client_secret: env.GITHUB_CLIENT_SECRET,
                  code,
                }),
              });

              const tokenData = await tokenRes.json();

              if (tokenData.error) {
                res.statusCode = 400;
                return res.end(JSON.stringify(tokenData));
              }

              // Ambil data profil akun GitHub
              const userRes = await fetch('https://api.github.com/user', {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                  'User-Agent': 'AsaJasa-App',
                },
              });

              const userData = await userRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(userData));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
    server: {
      port: 5173, // Menyesuaikan dengan callback GitHub tadi
      open: true,
    },
  };
});