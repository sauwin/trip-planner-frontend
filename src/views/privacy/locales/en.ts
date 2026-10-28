export default {
  privacy: {
    label: 'Legal',
    title: 'Privacy Policy',
    description: 'What data TripPlanner stores, why, and how you stay in control of it.',
    updated: 'Last updated: 27 October 2026',
    summary: {
      collect: {
        title: 'What we store',
        text: 'Your account details, your travel preferences and the trips, reviews and expenses you create.',
      },
      never: {
        title: 'What we do not do',
        text: 'We do not sell your data, show ads or use tracking cookies.',
      },
      control: {
        title: 'Your control',
        text: 'You can ask us to show, correct or delete your data at any time.',
      },
    },
    sections: {
      who: {
        title: 'Who we are',
        p1: 'TripPlanner is a student project that helps people discover destinations, get personal recommendations, plan trips and track their travel budget. This policy explains what personal data the app handles and why. If you have questions, you can reach us through the Contact page.',
      },
      collect: {
        title: 'Data we collect',
        intro: 'We only store what the app needs to work:',
        items: {
          account: 'Account data: your email address, your name and your password. The password is stored only as a secure hash, never in plain text.',
          preferences: 'Travel preferences: your answers to the preferences quiz.',
          activity: 'Activity: which destinations you view, like, save or rate. This powers your dashboard.',
          content: 'Content you create: reviews, trips, destination dates, accommodation details and expenses.',
          messages: 'Contact messages: your name, email and message are sent to us by email. We do not keep them in the app database.',
          technical: 'Technical data: short-lived password reset tokens (stored as hashes) and login tokens that keep you signed in.',
        },
      },
      use: {
        title: 'How we use your data',
        intro: 'We use your data only to provide the features of TripPlanner:',
        items: {
          features: 'to create your account, sign you in and keep your trips, reviews and expenses.',
          recommendations: 'to compare your preferences with destinations and calculate your recommendations and match scores.',
          email: 'to send password reset emails and to reply to your messages.',
          safety: 'to protect the service from abuse, for example by limiting repeated requests.',
        },
        promise: 'We do not sell your personal data, share it for advertising or use it to build profiles for third parties.',
      },
      storage: {
        title: 'Cookies and browser storage',
        p1: 'TripPlanner does not use advertising or tracking cookies.',
        p2: 'The app stores a few items in your browser’s local storage: your login tokens, so you stay signed in, and your chosen language. Login tokens are removed when you log out.',
      },
      thirdParties: {
        title: 'Third-party services',
        intro: 'Some parts of the app load resources from, or rely on, other services. These services may receive technical data such as your IP address:',
        items: {
          fonts: 'Google Fonts, which delivers the typefaces used on the site.',
          maps: 'OpenStreetMap, which provides the map tiles on destination and trip pages.',
          email: 'An email provider, which delivers password reset emails and your contact messages.',
        },
      },
      security: {
        title: 'Security',
        p1: 'We take reasonable steps to protect your data: passwords are hashed, login sessions expire, and sensitive actions such as sign-in and password reset are rate-limited. No online service can be completely secure, so please use a strong, unique password.',
      },
      retention: {
        title: 'How long we keep data',
        p1: 'We keep your data for as long as your account exists. If you want your account and the data linked to it deleted, contact us and we will remove it.',
      },
      rights: {
        title: 'Your rights',
        intro: 'Under data protection law, including the GDPR where it applies, you have the right to:',
        items: {
          access: 'ask what personal data we hold about you and get a copy of it;',
          rectify: 'ask us to correct data that is inaccurate;',
          erase: 'ask us to delete your data;',
          object: 'object to or ask us to restrict certain processing;',
          complain: 'lodge a complaint with your national data protection authority.',
        },
      },
      children: {
        title: 'Children',
        p1: 'TripPlanner is not intended for children under 16, and we do not knowingly collect their data. If you believe a child has created an account, please contact us.',
      },
      changes: {
        title: 'Changes to this policy',
        p1: 'We may update this policy as the app evolves. The date at the top shows when it was last changed.',
      },
    },
    contactTitle: 'Contact',
    contactText: 'For any privacy question or request, please use our',
    contactLink: 'Contact page.',
  },
} as const