# Semester Planner - React Version

A modern React-based university semester planner application built with TypeScript, Vite, and cutting-edge libraries.

## Features

- **Modern React 18+** with TypeScript
- **Drag & Drop Interface** using @dnd-kit
- **State Management** with Zustand
- **Responsive Design** with Tailwind CSS
- **Persistent Storage** with localStorage
- **Multi-semester Course Support**
- **Real-time Progress Tracking**

## Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **@dnd-kit** - Modern drag and drop for React
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Module-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the provided localhost URL

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Setup Phase**: Configure your total credits goal and number of semesters
2. **Add Courses**: Create courses with names, credit values, and semester spans
3. **Plan Semesters**: Drag and drop courses into semester slots
4. **Track Progress**: Monitor your overall credit completion progress
5. **Edit & Manage**: Modify course details or remove courses as needed

## Features in Detail

### Drag & Drop
- Drag courses from the module bank to semester slots
- Drag courses between semesters
- Drag to trash zone to delete courses
- Visual feedback during drag operations

### Multi-semester Courses
- Support for courses spanning multiple semesters
- Automatic placement in consecutive semesters
- Visual indicators for continued courses

### State Persistence
- All data automatically saved to localStorage
- Resume your planning sessions seamlessly
- Reset functionality to start fresh

### Responsive Design
- Optimized for desktop and mobile devices
- Adaptive grid layouts
- Touch-friendly interactions

## Original vs React Version

This React version modernizes the original vanilla JavaScript application with:

- **Component-based architecture** for better maintainability
- **Type safety** with TypeScript
- **Modern state management** with Zustand
- **Better drag & drop** with @dnd-kit
- **Improved performance** with React's optimization features
- **Enhanced developer experience** with hot module replacement

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

---

Created by Raven Tang - [LinkedIn](https://www.linkedin.com/in/raven-tang/)
