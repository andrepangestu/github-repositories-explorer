# GitHub Repositories Explorer

A [![Built with React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-blue.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A modern, responsive React + TypeScript application for exploring GitHub users and their repositories. This application integrates with the GitHub REST API v3 to provide an intuitive interface for searching users and viewing their public repositories with detailed information.

#� Table of Contents

- [📸 Screenshots](#-screenshots)
- [🌟 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [📝 Available Scripts](#-available-scripts)
- [🎯 Usage Guide](#-usage-guide)
- [🌐 API Integration](#-api-integration)
- [🏗️ Project Structure](#️-project-structure)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🐛 Troubleshooting](#-troubleshooting)

## �# 📸 Screenshots

### Search Interface

![Search Interface](docs/images/search-interface.png)

### User Results

![User Results](docs/images/user-results.png)

### Repository View

![Repository View](docs/images/repository-view.png)

## 🌟 Features

### 🔍 **User Search**

- Manual search with up to 5 user results
- Real-time search with loading indicators
- Error handling for failed searches
- Rate limit management

### 📊 **Repository Explorer**

- Expandable user dropdowns
- Complete repository listings (no pagination limits)
- Repository details including:
  - Star counts with visual indicators
  - Programming language with color coding
  - Last updated timestamps
  - Repository descriptions
  - Direct links to GitHub

### 🎨 **User Experience**

- Responsive design for all screen sizes
- Smooth animations and transitions
- Loading states and error messages
- Clean, modern interface design
- Keyboard navigation support

## 🛠️ Technology Stack

### **Frontend**

- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React 0.525.0** - Beautiful SVG icons

### **Build Tools**

- **Vite 7.0.0** - Fast build tool and dev server
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixes

### **HTTP Client**

- **Axios 1.10.0** - Promise-based HTTP client

### **Testing**

- **Vitest 3.2.4** - Unit test framework
- **Testing Library** - React component testing
- **jsdom 26.1.0** - DOM implementation for testing

### **Code Quality**

- **ESLint 9.29.0** - JavaScript/TypeScript linting
- **TypeScript ESLint 8.34.1** - TypeScript-specific linting rules

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn** (version 1.22.0 or higher)
- **Git** for version control
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/github-repositories-explorer.git
cd github-repositories-explorer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Navigate to `http://localhost:5173` in your browser.

## 📝 Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Build for production                     |
| `npm run preview`       | Preview production build locally         |
| `npm run lint`          | Run ESLint for code quality checks       |
| `npm test`              | Run unit tests with Vitest               |
| `npm run test:ui`       | Run tests with interactive UI            |
| `npm run test:coverage` | Generate test coverage report            |

## 🎯 Usage Guide

### Basic Search Flow

1. **Enter Username**: Type a GitHub username in the search field
2. **Click Search**: Press the blue "Search" button to initiate search
3. **View Results**: See up to 5 matching users in dropdown format
4. **Expand User**: Click on any user to expand and view their repositories
5. **Explore Repositories**: Browse ALL repositories with detailed information
6. **Visit GitHub**: Click repository titles to view them on GitHub

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and expand/collapse users
- **Escape**: Close expanded dropdowns
- **Arrow Keys**: Navigate within dropdown lists

### Search Tips

- Use exact usernames for best results
- Partial matches will show similar usernames
- Search is case-insensitive
- Special characters are supported

## 🌐 API Integration

### GitHub REST API v3

This application integrates with two main GitHub API endpoints:

#### User Search

```
GET https://api.github.com/search/users?q={username}&per_page=5
```

- Returns up to 5 users matching the search query
- Sorted by follower count (descending)

#### User Repositories

```
GET https://api.github.com/users/{username}/repos?sort=updated&direction=desc
```

- Returns ALL public repositories for a user
- Automatically handles pagination for users with 100+ repositories
- Sorted by last updated date

## 🏗️ Project Structure

```
github-repositories-explorer/
├── public/                 # Static assets
│   └── vite.svg           # Vite logo
├── src/                   # Source code
│   ├── components/        # React components
│   │   └── UserSearch.tsx # Main search and display component
│   ├── services/         # API services
│   │   └── githubApi.ts  # GitHub API integration
│   ├── types/            # TypeScript definitions
│   │   └── github.ts     # GitHub API types
│   ├── utils/            # Utility functions
│   │   └── helpers.ts    # Helper functions
│   ├── test/             # Test configuration
│   │   ├── setup.ts      # Test setup
│   │   ├── App.test.tsx  # App component tests
│   │   └── helpers.test.ts # Utility tests
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite type definitions
├── docs/                 # Documentation
├── dist/                 # Production build (generated)
├── node_modules/         # Dependencies (generated)
├── .eslintrc.js         # ESLint configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── package.json         # Project metadata and dependencies
└── README.md           # This file
```

## 🧪 Testing

### Test Coverage

The project includes comprehensive test coverage:

- **Component Tests**: React component rendering and behavior
- **Integration Tests**: User interaction flows
- **API Tests**: Service layer functionality
- **Utility Tests**: Helper function validation

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Examples

```typescript
// Component test example
test("renders search input and button", () => {
  render(<UserSearch onUserSelect={mockHandler} isLoading={false} />);

  expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
});

// Integration test example
test("searches for users and displays results", async () => {
  const user = userEvent.setup();
  render(<UserSearch onUserSelect={mockHandler} isLoading={false} />);

  await user.type(screen.getByPlaceholderText("Enter username"), "octocat");
  await user.click(screen.getByRole("button", { name: /search/i }));

  await waitFor(() => {
    expect(
      screen.getByText(/showing users for "octocat"/i)
    ).toBeInTheDocument();
  });
});
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Options

#### GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run build && npm run deploy
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

#### Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error Messages

| Error                 | Cause                  | Solution                 |
| --------------------- | ---------------------- | ------------------------ |
| "Rate limit exceeded" | Too many API requests  | Wait or add GitHub token |
| "User not found"      | Invalid username       | Check username spelling  |
| "Network error"       | No internet connection | Check connection         |
