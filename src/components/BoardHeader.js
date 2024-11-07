import React, { useState } from 'react';
import { MoreVertical, LogOut, UserPlus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollaboratorModal from './CollaboratorModal';

const BoardHeader = ({ boardName, boardId, isSidebarOpen, toggleSidebar, userRole }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCollaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleInviteCollaborator = () => {
        setCollaboratorModalOpen(true);
    };

    const closeCollaboratorModal = () => {
        setCollaboratorModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <div className="top-0 bg-white z-10 shadow-md p-4 mb-6 flex items-center justify-between">
            {!isSidebarOpen && (
                <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-200">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}

            <h1 className="text-2xl font-bold text-center flex-1">{boardName}</h1>

            {/* Button is visible on medium and larger screens */}
            <button
                onClick={handleInviteCollaborator}
                className="hidden md:flex ml-4 p-2 rounded bg-blue-500 text-white hover:bg-blue-600 items-center"
            >
                {userRole === 'viewer' ? (
                    <>
                        <Eye className="h-5 w-5 mr-1" /> Look Collaborator
                    </>
                ) : (
                    <>
                        <UserPlus className="h-5 w-5 mr-1" /> Invite Collaborator
                    </>
                )}
            </button>

            <CollaboratorModal
                isOpen={isCollaboratorModalOpen}
                onClose={closeCollaboratorModal}
                boardId={boardId}
                userRole={userRole}
            />

            <div className="relative ml-auto">
                <button onClick={toggleDropdown} className="p-2 rounded hover:bg-gray-200">
                    <MoreVertical className="h-6 w-6" />
                </button>
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded z-10">
                        {/* Collaborator Button inside kebab menu for small screens */}
                        <button
                            onClick={handleInviteCollaborator}
                            className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full md:hidden"
                        >
                            {userRole === 'viewer' ? (
                                <>
                                    <Eye className="inline-block mr-2" /> Look Collaborator
                                </>
                            ) : (
                                <>
                                    <UserPlus className="inline-block mr-2" /> Invite Collaborator
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
                        >
                            <LogOut className="inline-block mr-2" /> Log Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardHeader;

