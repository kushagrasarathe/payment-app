# Peanut Pay App

## Thought Process

Wanted to follow good code practices while keeping the ui minimalistic, so spent some time in setting up tools like `react-hook-form`, `zod`, created custom hooks for payment request generation `usePaymentLink` and payment processing `useProcessPayment`. And separate components like `PaymentForm` and `ProcessPayment`

The payment process functionality is not yet complete, the current implementation has integration errors based on the sdk.

### Tech Used

1. Opted for local state management using React hooks instead of going with Redux, why?

- to keep the implementation simpler
- makes components more self-contained
- will need reconsideration if the application grows significantly

2. `react-hook-form` for form handling and `zod` for form validation
3. Used ShacnUI for quick ui components

## Development Challenges

during development, I encountered some stupidly simply yet annyoing bugs:

1. **ENS Resolution**: ENS names handling
2. **SDK URL processing**: got stuck in errors while processing the generated payment links through the sdk to process the payment

### Task Requirements

- parse and handle various url formats
- support ens names
- mobile-first and good ui
- payment functionality using the peanut sdk
- support cross-chain payments ( additional task )
