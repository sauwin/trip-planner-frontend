export default {
  contact: {
    label: 'Contact',
    title: 'Get in touch',
    description: 'Questions, feedback or found a bug? Send us a message and we will get back to you.',
    formTitle: 'Send us a message',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    failed: 'Failed to send your message. Please try again.',
    sentTitle: 'Message sent',
    sentText: 'Thank you! We have received your message and will reply to your email soon.',
    writeAnother: 'Send another message',
    helpTitle: 'What you can write to us about',
    helpText: 'We read every message. Here are the most common reasons to get in touch.',
    topics: {
      question: {
        title: 'Questions',
        text: 'Not sure how something works, from the preferences quiz to trips and budgets? Ask and we will explain.',
      },
      feedback: {
        title: 'Feedback and ideas',
        text: 'Missing a feature or have a suggestion for a destination? Tell us what would make TripPlanner more useful for you.',
      },
      bug: {
        title: 'Bug reports',
        text: 'Something broken or looking odd? Describe what happened and which page you were on so we can find it quickly.',
      },
    },
    aboutHint: 'Want to know more about the project first?',
    aboutLink: 'Read About us',
  },
} as const