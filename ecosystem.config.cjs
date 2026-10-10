/**
 * PM2 process file for the Socialista VPS.
 *
 * Both apps stay in fork mode (one process). Next.js standalone does not
 * cluster, and a single API process keeps cron handlers from overlapping
 * inside the process.
 *
 * Layout after deploy.sh:
 *   /var/www/socialista/apps/api/dist/index.js
 *   /var/www/socialista/apps/web/apps/web/server.js   (staged standalone)
 *   /var/www/socialista/env/web.env                   (runtime env for web)
 *   /var/www/socialista/apps/api/.env                 (loaded by the API itself)
 *
 * SOCIALISTA_ROOT overrides the install prefix (deploy.sh exports it).
 */
const root = process.env.SOCIALISTA_ROOT || '/var/www/socialista'

const shared = {
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  max_restarts: 10,
  kill_timeout: 5000,
  time: true,
  merge_logs: true,
}

module.exports = {
  apps: [
    {
      ...shared,
      name: 'socialista-api',
      cwd: `${root}/apps/api`,
      script: 'dist/index.js',
      interpreter: 'node',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      error_file: '/var/log/socialista/api-error.log',
      out_file: '/var/log/socialista/api-out.log',
    },
    {
      ...shared,
      name: 'socialista-web',
      cwd: root,
      script: `${root}/scripts/pm2/start-web.sh`,
      interpreter: 'bash',
      max_memory_restart: '768M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
      error_file: '/var/log/socialista/web-error.log',
      out_file: '/var/log/socialista/web-out.log',
    },
  ],
}
