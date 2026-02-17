export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'localhost'),
        port: env.int('SMTP_PORT', 1025),
        auth: {
          user: env('SMTP_USERNAME', ''),
          pass: env('SMTP_PASSWORD', ''),
        },
      },
      settings: {
        defaultFrom: 'noreply@pairemancipation.fr',
        defaultReplyTo: 'contact@pairemancipation.fr',
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 5 * 1024 * 1024, // 5 Mo
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '15m',
      },
      register: {
        allowedFields: ['displayName'],
      },
    },
  },
});
