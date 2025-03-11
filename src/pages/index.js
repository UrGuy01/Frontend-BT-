import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
import { MonacoEditor } from '../components/MonacoEditor';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [time, setTime] = useState(7200);
  const [timer, setTimer] = useState(null);
  const [showLoginModalState, setShowLoginModalState] = useState(false);
  const [showSignupModalState, setShowSignupModalState] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  // Form refs
  const loginEmailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const signupNameRef = useRef(null);
  const signupEmailRef = useRef(null);
  const signupPasswordRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Sample questions
  const questions = [
    {
      type: 'mcq',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2
    },
    {
      type: 'coding',
      question: 'Write a function that returns the sum of two numbers.',
      language: 'javascript',
      testCases: [
        { input: [1, 2], expected: 3 },
        { input: [5, 3], expected: 8 }
      ]
    }
    // Add more questions as needed
  ];

  // Handle clicks outside modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.id === 'loginModal') {
        setShowLoginModalState(false);
      }
      if (event.target.id === 'signupModal') {
        setShowSignupModalState(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Cleanup function for event listeners and timers
  const cleanupResources = () => {
    // Clear timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }

    // Clear inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // Remove event listeners
    document.removeEventListener('mousemove', resetInactivityTimer);
    document.removeEventListener('keypress', resetInactivityTimer);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
    }
  };

  // Authentication functions
  const showLoginModal = () => {
    setShowLoginModalState(true);
  };

  const showSignupModal = () => {
    setShowSignupModalState(true);
  };

  const login = () => {
    const email = loginEmailRef.current?.value;
    const password = loginPasswordRef.current?.value;

    // Simulate login
    setCurrentUser({ name: 'John Doe', email: email });
    setShowLoginModalState(false);
  };

  const signup = () => {
    const name = signupNameRef.current?.value;
    const email = signupEmailRef.current?.value;
    const password = signupPasswordRef.current?.value;

    // Simulate signup
    setCurrentUser({ name: name || 'New User', email: email });
    setShowSignupModalState(false);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Exam functions
  const startExam = () => {
    if (!currentUser) {
      alert('Please login first');
      return;
    }

    setExamStarted(true);
    setShowEditor(true);
    startTimer();
    loadQuestion(0);
    setupExamMonitoring();
  };

  const submitExam = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to submit your exam?')) {
      // First, hide the editor to prevent Monaco errors
      setShowEditor(false);
      
      // Show completion message
      setShowCompletionMessage(true);
      
      // Clean up resources
      cleanupResources();
      
      // Redirect to main page after a short delay
      setTimeout(() => {
        // Reset states
        setExamStarted(false);
        setShowCompletionMessage(false);
        setCurrentQuestion(0);
        setTime(7200);
        setTabSwitchCount(0);
        
        // Show success message
        alert('Exam submitted successfully!');
      }, 1500);
    }
  };

  const loadQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      loadQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      loadQuestion(currentQuestion - 1);
    }
  };

  // Timer functions
  const startTimer = () => {
    setTimer(
      setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            alert('Time is up!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000)
    );
  };

  useEffect(() => {
    if (time <= 0 && timer) {
      clearInterval(timer);
      alert('Time is up!');
      submitExam();
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [time, timer]);

  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Handle visibility change for tab switching detection
  const handleVisibilityChange = () => {
    if (document.hidden && examStarted) {
      setTabSwitchCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount > 3) {
          alert('Warning: Multiple tab switches detected!');
        }
        return newCount;
      });
    }
  };

  // Exam monitoring functions
  const setupExamMonitoring = () => {
    // Monitor tab switching
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Monitor user activity
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      if (examStarted) {
        alert('Warning: No activity detected!');
      }
    }, 60000); // 1 minute
  };

  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setFullscreenMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
        setFullscreenMode(false);
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  return (
    <div className="bg-gray-50">
      <Head>
        <title>ExamPro - Online Examination Platform</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="app">
        {/* Landing Page */}
        <div id="landing" className={examStarted ? "hidden" : "min-h-screen"}>
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-indigo-600">ExamPro</h1>
                </div>
                <div className="flex items-center" id="userSection">
                  {currentUser ? (
                    <>
                      <span className="text-gray-700">{currentUser.name}</span>
                      <button onClick={logout} className="ml-4 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Logout</button>
                    </>
                  ) : (
                    <>
                      <button onClick={showLoginModal} className="mx-2 px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Login</button>
                      <button onClick={showSignupModal} className="mx-2 px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50">Sign Up</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Welcome to ExamPro
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Your trusted platform for online examinations
              </p>
              <div className="mt-5 max-w-md mx-auto">
                <button onClick={startExam} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                  Take Exam
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* Exam Interface */}
        <div id="exam" className={examStarted ? "fullscreen" : "hidden"}>
          <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center">
                  <span id="timer" className="text-2xl font-bold text-red-600">{formatTime()}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-4 text-gray-700">{currentUser?.name}</span>
                  <button onClick={toggleFullscreen} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200" aria-label="Toggle fullscreen">
                    <i className="bi bi-fullscreen"></i>
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
              {/* Question Area */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-3xl mx-auto">
                  {/* Completion Message */}
                  {showCompletionMessage && (
                    <div className="bg-green-100 p-6 rounded-lg shadow text-center">
                      <h2 className="text-2xl font-bold text-green-800 mb-4">Exam Completed!</h2>
                      <p className="text-lg text-green-700 mb-6">Thank you for completing the exam.</p>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto"></div>
                      <p className="mt-4 text-green-700">Redirecting to the main page...</p>
                    </div>
                  )}
                  
                  {/* Questions */}
                  {!showCompletionMessage && questions[currentQuestion]?.type === 'mcq' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h2 className="text-xl font-bold mb-4">Question {currentQuestion + 1}</h2>
                      <p className="mb-4">{questions[currentQuestion]?.question}</p>
                      <div className="space-y-2">
                        {questions[currentQuestion]?.options.map((option, i) => (
                          <div className="flex items-center" key={i}>
                            <input type="radio" name={`q${currentQuestion}`} value={i} id={`q${currentQuestion}o${i}`} className="mr-2" />
                            <label htmlFor={`q${currentQuestion}o${i}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!showCompletionMessage && questions[currentQuestion]?.type === 'coding' && showEditor && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h2 className="text-xl font-bold mb-4">Question {currentQuestion + 1}</h2>
                      <p className="mb-4">{questions[currentQuestion]?.question}</p>
                      <div className="monaco-editor">
                        <MonacoEditor language={questions[currentQuestion]?.language} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Navigation */}
              <div className="w-64 bg-white border-l p-4 overflow-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => loadQuestion(i)}
                      className={`p-2 text-center rounded ${i === currentQuestion ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                {/* Submit Button in side panel */}
                <div className="mt-8">
                  <button 
                    onClick={submitExam} 
                    className="w-full py-3 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium"
                  >
                    Submit Exam
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t">
              <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between">
                <button onClick={previousQuestion} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Previous</button>
                
                <div className="flex gap-2">
                  <button onClick={nextQuestion} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Next</button>
                  <button onClick={submitExam} className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium">
                    Submit Exam
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Login Modal */}
        <div id="loginModal" className={showLoginModalState ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" : "hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Login</h3>
              <div className="mt-2 px-7 py-3">
                <input type="email" ref={loginEmailRef} placeholder="Email" className="mb-3 px-3 py-2 border rounded-md w-full" />
                <input type="password" ref={loginPasswordRef} placeholder="Password" className="mb-3 px-3 py-2 border rounded-md w-full" />
                <button onClick={login} className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full hover:bg-indigo-700">Login</button>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Modal */}
        <div id="signupModal" className={showSignupModalState ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" : "hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Sign Up</h3>
              <div className="mt-2 px-7 py-3">
                <input type="text" ref={signupNameRef} placeholder="Name" className="mb-3 px-3 py-2 border rounded-md w-full" />
                <input type="email" ref={signupEmailRef} placeholder="Email" className="mb-3 px-3 py-2 border rounded-md w-full" />
                <input type="password" ref={signupPasswordRef} placeholder="Password" className="mb-3 px-3 py-2 border rounded-md w-full" />
                <button onClick={signup} className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full hover:bg-indigo-700">Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
