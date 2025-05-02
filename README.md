# Proforma - Open Source Invoice Generator

🚀 A modern, user-friendly invoice generator web application built with React that allows users to create, customize, and send professional invoices with integrated payment tracking.

## Features

### Core Functionality
- 📝 Customizable invoice templates
- 💌 Direct email delivery to clients
- 💳 Multiple payment gateway integrations
- 📊 Real-time payment tracking
- 📱 Responsive dashboard interface
- 🔒 Secure payment processing

### Payment Integrations
- Stripe
- PayPal
- Flutterwave
- Paystack
- Skrill
- GooglePay

## Tech Stack

- **Frontend:** React, TailwindCSS, Framer Motion
- **Payment Processing:** Stripe API, PayPal API, Square API
- **Authentication:** Google OAuth
- **Email Service:** Google Mail Service API and NodeMailer
- **Database:** MongoDB

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/sammyarc/proforma.git
cd proforma
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Contributing

We welcome contributions of all sizes! Here's how you can help:

### For First-Time Contributors

1. Look for issues labeled `good-first-issue` or `help-wanted`
2. Comment on the issue you'd like to work on
3. Fork the repository
4. Create a new branch for your feature/fix
5. Submit a Pull Request

### Development Workflow

1. Fork the repo
2. Create a new branch
```bash
git checkout -b feature/your-feature-name
```
3. Make your changes
4. Commit with clear, descriptive messages
5. Push to your fork
6. Create a Pull Request

### Code Style Guidelines

- Follow the existing code style
- Use meaningful variable and function names
- Comment complex logic
- Write tests for new features
- Keep components modular and reusable

### Current Priority Areas

1. Payment Integration Improvements
   - Webhook implementations
   - Payment status tracking
   - Account connection error handling

2. Invoice Template System
   - New template designs
   - Template customization options
   - PDF generation

3. Email System
   - Email template design
   - Delivery tracking
   - Bounce handling

## Project Structure

## Setting Up Payment Providers

### Stripe Setup
1. Create a Stripe account
2. Get API keys from dashboard
3. Configure webhook endpoints
4. Add keys to environment variables

### PayPal Setup
1. Create a PayPal Developer account
2. Create an application
3. Get Client ID and Secret
4. Configure OAuth scopes
5. Add credentials to environment variables

and so on...

## Running Tests
```bash
npm run test
# or
yarn test
```

## Deployment

(Deployment instructions to be added)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Acknowledgments

Thank you to all contributors who help make this project better! 🙏

---

Don't forget to ⭐ the repo if you like what you see!
