import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to Kanban Board</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Daftar
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
