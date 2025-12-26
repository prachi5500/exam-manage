import React, { useState } from 'react';

const TheoryQuestion = ({ question, onAnswer, savedAnswer = '' }) => {
    const [answer, setAnswer] = useState(savedAnswer);

    const handleChange = (e) => {
        setAnswer(e.target.value);
        onAnswer(e.target.value);
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            <textarea
                value={answer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="6"
                placeholder="Write your answer here..."
            />
        </div>
    );
};

export default TheoryQuestion;