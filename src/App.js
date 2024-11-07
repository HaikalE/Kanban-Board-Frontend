import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </DndProvider>
    );
}

export default App;


// import React from 'react';
// import { Route, Routes } from 'react-router-dom';
// import Register from './components/Register';
// import Dashboard from './pages/Dashboard';
// import Login from './components/Login';
// import Home from './pages/Home';
// import BoardDetail from './pages/BoardDetail';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

// function App() {
//     return (
//         <DndProvider backend={HTML5Backend}>
//             <Routes>
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route
//                     path="/board/:boardId"
//                     element={<BoardDetail />}
//                 />
//                 <Route path="/" element={<Home />} />
//             </Routes>
//         </DndProvider>
//     );
// }

// export default App;