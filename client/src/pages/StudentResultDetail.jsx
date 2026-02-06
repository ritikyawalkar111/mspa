import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function StudentResultDetail() {
    const { resultId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchResultDetail();
    }, [resultId]);

    const fetchResultDetail = async () => {
        try {
            const res = await api.get(`/results/${resultId}`);
            setResult(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch result details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!result) return <div className="p-8 text-center">Result not found.</div>;

    const { test, student, answers, totalMarks, score, percentage } = result;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link to={`/test/${test?._id || ''}/results`} className="text-blue-600 hover:text-blue-800">
                        &larr; Back to Role Results
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Detailed Result</h1>
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-500 text-sm">Student</p>
                            <p className="font-semibold text-lg">{student?.name}</p>
                            <p className="text-gray-400 text-sm">{student?.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Test Title</p>
                            <p className="font-semibold text-lg">{test?.title}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Score</p>
                            <p className="font-bold text-2xl text-blue-600">{score} / {totalMarks}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Performance</p>
                            <p className={`font-bold text-lg ${percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                {percentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                    {answers.map((ans, index) => {
                        const question = ans.question;
                        if (!question) return (
                            <div key={index} className="bg-white p-6 rounded shadow text-red-500">
                                Question deleted
                            </div>
                        );

                        return (
                            <div key={index} className={`bg-white p-6 rounded-lg shadow border-l-4 ${ans.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-gray-800">
                                        Q{index + 1}: {question.questionText}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${ans.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {ans.isCorrect ? 'Correct' : 'Incorrect'} ({question.marks} / -{question.negativeMarks || 0})
                                    </span>
                                </div>
                                {question.image && <img src={question.image} alt="Question" className="mb-4 h-32 object-contain" />}

                                <div className="grid md:grid-cols-2 gap-6 text-sm">
                                    {/* Student Answer */}
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="text-gray-500 mb-1 font-semibold">Student's Answer:</p>
                                        {question.questionType === 'multiple_choice' ? (
                                            <p className={ans.isCorrect ? 'text-green-700' : 'text-red-600 font-bold'}>
                                                {question.options[ans.selectedOption]?.text || 'No Selection'}
                                            </p>
                                        ) : (
                                            <p className={ans.isCorrect ? 'text-green-700' : 'text-red-600 font-bold'}>
                                                {ans.textAnswer || '(Empty)'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Correct Answer (Shown if incorrect) */}
                                    <div className="bg-blue-50 p-3 rounded">
                                        <p className="text-blue-500 mb-1 font-semibold">Correct Answer:</p>
                                        {question.questionType === 'multiple_choice' ? (
                                            <p className="text-gray-800">
                                                {question.options.find(o => o.isCorrect)?.text}
                                            </p>
                                        ) : (
                                            <p className="text-gray-800">
                                                {question.correctAnswer}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
