// src/components/AddBoardForm.js
import React, { useState } from 'react';
import axios from 'axios';

const AddBoardForm = ({ onBoardAdded }) => {
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/boards', { name }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onBoardAdded(res.data);  // Notify parent component of new board
            setName('');  // Reset the form
        } catch (err) {
            console.error('Error adding board:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Board Name
            </label>
            <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter board name"
                required
            />
            <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Add Board
            </button>
        </form>
    );
};

export default AddBoardForm;
