import React, { useState, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import Card from './Card';

const Column = ({ column, onAddCard, onEditCard, onDeleteCard, onMoveCard, onMoveColumn, userRole, columns }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'COLUMN',
        canDrop: () => userRole !== 'viewer',
        item: { id: column.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOverColumn }, dropColumn] = useDrop({
        accept: 'COLUMN',
        canDrop: () => userRole === 'owner' || userRole === 'editor' || userRole === 'admin',
        hover: (draggedItem) => {
            const fromIndex = columns.findIndex(col => col.id === draggedItem.id);
            const toIndex = columns.findIndex(col => col.id === column.id);

            if (fromIndex !== toIndex) {
                onMoveColumn(fromIndex, toIndex);
            }
        },
        collect: (monitor) => ({
            isOverColumn: monitor.isOver(),
        }),
    });

    const [{ isOverCard }, dropCard] = useDrop({
        accept: 'CARD',
        hover: (item, monitor) => {
            const hoverIndex = calculateHoverIndex(monitor, column.cards.length);
            if (monitor.isOver()) {
                setHoverIndex(hoverIndex);
            }
        },
        drop: (item) => {
            console.log('Dropped item:', item); // Debugging log
            const sourceColumnId = item.columnId;
            const targetColumnId = column.id;
        
            let adjustedPosition = 1;
            let finalHoverIndex = hoverIndex;
            // Ensure hover index does not exceed the number of cards in the target column
            if (sourceColumnId === targetColumnId) {
                if (hoverIndex >= column.cards.length) {
                    console.log("hoverIndex >= column.cards.length | ",hoverIndex,">=",column.cards.length);
                    adjustedPosition=0;
                }
            }
            finalHoverIndex=finalHoverIndex+adjustedPosition;
            console.log("POSITION DROP : ",finalHoverIndex);

            const cardId = item.id;
            console.log('Moving card:', cardId, 'from column:', sourceColumnId, 'to column:', targetColumnId);
            onMoveCard(cardId, sourceColumnId, targetColumnId, finalHoverIndex);
        },
        collect: (monitor) => ({
            isOverCard: monitor.isOver(),
        }),
    });

    // Reset hover index when moving to another column
    useEffect(() => {
        if (!isOverCard && !isOverColumn) {
            setHoverIndex(null);  // Reset hover index when not hovering over the card or column
        }
    }, [isOverCard, isOverColumn]);

    const calculateHoverIndex = (monitor, numCards) => {
        const hoverBoundingRect = monitor.getClientOffset();
        const columnElement = document.getElementById(`column-${column.id}`);
        
        if (!hoverBoundingRect || !columnElement) return;
    
        const columnTop = columnElement.getBoundingClientRect().top;
        const columnHeight = columnElement.clientHeight;
        const hoverY = hoverBoundingRect.y - columnTop;
    
        // Menghitung indeks berdasarkan rasio posisi Y mouse terhadap tinggi total column
        const hoverRelativeYRatio = hoverY / columnHeight;
        const calculatedIndex = Math.floor(hoverRelativeYRatio * (numCards + 1)); // Mempertimbangkan posisi terakhir
        
        return Math.min(Math.max(calculatedIndex, 0), numCards);
    };
    
    

    return (
        <div
            id={`column-${column.id}`}
            ref={(node) => userRole !== 'viewer' ? drag(dropColumn(dropCard(node))) : dropCard(node)}
            className={`bg-gray-100 p-4 rounded-lg w-72 transition-shadow duration-300 ease-in-out ${isDragging ? 'opacity-50' : 'shadow-md'} ${isOverColumn ? 'shadow-xl border-2 border-blue-400' : ''}`}
        >
            <h2 className="font-bold text-lg mb-4 text-gray-800">{column.name}</h2>

            <div ref={userRole === 'owner' || userRole === 'editor' || userRole === 'admin' ? dropCard : null} className="space-y-4">
                {Array.isArray(column.cards) && column.cards.map((card, index) => (
    card && card.id ? (
        <React.Fragment key={card.id}>
            {hoverIndex === index && <div className="h-12 bg-blue-200 border-dashed border-2" />}
            <Card
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                userRole={userRole}
            />
        </React.Fragment>
    ) : (
        console.log('Invalid column-column.js:', column) || null
    )
))
                    }
                {hoverIndex === column.cards?.length && <div className="h-12 bg-blue-200 border-dashed border-2" />}
            </div>

            {(userRole === 'owner' || userRole === 'editor' || userRole === 'admin') && (
                <button
                    onClick={() => onAddCard(column.id)}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    Add Card
                </button>
            )}
        </div>
    );
};

export default Column;
 