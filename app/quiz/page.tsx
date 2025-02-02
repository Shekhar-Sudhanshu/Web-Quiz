"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import DOMPurify from "dompurify";

// Define the type for the Option
type Option = {
  id: number;
  description: string;
  is_correct: boolean;
};

export default function Quiz() {
  const router = useRouter();
  // Retrieve quiz data from localStorage
  const data = useMemo(() => {
    const storedData = localStorage.getItem("quizData");
    return storedData ? JSON.parse(storedData) : null;
  }, []);

  console.log(data);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<null | "correct" | "incorrect">(null);
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0); // Track incorrect answers
  const [isFinished, setIsFinished] = useState(false);
  const [timer, setTimer] = useState(90); // Set 90 seconds for each question
  const [canProceed, setCanProceed] = useState(false); // Track if user can proceed to next question
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReadingMaterial, setShowReadingMaterial] = useState(false);
  const [showPracticeMaterial, setShowPracticeMaterial] = useState(false);
  const [correctQuestions, setCorrectQuestions] = useState(0);

  // Timer for each question countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isFinished && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      moveToNextQuestion(); // Automatically move to next question if time runs out
    }

    return () => clearInterval(interval!);
  }, [timer, isFinished]);

  // Handling the answer selection
  const handleAnswer = (selectedOption: Option) => {
    if (selectedOption.is_correct) {
      setScore(score + parseInt(data.correct_answer_marks || "1"));
      setAnswerState("correct");
      setCorrectQuestions(correctQuestions + 1);
    } else {
      setAnswerState("incorrect");
      setScore(score - parseInt(data.negative_marks || "1"));
      setIncorrectAnswers(incorrectAnswers + 1); // Increment incorrect answer counter
    }

    if (incorrectAnswers === 9) {
      setIsFinished(true);
    }
    setCanProceed(true); // Enable "Next" button after an answer is selected
  };

  // Move to the next question (either automatically when time runs out or when the "Next" button is clicked)
  const moveToNextQuestion = () => {
    if (incorrectAnswers === 9) {
      setIsFinished(true); // If all answers are incorrect, end the quiz immediately
    } else {
      if (currentQuestionIndex < data.questions_count - 1) {
        setShowExplanation(false);
        setShowReadingMaterial(false);
        setShowPracticeMaterial(false);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswerState(null);
        setTimer(90); // Reset timer to 90 seconds for the next question
        setCanProceed(false); // Disable "Next" button until an option is selected
      } else {
        setIsFinished(true); // Show Thank You message after the last question
      }
    }
  };

  useEffect(() => {
    if (!data) {
      console.error("No quiz data found in localStorage");
    }
  }, [data]);

  const handleGoHome = () => {
    router.back();
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIncorrectAnswers(0);
    setCorrectQuestions(0);
    setAnswerState(null);
    setTimer(90); // Reset the timer to 90 seconds
    setIsFinished(false); // Reset the quiz finished flag
    setCanProceed(false); // Reset the "canProceed" state
    setShowExplanation(false); // Hide the explanation modal
    setShowReadingMaterial(false); // Hide reading material modal
    setShowPracticeMaterial(false); // Hide practice material modal
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleHideExplanation = () => {
    setShowExplanation(false);
  };

  const handleShowReadingMaterial = () => {
    setShowReadingMaterial(true);
  };

  const handleHideReadingMaterial = () => {
    setShowReadingMaterial(false);
  };

  const handleShowPracticeMaterial = () => {
    setShowPracticeMaterial(true);
  };

  const handleHidePracticeMaterial = () => {
    setShowPracticeMaterial(false);
  };

  // Function to decode HTML entities
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const formatExplanation = (explanation: string) => {
    const formatted = explanation
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")  // Replace **bold** with <strong>bold</strong>
      .replace(/^\* (.*)$/gm, '<ul><li>$1</li></ul>') // Replaces lines starting with *
    return formatted;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400">
        <p className="text-2xl text-white">No quiz data found. Please start the quiz.</p>
      </div>
    );
  }

  const currentQuestion = data.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400 flex items-center justify-center">
      <div className="p-10 bg-white rounded-xl shadow-lg w-full max-w-lg">
        {!isFinished && (
            <>
                <h1 className="text-3xl font-semibold text-indigo-800 mb-6">{data.title}</h1>
                <p className="text-lg text-gray-600 mb-4">Topic: {data.topic}</p>
            </>
        )}

        {/* Timer and Question Number */}
        {!isFinished && (
          <div className="flex flex-col sm:flex-row justify-between text-gray-700 mb-6">
            <div><strong>Score:</strong> {score}</div>
            <div><strong>Time Left:</strong> {timer}s</div>
            <div><strong>Question {currentQuestionIndex + 1} of {data.questions_count}</strong></div>
          </div>
        )}

        {/* Question Card */}
        {!isFinished && (
          <div className="mb-6">
            <div className="bg-gray-100 p-5 rounded-lg shadow-sm">
              <p className="text-xl font-medium">{currentQuestion.description}</p>

              {/* Options */}
              {currentQuestion.options.map((option: Option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option)}
                  className={`block w-full text-left py-3 px-5 my-2 rounded-lg ${answerState === "correct" && option.is_correct ? "bg-green-500 text-white" : answerState === "incorrect" && !option.is_correct ? "bg-red-500 text-white" : "bg-gray-200"}`}
                >
                  {option.description}
                </button>
              ))}

              {/* Show Explanation, Reading Material, and Practice Material buttons */}
              {answerState && !showExplanation && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleShowExplanation}
                    className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Show Explanation
                  </button>
                  <div className="text-center mt-4 flex justify-center space-x-4">
                    <button
                      onClick={handleShowReadingMaterial}
                      className="ml-2 py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Show Reading Material
                    </button>
                    <button
                      onClick={handleShowPracticeMaterial}
                      className="ml-2 py-2 px-6 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Show Practice Material
                    </button>
                  </div>
                </div>
              )}

              {/* Explanation Modal */}
              {showExplanation && currentQuestion.detailed_solution && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[96vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Explanation</h3>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(formatExplanation(currentQuestion.detailed_solution)),
                        }}
                    />
                    <button
                      onClick={handleHideExplanation}
                      className="py-2 px-6 bg-gray-600 text-white rounded-lg mt-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Reading Material Modal */}
              {showReadingMaterial && currentQuestion.reading_material?.content_sections && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[96vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Reading Material</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(currentQuestion.reading_material.content_sections.join(""))
                      }}
                    />
                    <button
                      onClick={handleHideReadingMaterial}
                      className="py-2 px-6 bg-gray-600 text-white rounded-lg mt-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Practice Material Modal */}
              {showPracticeMaterial && currentQuestion.reading_material?.practice_material?.content && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[96vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Practice Material</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(decodeHtml(currentQuestion.reading_material.practice_material.content.join(""))) // Sanitize the joined HTML content
                      }}
                    />
                    <button
                      onClick={handleHidePracticeMaterial}
                      className="py-2 px-6 bg-gray-600 text-white rounded-lg mt-4"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next or Skip button */}
        {!isFinished && (
          <div className="text-center">
            <button
              onClick={moveToNextQuestion}
              className={`py-2 px-6 rounded-lg text-white ${currentQuestionIndex === data.questions_count - 1
                ? "bg-green-600 hover:bg-green-700" // Submit button style for last question
                : canProceed || currentQuestionIndex === data.questions_count - 1 // Show "Next" when an answer is selected or it's the last question
                ? "bg-indigo-600 hover:bg-indigo-700" // Next button style
                : `bg-indigo-600 hover:bg-indigo-700 ${currentQuestion.is_mandatory ? "disabled" : ""}` // Keep "Skip" button style even when no option is selected
              }`}
            >
              {currentQuestionIndex === data.questions_count - 1
                ? "Submit"
                : canProceed
                ? "Next"
                : "Skip"}
            </button>
          </div>
        )}

        {/* Show the result after all questions are answered */}
        {isFinished && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Thank You for Completing the Quiz!</h2>
            <p className="text-xl">Your Score: {score}</p>
            <div className="mt-4 text-lg">
              <p><strong>Correct Questions:</strong> {correctQuestions}</p>
              <p><strong>Wrong Questions:</strong> {incorrectAnswers}</p>
              <p><strong>Unanswered Questions:</strong> {data.questions.length - (correctQuestions + incorrectAnswers)}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleGoHome}
                className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Go Home
              </button>
              <button
                onClick={handleRetakeQuiz}
                className="ml-4 py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
