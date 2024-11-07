import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ boardName, setIsAddingColumn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{boardName}</h1>
                <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
                    Log Out
                </button>
            </div>
            <div className="flex items-center mb-4">
                <button onClick={() => setIsAddingColumn(true)} className="bg-green-500 text-white p-2 rounded">
                    Add Column
                </button>
            </div>
        </div>
    );
};

export default Header;
