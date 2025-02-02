"use client";
import { GetAPIData } from "@/lib/fetch-data";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, MinusCircle } from "lucide-react";
import {useRouter} from 'next/navigation';


type PracticeMaterial = {
  content: string[]; // Array of HTML-formatted content for practice material
  keywords: string[]; 
};

type ReadingMaterial = {
  id: number;
  keywords: string[]; // Keywords related to the content
  content: string | null; // Content in HTML format, could be null if no content exists
  created_at: string;
  updated_at: string;
  content_sections: string[]; // Sections of HTML content
  practice_material: PracticeMaterial
};

type optionsData = {
  id: number;
  description: string;
  is_correct: boolean;
  question_id: number;
};

type questionsData = {
  id: number;
  description: string;
  detailed_solution: string;
  is_mandatory: boolean;
  fix_summary: string;
  options: optionsData[];
  reading_material : ReadingMaterial,
  practice_material : PracticeMaterial
};

type quizData = {
  correct_answer_marks: string;
  duration: number;
  id: number;
  is_custom: boolean;
  is_form: boolean;
  is_published: boolean;
  live_count: string;
  max_mistake_count: number;
  negative_marks: string;
  coin_count: number;
  questions_count: number;
  questions: questionsData[];
  show_answers: boolean;
  show_mastery_option: boolean;
  show_unanswered: boolean;
  shuffle: boolean;
  title: string;
  topic: string;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<quizData>();

  useEffect(() => {
    GetAPIData()
      .then((data) => {
        setQuizData(data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Error occurred while fetching data");
        console.error(error);
        setLoading(false);
      });
  }, []);

  const startQuiz = () => {
    toast.success("Starting the quiz!");

    localStorage.setItem('quizData', JSON.stringify(quizData));
    router.push("./quiz");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400">
        <Loader2 className="animate-spin text-white text-9xl" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400">
      <div className="p-10 bg-white rounded-xl shadow-lg w-full max-w-lg transition-all duration-500 ease-in-out transform hover:scale-105">
        {quizData && (
          <div className="text-center">
            {/* Title Section */}
            <h1 className="text-4xl font-extrabold text-indigo-800 mb-6">{quizData.title}</h1>
            <p className="text-lg text-gray-600 mb-6">Topic: <span className="font-semibold text-indigo-600">{quizData.topic}</span></p>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-lg text-gray-700">
                <strong>Questions:</strong> {quizData.questions_count}
              </div>
              <div className="text-lg text-gray-700">
                <strong>Duration:</strong> {quizData.duration} min
              </div>
            </div>

            {/* Marks Section */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center text-green-500">
                <CheckCircle className="text-2xl mr-2" />
                <div>
                  <strong>Correct Marks:</strong> {quizData.correct_answer_marks}
                </div>
              </div>
              <div className="flex items-center text-red-500">
                <MinusCircle className="text-2xl mr-2" />
                <div>
                  <strong>Negative Marks:</strong> {quizData.negative_marks}
                </div>
              </div>
            </div>

            {/* Start Quiz Button */}
            <button
              onClick={startQuiz}
              className="px-10 py-5 bg-indigo-600 text-white rounded-lg text-2xl font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Start Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
