import React from 'react';

const BoardCard = ({ name, createdAt, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-200 cursor-pointer"
        >
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-gray-600">Created on: {new Date(createdAt).toLocaleDateString()}</p>
        </div>
    );
};

export default BoardCard;
