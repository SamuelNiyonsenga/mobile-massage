// PM2 settings for the Mobile Massage website on the VPS. Lives at /var/www/mobile-massage/current/ecosystem.config.cjs.
// The running code is /var/www/mobile-massage/current (a link to the latest release).
// CMS content and uploads live outside the releases, in /var/www/mobile-massage/shared/content, so deploys never touch them.
module.exports = {
  apps: [
    {
      name: 'mobile-massage',
      cwd: '/var/www/mobile-massage/current',
      script: 'server.js',
      exec_mode: 'fork', // one process is plenty for this site and uses the least memory
      instances: 1,
      // --env-file reads the secrets (needs Node 20.6+). The heap limit keeps memory predictable.
      node_args: ['--env-file=/var/www/mobile-massage/.env', '--max-old-space-size=256'],
      max_memory_restart: '400M', // safety net: restart if it ever grows past this
      env: {
        NODE_ENV: 'production',
        PORT: '3030', // StockPro and OakEliteHome (3020) already use other ports; change if 3030 is taken
        HOSTNAME: '127.0.0.1', // only Caddy can reach it
        NEXT_TELEMETRY_DISABLED: '1',
      },
      time: true,
    },
  ],
};
