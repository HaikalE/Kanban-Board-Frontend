import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

const Card = ({ card, onEdit, onDelete, userRole }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const [{ isDragging }, drag] = useDrag({
        type: 'CARD',
        item: { id: card.id,
                columnId: card.column_id },
        collect: monitor => ({ 
            isDragging: monitor.isDragging(),
        }),
    });

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div
            ref={drag}
            className={`bg-white p-3 rounded-md shadow-md flex justify-between items-center transition ${isDragging ? 'opacity-50' : ''}`}
        >
            <span className="truncate max-w-xs">{card.title}</span>
            {userRole === 'owner' || userRole === 'editor' || userRole === 'admin' ? (
            <div className="relative">
                <button
                    onClick={toggleMenu}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ⋮
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-50">
                        <button
                            onClick={() => { onEdit(card); setMenuOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-blue-100"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => { onDelete(card.id); setMenuOpen(false); }}
                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
            ) : null} {/* Viewer tidak melihat opsi edit/delete */}
        </div>
    );
    
};

export default Card;