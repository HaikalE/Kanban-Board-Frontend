# Kanban Board — Frontend

React frontend for a full-stack task-management application with boards, task status tracking, deadlines, drag-and-drop interaction, and real-time updates from the backend.

The project was built to practice state synchronization across a multi-user interface rather than a static task list. Changes made by one connected client can be propagated through Socket.IO so other clients receive updated board state without manually refreshing.

## Features

- board and task management
- task status columns and drag-and-drop movement
- deadlines and task metadata
- authentication-aware application flow
- REST API integration with Axios
- real-time updates through Socket.IO
- client-side routing
- Redux Toolkit state management

## Stack

- React 18
- Redux Toolkit
- React Router
- Axios
- Socket.IO Client
- React DnD / React Beautiful DnD
- Tailwind CSS

## Related backend

[HaikalE/Kanban-Board-Backend](https://github.com/HaikalE/Kanban-Board-Backend)

The frontend is configured to proxy local API requests to `http://localhost:5000` during development.

## Running locally

```bash
git clone https://github.com/HaikalE/Kanban-Board-Frontend.git
cd Kanban-Board-Frontend
npm install
npm start
```

Run the backend separately before testing API-dependent or real-time features.

## Engineering focus

The main learning objective was coordinating several forms of application state: local interaction state, persisted server data, and events arriving asynchronously from other clients. The project also provided practical experience integrating REST operations with a WebSocket-style update channel in the same UI.

## Author

Muhammad Haikal Rahman  
[GitHub](https://github.com/HaikalE) · [Portfolio](https://haikale.github.io)
