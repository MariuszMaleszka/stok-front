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

This application uses four main Pinia stores for state management, each handling specific aspects of the ski school booking system.

### 1. StayStore (`src/stores/StayStore.js`)

The **StayStore** is the core store managing the entire ski school stay reservation system. It orchestrates all booking-related data and complex business logic for the booking process.

#### Key Responsibilities:

**Participant Management**
- Handles up to 12 total participants (adults + children)
- Dynamic participant array creation based on adult/children counts
- Individual participant profiles with personal data (name, age, phone, email)
- Age-based classification (adults vs children under 14)
- Participant type tracking (group class vs individual lessons)

**Date & Time Management**
- Stay date range selection (`dateOfStay` array)
- Individual date tracking for each day of the stay
- Integration with date utilities for formatting and calculations

**Class Enrollment System**
- Selected classes tracking per participant
- Support for both group and individual lessons
- Detailed class information:
  - Activity type (ski/snowboard)
  - Skill level (beginner, intermediate, advanced, or children's groups)
  - Language preference (Polish/English)
  - Time slots and duration
  - Instructor specialization for children
- Per-date class assignment with flexible scheduling

**Advanced Pricing Engine**
- Multi-tiered pricing based on total hours:
  - Standard rates (< 10 hours)
  - First package discount (10-19 hours): 5.7% off
  - Second package discount (20+ hours): 11.4% off
- Participant-based pricing:
  - First participant: Higher base rate
  - Second participant: Medium rate
  - Additional participants: Lowest rate
- Insurance calculations (optional, configurable per participant)
- Insurance exemption logic for children in group classes
- Real-time price updates as selections change

**Discount System**
- Package discounts automatically applied at 10h and 20h thresholds
- Loyalty card integration with 12% discount
- "Missing hours" calculator showing how many more hours needed for next discount tier
- Discount eligibility flags for UI feedback

**Loyalty Card Program**
- Card number validation via API integration
- Card owner information retrieval
- Discount application with card usage tracking

**Payment & Billing**
- Stay manager information (primary contact)
- Separate payer details (if different from manager)
- Invoice recipient data
- Complete payment data structure for API submission

**Legal Compliance**
- RODO/GDPR consent tracking
- Regulations acceptance flags
- Per-participant data protection compliance

**API Integration**
- Loyalty card validation endpoint
- Event submission to booking system
- Error handling and loading states

#### Usage Example:
```vue
<script setup>
import { useStayStore } from '@/stores/StayStore'

const stayStore = useStayStore()

// Configure stay
stayStore.adultsNumber = 2
stayStore.childrenNumber = 1
stayStore.dateOfStay = [new Date('2024-01-15'), new Date('2024-01-19')]

// Access pricing information
const totalPrice = stayStore.allParticipantsTotalPrice
const totalHours = stayStore.allParticipantsTotalHours
const discount = stayStore.finalDiscount
const hoursNeeded = stayStore.missingClassesForDiscount

// Check loyalty card
await stayStore.checkLoyaltyCardNumber('12345678')

// Update participant data
stayStore.participants[0].name = 'Jan'
stayStore.participants[0].surname = 'Kowalski'
stayStore.participants[0].insuranceIncluded = true

// Get participant-specific pricing
const participantPrice = stayStore.participantClassesTotalPrice('participant-id')
const insurancePrice = stayStore.participantInsuranceTotalPrice('participant-id')

// Submit booking
const bookingData = stayStore.event
</script>
```

#### Key Computed Properties:
- `event` - Complete booking object ready for API submission
- `allParticipantsTotalPrice` - Final total price after all discounts
- `allParticipantsTotalHours` - Total class hours across all participants
- `firstPackageEligible` - Boolean: has 10+ hours threshold been reached
- `secondPackageEligible` - Boolean: has 20+ hours threshold been reached  
- `missingClassesForDiscount` - Hours needed to reach next discount level
- `finalDiscount` - Calculated discount percentage (package + loyalty)
- `participantClassesTotalPrice(id)` - Price calculation per participant
- `participantInsuranceTotalPrice(id)` - Insurance cost per participant
- `participantsNumberCondition` - Validation: at least one participant selected

### 2. PickedClassesStore (`src/stores/PickedClassesStore.js`)

The **PickedClassesStore** manages the temporary state during class selection. It acts as a staging area for class assignments before they're committed to the StayStore.

#### Key Responsibilities:

**Temporary Selection Management**
- Holds currently selected classes before final confirmation
- Maintains state during the class selection modal/flow
- Prevents accidental data loss during selection process

**Class Collection Structure**
- Organized by participant ID
- Per-date class assignments
- Supports multiple classes per participant per day
- Maintains class details:
  - Group details (ID, name, time slots, participant limits)
  - Activity type and skill level
  - Language preference
  - Duration and scheduling

**Selection Workflow**
- Initialize temporary state from StayStore
- Allow modifications without affecting main store
- Commit changes back to StayStore on confirmation
- Discard changes on cancellation

**Data Synchronization**
- Bidirectional sync with StayStore
- Preserves existing selections when opening modal
- Updates StayStore only on explicit save action

#### Usage Example:
```vue
<script setup>
import { usePickedClassesStore } from '@/stores/PickedClassesStore'
import { useStayStore } from '@/stores/StayStore'

const pickedStore = usePickedClassesStore()
const stayStore = useStayStore()

// Open class selection modal
const openClassModal = (participantId) => {
  // Load current selections into temporary store
  pickedStore.loadFromStayStore(participantId)
  // Show modal
}

// Add class to selection
pickedStore.addClassForDate(participantId, date, classData)

// Remove class from selection
pickedStore.removeClassForDate(participantId, date, classId)

// Save selections
const saveSelections = (participantId) => {
  pickedStore.commitToStayStore(participantId)
  // Close modal
}

// Cancel selections
const cancelSelections = () => {
  pickedStore.resetSelections()
  // Close modal
}
</script>
```

#### Store Methods:
- `loadFromStayStore(participantId)` - Initialize from current participant data
- `addClassForDate(participantId, date, classData)` - Add class to temporary selection
- `removeClassForDate(participantId, date, classId)` - Remove class from selection
- `commitToStayStore(participantId)` - Save changes to main store
- `resetSelections()` - Clear temporary state

### 3. ViewControlStore (`src/stores/ViewControlStore.js`)

The **ViewControlStore** orchestrates the multi-step booking flow and manages global UI state throughout the application.

#### Key Responsibilities:

**Multi-Step Navigation**
- Tracks current position in booking flow
- Parent steps: Date/Participants → Classes → Review/Payment
- Child steps within each parent (sub-steps)
- Step completion status tracking

**Booking Flow States**
- **Step One**: Date selection and participant count configuration
- **Step Two**: Class selection for all participants  
- **Step Three**: Multi-phase completion
  - 3.1: Cart review and summary
  - 3.2: Participant personal data entry
  - 3.3: Payment processing

**Stepper Integration**
- Reference to parent stepper component
- Programmatic navigation support
- Next/previous step controls
- Direct step jumping

**Validation Gates**
- Step completion flags prevent premature progression
- Each step must be marked complete before advancing
- Ensures data integrity throughout booking process

#### Usage Example:
```vue
<script setup>
import { useViewControlStore } from '@/stores/ViewControlStore'

const viewStore = useViewControlStore()

// Access current position
const currentStep = viewStore.currentStep
// { parent: 1, child: 1 }

// Check if user can proceed
if (viewStore.isStepOneCompleted) {
  viewStore.currentStep.parent = 2
}

// Mark step as completed
viewStore.isStepOneCompleted = true
viewStore.isStepTwoCompleted = true

// Control stepper from outside
const stepperRef = ref(null)
viewStore.setParentStepper(stepperRef)

// Navigate programmatically
viewStore.parentStepperRef?.next()
viewStore.parentStepperRef?.prev()

// Sub-step management
viewStore.currentStep.child = 2 // Move to next sub-step
</script>
```

#### State Properties:
- `currentStep` - Object with `parent` and `child` step numbers
- `isStepOneCompleted` - Boolean flag for step one completion
- `isStepTwoCompleted` - Boolean flag for step two completion  
- `isStepThreeCompleted` - Boolean flag for step three completion
- `parentStepperRef` - Reference to Vuetify stepper component

#### Methods:
- `setParentStepper(ref)` - Connect stepper component for programmatic control

### 4. TimerStore (`src/stores/TimerStore.js`)

The **TimerStore** manages session timeout functionality, ensuring bookings are completed within a time limit to prevent reservation conflicts and maintain data freshness.

#### Key Responsibilities:

**Session Timer Management**
- 15-minute countdown timer for booking completion
- Automatic expiration after time limit
- Timer state persistence across component navigation

**Timer Controls**
- Start/stop timer programmatically
- Reset timer to initial state
- Pause and resume functionality
- Auto-start on booking initiation

**Time Display**
- Formatted time string (MM:SS)
- Real-time countdown updates
- Visual feedback for time remaining

**Expiration Handling**
- Automatic booking cancellation on timeout
- User notification system integration
- Data cleanup on expiration
- Redirect to start page

**Toast Notifications**
- Warning toast when timer is active
- Critical warnings as time runs low
- Dismissible timer display
- Integration with toast notification system

#### Usage Example:
```vue
<script setup>
import { useTimerStore } from '@/stores/TimerStore'

const timerStore = useTimerStore()

// Start timer when booking begins
const startBooking = () => {
  timerStore.startTimer()
}

// Display timer
const timeRemaining = timerStore.formattedTime // "14:35"

// Check if timer is running
if (timerStore.isTimerRunning) {
  // Show timer toast
}

// Stop timer on successful booking
const completeBooking = async () => {
  await submitBooking()
  timerStore.stopTimer()
  timerStore.resetTimer()
}

// Handle expiration
watch(() => timerStore.isExpired, (expired) => {
  if (expired) {
    // Show expiration message
    // Redirect to start
    router.push('/')
  }
})
</script>
```

#### State Properties:
- `timeLeft` - Seconds remaining (default: 900 = 15 minutes)
- `isTimerRunning` - Boolean: is timer currently active
- `isExpired` - Boolean: has timer reached zero
- `timerInterval` - Internal interval reference

#### Computed Properties:
- `formattedTime` - Time in MM:SS format (e.g., "14:35")

#### Methods:
- `startTimer()` - Begin countdown
- `stopTimer()` - Pause countdown
- `resetTimer()` - Reset to initial 15 minutes
- `decrementTime()` - Internal: decrease by 1 second

### Store Communication & Architecture

The four stores work together in a coordinated architecture to provide a complete booking experience:

#### Store Relationships:

1. **StayStore** ↔ **StayConfigStore**: Core business logic uses configuration data
   - StayStore retrieves pricing tiers based on total hours
   - Configuration provides skill levels, activity types, and pricing matrices
   - Centralized configuration ensures consistency across the application

2. **ViewControlStore** → **StayStore**: UI flow orchestrates business logic
   - ViewControlStore manages which step is active
   - StayStore validates data for step completion
   - Step progression depends on StayStore validation states

3. **PickedClassesStore** ↔ **StayStore**: Temporary staging and final storage
   - PickedClassesStore acts as a buffer during class selection
   - Changes are committed to StayStore only on user confirmation
   - Prevents data loss during selection process

4. **TimerStore**: Independent session management
   - Runs independently to enforce booking time limits
   - Triggers cleanup across all stores on expiration
   - Integrated with toast notification system

#### Complete Booking Flow Example:

```vue
<script setup>
import { useStayStore } from '@/stores/StayStore'
import { useStayConfigStore } from '@/stores/StayConfigStore'
import { useViewControlStore } from '@/stores/ViewControlStore'
import { usePickedClassesStore } from '@/stores/PickedClassesStore'
import { useTimerStore } from '@/stores/TimerStore'

const stayStore = useStayStore()
const configStore = useStayConfigStore()
const viewStore = useViewControlStore()
const pickedStore = usePickedClassesStore()
const timerStore = useTimerStore()

// Step 1: Initialize booking
const startBooking = () => {
  timerStore.startTimer() // Start 15-minute countdown
  viewStore.currentStep = { parent: 1, child: 1 }
}

// Step 1: Configure dates and participants
const completeStepOne = () => {
  stayStore.adultsNumber = 2
  stayStore.childrenNumber = 1
  stayStore.dateOfStay = [new Date('2024-01-15'), new Date('2024-01-19')]
  
  if (stayStore.participantsNumberCondition && stayStore.dateOfStay) {
    viewStore.isStepOneCompleted = true
    viewStore.currentStep.parent = 2
  }
}

// Step 2: Select classes (using PickedClassesStore)
const selectClassesForParticipant = (participantId) => {
  // Load current selections into temporary store
  pickedStore.loadFromStayStore(participantId)
  
  // User makes changes via UI...
  pickedStore.addClassForDate(participantId, '2024-01-15', classData)
  
  // On confirm, commit to main store
  pickedStore.commitToStayStore(participantId)
  
  // Check if all participants have classes
  if (allParticipantsHaveClasses) {
    viewStore.isStepTwoCompleted = true
    viewStore.currentStep.parent = 3
  }
}

// Step 3: Review and complete booking
const completeBooking = async () => {
  // Check for loyalty card discount
  if (loyaltyCardNumber) {
    await stayStore.checkLoyaltyCardNumber(loyaltyCardNumber)
  }
  
  // Get final pricing from StayStore using StayConfigStore pricing
  const finalPrice = stayStore.allParticipantsTotalPrice
  const discount = stayStore.finalDiscount
  
  // Submit booking
  const bookingData = stayStore.event
  await submitToAPI(bookingData)
  
  // Stop timer on success
  timerStore.stopTimer()
  timerStore.resetTimer()
  
  viewStore.isStepThreeCompleted = true
}

// Handle timer expiration
watch(() => timerStore.isExpired, (expired) => {
  if (expired) {
    // Clear all booking data
    stayStore.$reset()
    pickedStore.$reset()
    viewStore.$reset()
    
    // Redirect to start
    router.push('/')
  }
})
</script>
```

#### Store Hierarchy:

```
┌─────────────────────────────────────────┐
│         ViewControlStore                │
│   (Orchestrates booking flow)           │
└─────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│ Step 1  │ │  Step 2  │ │  Step 3  │
└─────────┘ └──────────┘ └──────────┘
     │            │            │
     ▼            ▼            ▼
┌─────────────────────────────────────────┐
│            StayStore                     │
│   (Central business logic & data)       │
└─────────────────────────────────────────┘
     │                        │
     ▼                        ▼
┌──────────────┐    ┌──────────────────┐
│StayConfigStore│    │PickedClassesStore│
│  (Constants)  │    │   (Temp buffer)  │
└──────────────┘    └──────────────────┘

          ┌──────────────┐
          │  TimerStore  │
          │ (Independent)│
          └──────────────┘
```

### Resources
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
