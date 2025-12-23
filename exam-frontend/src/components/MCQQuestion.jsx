import React, { useState } from 'react';

const MCQQuestion = ({ question, onAnswer }) => {
    const [selected, setSelected] = useState('');

    const handleChange = (option) => {
        setSelected(option);
        onAnswer(option);
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            <div className="space-y-2">
                {question.options.map((option, index) => (
                    <label key={index} className="flex items-center">
                        <input
                            type="radio"
                            name="mcq"
                            value={option}
                            checked={selected === option}
                            onChange={() => handleChange(option)}
                            className="mr-2"
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default MCQQuestion;
