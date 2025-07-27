# Semester Planner

A comprehensive module planner for university students to organize their academic journey across multiple semesters.

## Live Demo

**Try it now:** [https://module-planner.pages.dev/](https://module-planner.pages.dev/)

## Table of Contents

- [Customize for Your Institution](#customize-for-your-institution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Features in Detail](#features-in-detail)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Customize for Your Institution

This planner is designed to be flexible and adaptable. Feel free to fork this project and customize it for your specific school system, degree requirements, or academic structure. Modifications and contributions that make this tool work better for different educational environments are welcome!

## Features

### Academic Planning
- **Semester Management**: Add, delete, and organize semesters
- **Module Bank**: Create and manage course modules with credit values
- **Drag & Drop**: Interface for assigning modules to semesters
- **Multi-Semester Modules**: Support for modules that span multiple semesters
- **Credit Tracking**: Track credits per semester and overall progress

### User Experience
- **Dark Mode**: Automatic dark theme support, according to OS preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Progress Visualization**: Progress bar showing completion towards degree goals
- **Edit Mode**: For viewing and editing all modules, even assigned ones

### Management Tools
- **Back to Setup**: Reset the planner and return to initial setup
- **Clear ALL Modules**: Remove all modules from both module bank and semesters
- **Clear Unassigned Modules**: Remove only unassigned modules, keeping semester assignments
- **Clear Semesters**: Move all modules from semesters back to the module bank
- **TrashZone**: Delete modules by dragging them to the trash area

### Data Persistence
- **Local Storage**: Data is automatically saved and persists between sessions
- **No Account Required**: All data is stored locally in your browser
- **Printable Format**: Download a formatted semester plan for printing or saving as PDF

## Tech Stack

- **Frontend**: React 18.3 with TypeScript 5.8
- **Styling**: Tailwind CSS with dark mode support
- **Drag & Drop**: @dnd-kit for drag-and-drop interactions
- **State Management**: Zustand with persistence middleware
- **Build Tool**: Vite 5.4
- **Icons**: SVG icons and Lucide React

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Module-planner.git
cd Module-planner
```

2. Install dependencies:
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

3. Start the development server:
```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
# Using npm
npm run build

# Using yarn
yarn build

# Using pnpm
pnpm build
```

The built files will be in the `dist` directory.

## Usage

1. **Initial Setup**: Set your total credit goal and number of semesters
2. **Add Modules**: Create modules with names, credit values, and semester spans
3. **Plan Semesters**: Drag modules from the module bank to semester columns
4. **Track Progress**: Monitor your credit progress and semester distribution
5. **Manage**: Use the management tools to clear or reorganize your plan
6. **Export Plan**: Use the download button to generate a printable semester overview

## Features in Detail

### Multi-Semester Modules
Modules can span multiple semesters with placement logic:
- **Forward Filling**: Modules are placed in consecutive forward semesters when possible
- **Backward Filling**: If forward placement isn't possible, the module extends backward
- **Continued Modules**: Show as grayed-out placeholders in non-primary semesters

### Drag & Drop Logic
- **Semester Assignment**: Drag modules from the module bank to any semester
- **Re-assignment**: Move modules between semesters with automatic span recalculation
- **Trash Deletion**: Drag modules to the trash zone to remove them
- **Edit Mode Protection**: Prevents accidental drags when in "Show All / Edit" mode

### Management Functions
- **Confirmation Dialogs**: Destructive actions like "Clear ALL Modules" require confirmation
- **Smart Semester Deletion**: Prevents deletion of semesters containing primary modules
- **Tooltips**: Tooltips explain each management function

### Export and Printing
- **Formatted Output**: Download button generates a clean, printable semester plan
- **PDF-Ready**: Output is optimized for saving as PDF or printing
- **Complete Overview**: Shows all semesters with assigned modules and credit totals

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by **Raven Tang** - [LinkedIn](https://www.linkedin.com/in/raven-tang/)

## Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS for responsive design
- Drag-and-drop functionality powered by @dnd-kit
- State management with Zustand
