import BoardHeader from '../components/BoardHeader';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Column from '../components/Column';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BoardDetail = ({ isSidebarOpen, toggleSidebar }) => {
    const { boardId } = useParams();
    const [userRole, setUserRole] = useState('');
    const [columns, setColumns] = useState([]);
    const [boardName, setBoardName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [modalState, setModalState] = useState({
        isAddingColumn: false,
        isAddingCard: false,
        isEditingCard: false,
        editingCard: null,
        newColumnName: '',
        newCardTitle: '',
        newCardDescription: '',
        targetColumnId: null,
    });

    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    // Fungsi untuk mengubah posisi kolom setelah dipindahkan
    // Fungsi untuk mengubah posisi kolom setelah dipindahkan
    const moveColumn = (fromIndex, toIndex) => {
        const updatedColumns = [...columns];
        const [movedColumn] = updatedColumns.splice(fromIndex, 1); // Hapus kolom yang dipindahkan
        updatedColumns.splice(toIndex, 0, movedColumn); // Tambahkan di posisi baru
    
        // Set posisi baru berdasarkan urutan saat ini
        const columnsWithUpdatedPositions = updatedColumns.map((column, index) => ({
            ...column,
            position: index + 1,
        }));
    
        setColumns(columnsWithUpdatedPositions); // Update state kolom dengan urutan baru
    
        // Panggil API untuk memperbarui posisi kolom di backend
        updateColumnPositions(boardId, columnsWithUpdatedPositions)
            .then(() => {
                console.log('Column positions updated successfully');
            })
            .catch((error) => {
                console.error('Error updating column positions', error);
            });
    };
    
        const updateColumnPositions = async (boardId, updatedColumns) => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put(`/api/boards/${boardId}/columns/positions`, updatedColumns, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return res.data;
            } catch (error) {
                console.error('Error updating column positions', error);
                throw error;
            }
        };
    

    const handleEditCard = async () => {
        const { newCardTitle, newCardDescription, editingCard } = modalState;
        if (!newCardTitle.trim() || !newCardDescription.trim()) {
            toast.error('Title and Description cannot be empty.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`/api/cards/${editingCard.id}/boards/${boardId}`, {
                title: newCardTitle,
                description: newCardDescription,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            updateColumns(columns.map(col => ({
                ...col,
                cards: col.cards.map(card => card.id === editingCard.id ? res.data : card)
            })));
            
            closeModal('isEditingCard');
            toast.success('Card updated successfully!');
        } catch (err) {
            console.error('Failed to update card', err);
            toast.error('Failed to update card. Please try again.');
        }
    };
    
    

    useEffect(() => {
        // WebSocket setup
        const ws = new WebSocket(`ws://localhost:5000/boards/${boardId}`);
        setSocket(ws);

        ws.onmessage = (event) => {
            
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data); // Logging data WebSocket
            if (data.type === 'UPDATE_COLUMNS') {
                setColumns(data.columns);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            ws.close();
        };
    }, [boardId]);

    useEffect(() => {
        const fetchBoardDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/boards/${boardId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                    },
                });
                if (res.status === 200) {
                    setBoardName(res.data.board[0].name);
                    setColumns(res.data.columns || []);
                    setUserRole(res.data.role);
                }
            } catch (err) {
                setError('Failed to fetch board details');
            } finally {
                setLoading(false);
            }
        };

        fetchBoardDetail();
    }, [boardId]);

    const openModal = (type, payload = {}) => {
        setModalState(prevState => ({
            ...prevState,
            ...payload,
            [type]: true,
        }));
    };

    const handleAddCard = async () => {
        const { newCardTitle, newCardDescription, targetColumnId } = modalState;
        if (!newCardTitle.trim() || !newCardDescription.trim()) {
            toast.error('Title and Description cannot be empty.');
            return;
        }

        const column = columns.find(col => col.id === targetColumnId);
        if (!column) {
            toast.error('Target column not found.');
            return;
        }

        const newCard = {
            title: newCardTitle,
            description: newCardDescription,
            position: column.cards.length + 1,
            columnId: targetColumnId,
        };

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/columns/${targetColumnId}/boards/${boardId}/cards`, newCard, {
                headers: { Authorization: `Bearer ${token}` },
            });

            updateColumns(columns.map(col => {
                if (col.id === targetColumnId) {
                    return { ...col, cards: [...col.cards, res.data] };
                }
                return col;
            }));
            closeModal('isAddingCard');
            toast.success('Card added successfully!');
        } catch (err) {
            console.error('Failed to add card', err);
            toast.error('Failed to add card. Please try again.');
        }
    };

    const closeModal = (type) => {
        setModalState(prevState => ({
            ...prevState,
            [type]: false,
            newCardTitle: '',
            newCardDescription: '',
            targetColumnId: null,
            editingCard: null,
        }));
    };

    // Inside moveCard function
    // const moveCard = async (cardId, sourceColumnId, targetColumnId, newPosition) => {
    //     try {
    //         const token = localStorage.getItem('token');
    //         const payload = {
    //             sourceColumnId: sourceColumnId,
    //             targetColumnId: targetColumnId,
    //             cardId: cardId,
    //             newPosition: newPosition,
    //         };
    
    //         // Debugging logs for payload
    //         console.log("Payload:", payload);
    
    //         const res = await axios.put(`/api/cards/${cardId}/boards/${boardId}/move`, payload, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    
    //         console.log('Move card API response:', res.data);
    
    //         // Update local state after moving card
    //         const updatedColumns = columns.map(col => {
    //             if (col.id === sourceColumnId) {
    //                 console.log('Source column before move:', col); // Debugging log
    //                 return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
    //             } else if (col.id === targetColumnId) {
    //                 const updatedCards = [...col.cards];
    //                 // Insert card at the new position
    //                 updatedCards.splice(newPosition, 0, res.data.updatedCard);
    //                 console.log('Target column after move:', col); // Debugging log
    //                 return { ...col, cards: updatedCards };
    //             }
    //             return col;
    //         });
    
    //         // Log updated columns to verify changes before state update
    //         console.log('Updated Columns:', updatedColumns);
    
    //         updateColumns(updatedColumns);  // Update columns state
    //         toast.success('Card moved successfully!');
    //     } catch (err) {
    //         console.error('Failed to move card', err);
    //         toast.error('Failed to move card. Please try again.');
    //     }
    // };

    const moveCard = async (cardId, sourceColumnId, targetColumnId, newPosition) => {
        try {
            const token = localStorage.getItem('token');
    
            // Sesuaikan posisi untuk backend yang dimulai dari 1
            const payload = {
                sourceColumnId: sourceColumnId,
                targetColumnId: targetColumnId,
                cardId: cardId,
                newPosition: newPosition, // tetap dikirim newPosition apa adanya
            };
    
            console.log("Payload:", payload);
    
            // Panggil API untuk memindahkan kartu
            const res = await axios.put(`/api/cards/${cardId}/boards/${boardId}/move`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Move card API response:', res.data);
    
            const updatedCard = res.data.updatedCard;
    
            // Handle state update if moving within the same column
            if (sourceColumnId === targetColumnId) {
                const updatedColumns = columns.map(col => {
                    if (col.id === sourceColumnId) {
                        const updatedCards = [...col.cards];
                        const cardIndex = updatedCards.findIndex(card => card.id === cardId);
    
                        if (cardIndex !== -1) {
                            // Kurangi 1 dari posisi baru di frontend
                            const adjustedPosition = newPosition - 1;
                            const [movedCard] = updatedCards.splice(cardIndex, 1);
                            updatedCards.splice(adjustedPosition, 0, movedCard);
                        } else {
                            console.error(`Card with id ${cardId} not found in column ${sourceColumnId}`);
                        }
    
                        return { ...col, cards: updatedCards };
                    }
                    return col;
                });
    
                updateColumns(updatedColumns);
            } else {
                const updatedColumns = columns.map(col => {
                    if (col.id === sourceColumnId) {
                        return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
                    } else if (col.id === targetColumnId) {
                        if (updatedCard) {
                            const updatedCards = [...col.cards];
                            const adjustedPosition = newPosition - 1;
                            if (adjustedPosition >= 0 && adjustedPosition <= updatedCards.length) {
                                updatedCards.splice(adjustedPosition, 0, updatedCard);
                                console.log(`Moved to different column: from ${sourceColumnId} to ${targetColumnId}`);
                            } else {
                                console.error('Invalid newPosition or updatedCard is missing');
                            }
                            return { ...col, cards: updatedCards };
                        } else {
                            console.error('Updated card from backend is missing');
                        }
                    }
                    return col;
                });
    
                updateColumns(updatedColumns);
            }
    
            toast.success('Card moved successfully!');
        } catch (err) {
            console.error('Failed to move card', err);
            toast.error('Failed to move card. Please try again.');
        }
    };
    
    
    
    
    

    const handleDeleteCard = async (cardId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/cards/${cardId}/boards/${boardId}`, { // Use backticks here
                headers: { Authorization: `Bearer ${token}` }, // Also use backticks here
            });
    
            updateColumns(columns.map(col => ({
                ...col,
                cards: col.cards.filter(card => card.id !== cardId),
            })));
            toast.success('Card deleted successfully!');
        } catch (err) {
            console.error('Failed to delete card', err);
            toast.error('Failed to delete card. Please try again.');
        }
    };
    

    const updateColumns = (updatedColumns) => {
        setColumns(updatedColumns);
        // Send updated columns via WebSocket
        if (socket) {
            socket.send(JSON.stringify({ type: 'UPDATE_COLUMNS', columns: updatedColumns }));
        }
    };

    const handleAddColumn = async () => {
        const { newColumnName } = modalState;
        if (!newColumnName.trim()) {
            toast.error('Column name cannot be empty.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `/api/boards/${boardId}/columns`, // Use backticks for template literals
                { name: newColumnName, position: columns.length + 1 },
                { headers: { Authorization: `Bearer ${token}` } } // Use backticks for template literals
            );
            updateColumns([...columns, { ...res.data, cards: [] }]);
            setModalState((prevState) => ({ ...prevState, newColumnName: '', isAddingColumn: false }));
            toast.success('Column added successfully!');
        } catch (err) {
            console.error('Failed to add column', err);
            toast.error('Failed to add column. Please try again.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="w-full">
            <BoardHeader
            boardName={boardName}
            boardId={boardId}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            userRole={userRole}  // Pass userRole here
        />
            {/* Add Column Button */}
    {userRole === 'owner' || userRole === 'editor' || userRole === 'admin' ? (
    <div className="text-center mb-6">
        {modalState.isAddingColumn ? (
            <div className="flex flex-col items-center">
                <input
                    type="text"
                    value={modalState.newColumnName}
                    onChange={(e) => setModalState({ ...modalState, newColumnName: e.target.value })}
                    className="border p-2 rounded mb-2 w-64"
                    placeholder="New column name"
                />
                <div className="flex space-x-2">
                    <button onClick={handleAddColumn} className="bg-blue-500 text-white p-2 rounded shadow-sm">
                        Add Column
                    </button>
                    <button onClick={() => closeModal('isAddingColumn')} className="bg-gray-500 text-white p-2 rounded shadow-sm">
                        Cancel
                    </button>
                </div>
            </div>
        ) : (
            // Tombol atau elemen yang bisa diakses owner/editor
            <button onClick={() => openModal('isAddingColumn')} className="bg-green-500 text-white p-2 rounded shadow-sm">
                + Add Column
            </button>
        )}
    </div>
    ) : null} {/* Viewer tidak melihat tombol ini */}

                 <DndProvider backend={HTML5Backend}>
         <div className="flex space-x-4 overflow-x-auto pb-6 p-4">
             {columns && columns.length > 0 ? (
                columns.map((column) => (
                    <div key={column.id} className="flex-shrink-0 w-72">
                        <Column
                            column={column}
                            columns={columns}
                            onEditCard={(card) =>
                                openModal('isEditingCard', {
                                    editingCard: card,
                                    newCardTitle: card.title,
                                    newCardDescription: card.description,
                                })
                            }
                            onAddCard={() => openModal('isAddingCard', { targetColumnId: column.id })}
                            onMoveColumn={moveColumn}
                            onDeleteCard={handleDeleteCard}
                            onMoveCard={moveCard}
                            userRole={userRole} // kirim userRole ke komponen Column
                        />
                    </div>
                ))
            ) : (
                <p className="text-xl text-gray-500">No columns yet. Add a column to get started.</p>
            )}
        </div>
    </DndProvider>
     {/* Modal for Adding or Editing Card */}
     {(modalState.isAddingCard || modalState.isEditingCard) && (
        <div
            onClick={() => closeModal(modalState.isAddingCard ? 'isAddingCard' : 'isEditingCard')}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
            <div onClick={handleModalClick} className="bg-white p-4 rounded shadow-lg w-80">
                <h2 className="text-xl font-bold mb-4">{modalState.isAddingCard ? 'Add New Card' : 'Edit Card'}</h2>
                <input
                    type="text"
                    value={modalState.newCardTitle}
                    onChange={(e) => setModalState({ ...modalState, newCardTitle: e.target.value })}
                    className="border p-2 rounded mb-4 w-full"
                    placeholder="Card title"
                />
                <textarea
                    value={modalState.newCardDescription}
                    onChange={(e) => setModalState({ ...modalState, newCardDescription: e.target.value })}
                    className="border p-2 rounded mb-4 w-full"
                    placeholder="Card description"
                    rows="3"
                ></textarea>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={modalState.isAddingCard ? handleAddCard : handleEditCard}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {modalState.isAddingCard ? 'Add Card' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => closeModal(modalState.isAddingCard ? 'isAddingCard' : 'isEditingCard')}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )}
</div>
    );
};

export default BoardDetail;