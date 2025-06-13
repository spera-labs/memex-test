# Token Trading Platform Frontend

This is the frontend application for the token trading platform built with React, TypeScript, and ethers.js.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension

## Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the frontend directory with the following variables:
```env
VITE_RPC_URL=your_rpc_url
VITE_CHAIN_ID=your_chain_id
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Features

- Connect wallet using MetaMask
- View token details and price
- Buy tokens using ETH
- Sell tokens for ETH
- View bonding curve information
- Real-time price updates
- Transaction notifications

## Project Structure

```
frontend/
├── src/
│   ├── abis/           # Contract ABIs
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main App component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
