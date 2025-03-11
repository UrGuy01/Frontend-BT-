# ExamPro - Online Examination Platform

ExamPro is a modern web-based examination platform built with Next.js and React. It provides a secure environment for taking online exams with features like time tracking, fullscreen mode, and anti-cheating mechanisms.

![ExamPro Screenshot](https://via.placeholder.com/800x400?text=ExamPro+Screenshot)

## 🚀 Features

- **User Authentication**: Login and signup functionality
- **Multiple Question Types**: Supports both multiple-choice and coding questions
- **Real-time Code Editor**: Monaco Editor integration for coding questions
- **Exam Security**:
  - Fullscreen mode enforcement
  - Timer enforcement
- **Responsive Design**: Works on desktop and mobile devices
- **Exam Submission**: Easy submission with confirmation

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.x or higher)
- npm (v6.x or higher) or yarn (v1.22.x or higher)
- A modern web browser (Chrome, Firefox, Edge, Safari)

## 🔧 Installation

Follow these steps to get your development environment running:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd exampro
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
exampro/
├── src/
│   ├── components/      # Reusable components
│   │   └── MonacoEditor.js  # Code editor component
│   │
│   ├── pages/           # Next.js pages
│   │   ├── _app.js      # Main app component
│   │   └── index.js     # Home page with exam interface
│   └── app/
│       └── globals.css  # Global styles
├── public/             # Static assets
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## 🖥️ Usage

### Taking an Exam

1. Start by logging in or signing up
2. Click "Take Exam" on the main page
3. Navigate between questions using the "Previous" and "Next" buttons or the number grid
4. For coding questions, write your code in the editor
5. When finished, click "Submit Exam"

### Admin Features (Future Development)

- Creating and editing exams
- Viewing student results
- Managing user accounts

## 🧑‍💻 For Developers

### Key Components

- **MonacoEditor**: The code editor component (`src/components/MonacoEditor.js`)
- **Home**: Main page component with exam functionality (`src/pages/index.js`)

### State Management

The application uses React's useState hooks for state management:

- User authentication state
- Exam progress tracking
- Timer management
- Modal visibility

### Adding New Question Types

To add a new question type:

1. Update the `questions` array in `index.js`
2. Add a new rendering condition in the question display section
3. Implement appropriate input components for the new question type

## 🔧 Troubleshooting

### Common Issues

**Monaco Editor Loading Error**
- Make sure monaco-editor is properly installed
- Check browser console for specific error messages

**Fullscreen Mode Not Working**
- Fullscreen API requires user interaction to activate
- Some browsers restrict fullscreen access

**CSS Styling Issues**
- Ensure Tailwind CSS is properly configured
- Check browser compatibility for CSS features used

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon library
