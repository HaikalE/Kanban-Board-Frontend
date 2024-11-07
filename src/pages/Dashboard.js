import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BoardDetail from './BoardDetail';
import { PlusIcon, X, ChevronRight, MoreVertical, Trash2, Edit2 } from 'lucide-react';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [boards, setBoards] = useState([]);
    const [newBoardName, setNewBoardName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeBoardType, setActiveBoardType] = useState('my');
    const [openKebabMenu, setOpenKebabMenu] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiEndpoint = activeBoardType === 'my' ? '/api/boards' : '/api/collaborator-boards';
                const res = await axios.get(apiEndpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBoards(res.data);
            } catch (err) {
                console.error('Failed to fetch boards', err);
            }
        };

        fetchBoards();
    }, [activeBoardType]);

    const addBoard = async () => {
        if (newBoardName.trim() !== '') {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post('/api/boards', { name: newBoardName }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBoards([...boards, res.data]);
                setNewBoardName('');
            } catch (err) {
                console.error('Failed to add board', err);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleDelete = (boardId) => {
        console.log(`Delete board with ID: ${boardId}`);
    };

    const handleRename = (boardId) => {
        console.log(`Rename board with ID: ${boardId}`);
    };

    const toggleKebabMenu = (boardId) => {
        if (openKebabMenu === boardId) {
            setOpenKebabMenu(null);
        } else {
            setOpenKebabMenu(boardId);
        }
    };

    // Handle closing kebab menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.kebab-container')) {
                setOpenKebabMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isAtBoardDetail = location.pathname.startsWith('/dashboard/board/');

    return (
        <div className="flex h-screen bg-gray-100 relative">
            {isSidebarOpen && (
                <aside className="w-64 bg-white shadow-md relative h-screen flex flex-col">
                    <div className="flex justify-between items-center p-4 flex-shrink-0">
                        <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-200">
                            <X className="h-6 w-6" />
                        </button>
                        <h1 className="text-2xl font-bold flex-grow text-center">Kanban Boards</h1>
                    </div>

                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Search boards..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-around p-4">
                        <button
                            onClick={() => setActiveBoardType('my')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeBoardType === 'my' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                        >
                            My Boards
                        </button>
                        <button
                            onClick={() => setActiveBoardType('collaboration')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeBoardType === 'collaboration' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                        >
                            Collaboration Boards
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-grow">  
                        <nav>
                            {boards
                                .filter(board => board.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(board => (
                                    <div
                                        key={board.id}
                                        className="group kebab-container relative flex justify-between items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                                    >
                                        <Link
                                            to={`/dashboard/board/${board.id}`}
                                            className="flex-grow"
                                        >
                                            {board.name}
                                        </Link>
                                        <button
                                            onClick={() => toggleKebabMenu(board.id)}
                                            className="p-2 rounded hidden group-hover:block hover:bg-gray-200"
                                        >
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                        {/* Kebab menu, muncul saat tombol di-hover */}
                                        {openKebabMenu === board.id && (
                                            <KebabMenu
                                                boardId={board.id}
                                                onDelete={handleDelete}
                                                onRename={handleRename}
                                            />
                                        )}
                                    </div>
                                ))}
                        </nav>
                        
                    </div>
                    <div className="mt-4 p-4">
                            <input
                                type="text"
                                placeholder="New board name"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 w-full"
                            />
                            <button
                                onClick={addBoard}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full flex items-center justify-center"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" /> Add Board
                            </button> 
                    </div>
                </aside>
            )}

            {!isSidebarOpen && (location.pathname === '/dashboard' || location.pathname === '/dashboard/') && (
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 left-4 bg-gray-200 p-2 rounded hover:bg-gray-300 z-50"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}

            <main className={isAtBoardDetail ? "flex-1 overflow-auto" : "flex-1 flex items-center justify-center"}>
                <Routes>
                    <Route path="board/:boardId" element={<BoardDetail isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
                    <Route path="/" element={
                        <div className="text-center">
                            <p className="text-gray-600 text-xl font-semibold">
                                Select a board to view details
                            </p>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
};

const KebabMenu = ({ boardId, onDelete, onRename }) => {
    return (
        <div className="absolute top-0 right-0 mt-2 mr-4 z-50 w-24 bg-white shadow-lg rounded-md">
            <ul className="text-gray-700 flex flex-col gap-2">
                <li
                    onClick={() => onDelete(boardId)}
                    className="p-2 flex items-center cursor-pointer"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </li>
                <li
                    onClick={() => onRename(boardId)}
                    className="p-2 flex items-center cursor-pointer"
                >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rename
                </li>
            </ul>
        </div>
    );
};

export default Dashboard;











// import React, { useState, useEffect } from 'react';
// import { Link, Route, Routes, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import BoardDetail from './BoardDetail';
// import { PlusIcon, MoreVertical, X, ChevronRight } from 'lucide-react';

// const Dashboard = () => {
//     const Button = ({ children, onClick, className = '' }) => {
//         return (
//             <button
//                 onClick={onClick}
//                 className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${className}`}
//             >
//                 {children}
//             </button>
//         );
//     };

//     const Input = ({ type, placeholder, value, onChange, className = '' }) => {
//         return (
//             <input
//                 type={type}
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={onChange}
//                 className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
//             />
//         );
//     };

//     const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
//     const [boards, setBoards] = useState([]);
//     const [newBoardName, setNewBoardName] = useState('');
//     const [showDropdown, setShowDropdown] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchBoards = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.get('/api/boards', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setBoards(res.data);
//             } catch (err) {
//                 console.error('Failed to fetch boards', err);
//             }
//         };

//         fetchBoards();
//     }, []);

//     const addBoard = async () => {
//         if (newBoardName.trim() !== '') {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.post('/api/boards', { name: newBoardName }, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setBoards([...boards, res.data]);
//                 setNewBoardName('');
//             } catch (err) {
//                 console.error('Failed to add board', err);
//             }
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         navigate('/login');
//     };

//     const toggleDropdown = () => {
//         setShowDropdown(!showDropdown);
//     };

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     return (
//         <div className="flex h-screen bg-gray-100">
//             {isSidebarOpen && (
//     <aside className="w-64 bg-white shadow-md relative h-screen flex flex-col">
//         {/* Fixed header */}
//         <div className="flex justify-between items-center p-4 flex-shrink-0">
//             <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-200">
//                 <X className="h-6 w-6" />
//             </button>
//             <h1 className="text-2xl font-bold flex-grow text-center">Kanban Boards</h1>
//         </div>

//         {/* Scrollable content */}
//         <div className="overflow-y-auto flex-grow">
//             <nav>
//                 {boards.map(board => (
//                     <Link
//                         key={board.id}
//                         to={`/dashboard/board/${board.id}`}
//                         className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
//                     >
//                         {board.name}
//                     </Link>
//                 ))}
//             </nav>
//             <div className="mt-4 p-4">
//                 <Input
//                     type="text"
//                     placeholder="New board name"
//                     value={newBoardName}
//                     onChange={(e) => setNewBoardName(e.target.value)}
//                     className="mb-2 w-full"
//                 />
//                 <Button onClick={addBoard} className="w-full flex items-center justify-center">
//                     <PlusIcon className="mr-2 h-4 w-4" /> Add Board
//                 </Button>
//             </div>
//         </div>
//     </aside>
// )}


//             <main className="flex-1 overflow-auto">
//                 <Routes>
//                     <Route path="board/:boardId" element={<BoardDetail isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
//                     <Route path="/" element={<div>Select a board to view details</div>} />
//                 </Routes>
//             </main>
//         </div>
//     );
// };

// export default Dashboard;



// import React, { useState, useEffect } from 'react';
// import { Link, Route, Routes, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import BoardDetail from './BoardDetail';
// import { PlusIcon, MoreVertical, X, ChevronRight } from 'lucide-react'; // Tambahkan MoreVertical

// const Dashboard = () => {
//     const Button = ({ children, onClick, className = '' }) => {
//         return (
//             <button
//                 onClick={onClick}
//                 className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${className}`}
//             >
//                 {children}
//             </button>
//         );
//     };

//     const Input = ({ type, placeholder, value, onChange, className = '' }) => {
//         return (
//             <input
//                 type={type}
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={onChange}
//                 className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
//             />
//         );
//     };
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
//     const [boards, setBoards] = useState([]);
//     const [newBoardName, setNewBoardName] = useState('');
//     const [showDropdown, setShowDropdown] = useState(false); // State untuk mengontrol dropdown
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchBoards = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.get('/api/boards', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setBoards(res.data);
//             } catch (err) {
//                 console.error('Failed to fetch boards', err);
//             }
//         };

//         fetchBoards();
//     }, []);

//     const addBoard = async () => {
//         if (newBoardName.trim() !== '') {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.post('/api/boards', { name: newBoardName }, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setBoards([...boards, res.data]);
//                 setNewBoardName('');
//             } catch (err) {
//                 console.error('Failed to add board', err);
//             }
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         navigate('/login');
//     };

//     const toggleDropdown = () => {
//         setShowDropdown(!showDropdown);
//     };
//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };
//     return (
//         <div className="flex h-screen bg-gray-100">
//             {!isSidebarOpen && (
//             <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-200">
//                             <ChevronRight className="h-6 w-6" />
//                         </button>
//             )}
//             {/* <aside className="w-64 bg-white shadow-md">
//                 <div className="p-4 flex justify-between items-center">
//                     <h1 className="text-2xl font-bold">Kanban Boards</h1>
//                     <div className="relative">
//                         <button onClick={toggleDropdown} className="p-2 rounded hover:bg-gray-200">
//                             <MoreVertical className="h-6 w-6" />
//                         </button>
//                         {showDropdown && (
//                             <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded">
//                                 <button
//                                     onClick={handleLogout}
//                                     className="block px-4 py-2 text-left text-gray-700 hover:bg-gray-100 w-full"
//                                 >
//                                     Log Out
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <nav>
//                     {boards.map(board => (
//                         <Link
//                             key={board.id}
//                             to={`/dashboard/board/${board.id}`}
//                             className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
//                         >
//                             {board.name}
//                         </Link>
//                     ))}
//                 </nav>
//                 <div className="mt-4 p-4">
//                     <Input
//                         type="text"
//                         placeholder="New board name"
//                         value={newBoardName}
//                         onChange={(e) => setNewBoardName(e.target.value)}
//                         className="mb-2 w-full"
//                     />
//                     <Button onClick={addBoard} className="w-full flex items-center justify-center">
//                         <PlusIcon className="mr-2 h-4 w-4" /> Add Board
//                     </Button>
//                 </div>
//             </aside> */}
//             {isSidebarOpen && (
//                 <aside className="w-64 bg-white shadow-md relative">
//                     <div className="p-4 flex justify-between items-center">
//                         <h1 className="text-2xl font-bold">Kanban Boards</h1>
//                         <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-200">
//                             <X className="h-6 w-6" />
//                         </button>
//                     </div>
//                     <nav>
//                         {boards.map(board => (
//                             <Link
//                                 key={board.id}
//                                 to={`/dashboard/board/${board.id}`}
//                                 className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
//                             >
//                                 {board.name}
//                             </Link>
//                         ))}
//                     </nav>
//                     <div className="mt-4 p-4">
//                         <Input
//                             type="text"
//                             placeholder="New board name"
//                             value={newBoardName}
//                             onChange={(e) => setNewBoardName(e.target.value)}
//                             className="mb-2 w-full"
//                         />
//                         <Button onClick={addBoard} className="w-full flex items-center justify-center">
//                             <PlusIcon className="mr-2 h-4 w-4" /> Add Board
//                         </Button>
//                     </div>
//                 </aside>
//             )}

//             <main className="flex-1  overflow-auto">
//                 <Routes>
//                     <Route path="board/:boardId" element={<BoardDetail />} />
//                     <Route path="/" element={<div>Select a board to view details</div>} />
//                 </Routes>
//             </main>
//         </div>
//     );
// };

// export default Dashboard;

