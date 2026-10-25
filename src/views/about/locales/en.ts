export default {
  about: {
    label: 'About us',
    heroTitle: 'We help you travel the way you like',
    heroText: 'TripPlanner brings inspiration, planning and budgeting into one place, so a trip starts with a good idea and ends without a spreadsheet headache.',
    contactUs: 'Contact us',
    storyTitle: 'Our story',
    storyLead: "Planning a trip shouldn't take more effort than the trip itself.",
    story: {
      problem: {
        label: 'The problem',
        title: 'Too many tabs',
        text: 'Inspiration in one place, reviews in another, bookings elsewhere and a spreadsheet for expenses. It works, but it is slow and easy to lose track of.',
      },
      insight: {
        label: 'The insight',
        title: 'One list for everyone',
        text: 'Most travel sites show the same famous places to everyone. A city break for a couple and a slow family holiday by the sea need very different suggestions.',
      },
      idea: {
        label: 'The idea',
        title: 'Personal and all in one',
        text: 'TripPlanner started as a university project on personalization in travel. It learns what kind of traveller you are, suggests places that fit and keeps the trip and its budget in one app.',
      },
    },
    valuesTitle: 'What we care about',
    values: {
      personal: {
        title: 'Personal',
        text: 'Recommendations come from your answers, not from what is trending. Skip any question and change your mind whenever you like.',
      },
      transparent: {
        title: 'Transparent',
        text: 'Every suggestion has a match score and shows which of your preferences it met, so you always know why a place appears.',
      },
      practical: {
        title: 'Practical',
        text: 'Ideas are only useful if you can act on them. Turn a destination into a trip, add dates and stays, and track what you really spend.',
      },
    },
    featuresTitle: 'What you can do',
    features: {
      destinations: {
        title: 'Explore destinations',
        text: 'Browse places with details and reviews from other travellers, and save the ones you like.',
      },
      recommendations: {
        title: 'Get recommendations',
        text: 'Answer a short quiz about your travel style and get destinations ranked by how well they fit you.',
      },
      trips: {
        title: 'Plan your trips',
        text: 'Combine destinations into a trip, set dates, add accommodation and see everything on a map.',
      },
      dashboard: {
        title: 'Track your budget',
        text: 'Log expenses, compare planned and actual spending and see where your money goes.',
      },
    },
    howTitle: 'How recommendations work',
    howIntro: 'No black box. Every suggestion comes with a match score you can understand.',
    how: {
      step1Title: 'Describe your style',
      step1Text: 'The quiz covers trip motivation, pace, who you travel with, budget, accommodation and activity level. You can skip any category.',
      step2Title: 'We compare',
      step2Text: 'Every destination is described by the same set of features. For each category we check how strongly it fits your choices.',
      step3Title: 'Get a ranked list',
      step3Text: 'Results are sorted by a match score from 0 to 100 %, together with the features that matched. Change your answers and the list updates.',
    },
    builtTitle: 'Built with',
    builtIntro: 'A modern web stack with an interactive map, charts and a relational database.',
    tech: {
      frontend: {
        title: 'Frontend',
        text: 'A fast single-page app with typed code, a responsive interface, interactive maps and charts.',
      },
      backend: {
        title: 'Backend',
        text: 'A REST API with validated requests and a PostgreSQL database behind the recommendations.',
      },
    },
    ctaRegister: 'Get started',
    ctaRecommendations: 'See recommendations',
  },
} as const