# Vuetify (Default)

This is the official scaffolding tool for Vuetify, designed to give you a head start in building your new Vuetify application. It sets up a base template with all the necessary configurations and standard directory structure, enabling you to begin development without the hassle of setting up the project from scratch.

## ❗️ Important Links

- 📄 [Docs](https://vuetifyjs.com/)
- 🚨 [Issues](https://issues.vuetifyjs.com/)
- 🏬 [Store](https://store.vuetifyjs.com/)
- 🎮 [Playground](https://play.vuetifyjs.com/)
- 💬 [Discord](https://community.vuetifyjs.com)

## 💿 Install

Set up your project using your preferred package manager. Use the corresponding command to install the dependencies:

| Package Manager                                                | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

After completing the installation, your environment is ready for Vuetify development.

## ✨ Features

- 🖼️ **Optimized Front-End Stack**: Leverage the latest Vue 3 and Vuetify 3 for a modern, reactive UI development experience. [Vue 3](https://v3.vuejs.org/) | [Vuetify 3](https://vuetifyjs.com/en/)
- 🗃️ **State Management**: Integrated with [Pinia](https://pinia.vuejs.org/), the intuitive, modular state management solution for Vue.
- 🚦 **Routing and Layouts**: Utilizes Vue Router for SPA navigation and vite-plugin-vue-layouts for organizing Vue file layouts. [Vue Router](https://router.vuejs.org/) | [vite-plugin-vue-layouts](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)
- ⚡ **Next-Gen Tooling**: Powered by Vite, experience fast cold starts and instant HMR (Hot Module Replacement). [Vite](https://vitejs.dev/)
- 🧩 **Automated Component Importing**: Streamline your workflow with unplugin-vue-components, automatically importing components as you use them. [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- 🎯 **VueUse Integration**: Enhanced with [@vueuse/core](https://vueuse.org/), a collection of essential Vue Composition Utilities for Vue 2 and 3. Provides a rich set of composable functions for common tasks like state management, browser APIs, animations, and more.

These features are curated to provide a seamless development experience from setup to deployment, ensuring that your Vuetify application is both powerful and maintainable.

## 💡 Usage

This section covers how to start the development server and build your project for production.

### Starting the Development Server

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000):

```bash
yarn dev
```

(Repeat for npm, pnpm, and bun with respective commands.)

> Add NODE_OPTIONS='--no-warnings' to suppress the JSON import warnings that happen as part of the Vuetify import mapping. If you are on Node [v21.3.0](https://nodejs.org/en/blog/release/v21.3.0) or higher, you can change this to NODE_OPTIONS='--disable-warning=5401'. If you don't mind the warning, you can remove this from your package.json dev script.

### Building for Production

To build your project for production, use:

```bash
yarn build
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.

## 🌐 Internationalization (i18n)

This project uses [vue-i18n](https://vue-i18n.intlify.dev/) for internationalization support. You can easily add multiple languages and switch between them in your application.

### Setup

1. **Locales**: Add your translation files in `src/plugins/i18n/locales/` (e.g., `en.json`, `pl.json`).
2. **Configuration**: The i18n plugin is configured in `src/plugins/i18n.js` and registered in `src/plugins/index.js`.
3. **Usage in Components**:
   - Use the `useI18n` composable in your Vue components:
     ```vue
     <script setup>
     import { useI18n } from 'vue-i18n'
     const { t, locale } = useI18n()
     // Change language: locale.value = 'en'
     </script>
     <template>
       <div>{{ t('hello') }}</div>
     </template>
     ```
   - Add translation keys to your locale files and reference them with `t('key')`.

### Resources
- [vue-i18n Documentation](https://vue-i18n.intlify.dev/)
- [Internationalization Guide](https://vue-i18n.intlify.dev/guide/)

## 💪 Support Vuetify Development

This project is built with [Vuetify](https://vuetifyjs.com/en/), a UI Library with a comprehensive collection of Vue components. Vuetify is an MIT licensed Open Source project that has been made possible due to the generous contributions by our [sponsors and backers](https://vuetifyjs.com/introduction/sponsors-and-backers/). If you are interested in supporting this project, please consider:

- [Requesting Enterprise Support](https://support.vuetifyjs.com/)
- [Sponsoring John on Github](https://github.com/users/johnleider/sponsorship)
- [Sponsoring Kael on Github](https://github.com/users/kaelwd/sponsorship)
- [Supporting the team on Open Collective](https://opencollective.com/vuetify)
- [Becoming a sponsor on Patreon](https://www.patreon.com/vuetify)
- [Becoming a subscriber on Tidelift](https://tidelift.com/subscription/npm/vuetify)
- [Making a one-time donation with Paypal](https://paypal.me/vuetify)

## 📑 License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present Vuetify, LLC

## Date Picker

This project uses [@vuepic/vue-datepicker](https://vue3datepicker.com/) for date selection components. For usage details and API documentation, see the [official documentation](https://vue3datepicker.com/).

## 🏪 Pinia Stores

This application uses three main Pinia stores for state management:

### 1. StayStore (`src/stores/StayStore.js`)

The **StayStore** is the main store for managing ski school stay reservations. It handles all booking-related data and business logic.

#### Key Features:
- **Participant Management**: Handles adults and children (up to 12 total participants)
- **Date Selection**: Manages stay date ranges
- **Class Enrollment**: Tracks selected classes for each participant (group and individual lessons)
- **Pricing Calculations**:
  - Per-participant class pricing with per-date calculations
  - Insurance pricing (skipped for children in group classes)
  - Total pricing with discount application
  - Hour-based package discount system
- **Discount System**:
  - First package (10+ hours): 5.7% discount
  - Second package (20+ hours): 11.4% discount
  - Loyalty card: 12% discount
  - Real-time missing hours calculation
- **Loyalty Program**: Card validation and owner information
- **Payment Data**: Stay manager, payer (if different), and invoice details
- **Legal Agreements**: RODO/GDPR and regulations acceptance tracking

#### Usage Example:
```vue
<script setup>
import { useStayStore } from '@/stores/StayStore'

const stayStore = useStayStore()

// Access data
const totalPrice = stayStore.allParticipantsTotalPrice
const totalHours = stayStore.allParticipantsTotalHours
const discount = stayStore.finalDiscount

// Modify state
stayStore.adultsNumber = 2
stayStore.childrenNumber = 1
stayStore.dateOfStay = [new Date(), new Date()]

// Check loyalty card
await stayStore.checkLoyaltyCardNumber('12345678')
</script>
```

#### Key Computed Properties:
- `event` - Complete booking object with all data
- `allParticipantsTotalPrice` - Final total price after discounts
- `allParticipantsTotalHours` - Total class hours (excluding group classes)
- `firstPackageEligible` - Whether 10h threshold is reached
- `secondPackageEligible` - Whether 20h threshold is reached
- `missingClassesForDiscount` - Hours needed for next discount level
- `participantClassesTotalPrice(id)` - Price calculator per participant
- `participantInsuranceTotalPrice(id)` - Insurance calculator per participant

### 2. StayConfigStore (`src/stores/StayConfigStore.js`)

The **StayConfigStore** provides configuration data and constants used throughout the application.

#### Key Features:
- **Pricing Tiers**: Different pricing for various hour thresholds
  - `combinedClassesPrices` - Default pricing (first: 174.99, second: 40, additional: 30)
  - `combinedClassesPrices_10h` - 10+ hours pricing (first: 164.99, second: 38, additional: 28)
  - `combinedClassesPrices_20h` - 20+ hours pricing (first: 154.99, second: 37, additional: 27)
  - `combinedClassesPrices_HH` - Happy hours pricing (first: 164.99, second: 38, additional: 28)
- **Activity Types**: Ski and Snowboard options
- **Skill Levels**:
  - Adults: Beginner, Intermediate, Advanced
  - Children Ski: Orange, Bronze, Silver, Gold, Diamond groups (with age ranges)
  - Children Snowboard: Yellow, Wide, Narrow groups
- **Languages**: Polish and English class options
- **External Links**: Customer service, regulations, payment terms

#### Usage Example:
```vue
<script setup>
import { useStayConfigStore } from '@/stores/StayConfigStore'

const configStore = useStayConfigStore()

// Access pricing
const prices = configStore.combinedClassesPrices
// { firstParticipant: 174.99, secondParticipant: 40, additionalParticipant: 30 }

// Access skill levels
const adultLevels = configStore.skillLevels_ADULTS
const childSkiLevels = configStore.skillLevels_CHILDREN_SKI

// Currency
const currency = configStore.currency // 'zł'
</script>
```

### 3. ViewControlStore (`src/stores/ViewControlStore.js`)

The **ViewControlStore** manages the multi-step booking flow and UI state.

#### Key Features:
- **Step Navigation**: Tracks current parent and child step positions
- **Step Completion States**:
  - Step One (Date & Participant Selection)
  - Step Two (Class Selection)
  - Step Three with substeps:
    - Cart Review
    - Participant Data Entry
    - Payment Processing
- **Stepper Reference**: Manages connection to parent stepper component for programmatic navigation

#### Usage Example:
```vue
<script setup>
import { useViewControlStore } from '@/stores/ViewControlStore'

const viewStore = useViewControlStore()

// Check completion status
if (viewStore.isStepOneCompleted) {
  // Proceed to next step
}

// Set stepper reference (in parent component)
const stepperRef = ref(null)
viewStore.setParentStepper(stepperRef)

// Navigate using stepper
viewStore.parentStepperRef?.next()
viewStore.parentStepperRef?.prev()
</script>
```

#### Current Step Structure:
```javascript
{
  parent: 1, // Main step (1-3)
  child: 1   // Sub-step within parent
}
```

### Store Communication

The stores work together to provide a complete booking experience:

1. **StayStore** references **StayConfigStore** for pricing and configuration data
2. **ViewControlStore** manages the UI flow while **StayStore** handles the business logic
3. All stores are reactive and can be used together in components

```vue
<script setup>
import { useStayStore } from '@/stores/StayStore'
import { useStayConfigStore } from '@/stores/StayConfigStore'
import { useViewControlStore } from '@/stores/ViewControlStore'

const stayStore = useStayStore()
const configStore = useStayConfigStore()
const viewStore = useViewControlStore()

// Example: Complete step one
const completeStepOne = () => {
  if (stayStore.participantsNumberCondition && stayStore.dateOfStay) {
    viewStore.isStepOneCompleted = true
    viewStore.currentStep.parent = 2
  }
}
</script>
```

### Resources
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
