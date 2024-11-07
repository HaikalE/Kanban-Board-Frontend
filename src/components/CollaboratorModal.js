import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CollaboratorModal = ({ isOpen, onClose, boardId,userRole }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('viewer'); // default access level
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/boards/${boardId}/collaborators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollaborators(res.data.collaborators);
    } catch (err) {
      setError('Failed to fetch collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!email.trim()) {
      toast.error('Email cannot be empty.');
      return;
    }
  
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/boards/${boardId}/collaborators`,
        { email, accessLevel },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Fetch collaborators lagi setelah collaborator ditambahkan
      await fetchCollaborators();
      setEmail('');
      toast.success('Collaborator added successfully!');
    } catch (err) {
      toast.error('Failed to add collaborator. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/boards/${boardId}/collaborators/${collaboratorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter out the deleted collaborator
      // setCollaborators(collaborators.filter((collab) => collab.id !== collaboratorId));
      await fetchCollaborators();
      toast.success('Collaborator removed successfully!');
    } catch (err) {
      toast.error('Failed to remove collaborator. Please try again.');
    }
  };
  

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={onClose}
        >
          <div
            className="bg-white w-96 p-6 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {(userRole !== 'viewer' && userRole !== 'editor') && (
              <>
            <h2 className="text-xl font-bold mb-4">Manage Collaborators</h2>

            
            <div className="mb-4">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Email"
              />
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="border p-2 rounded w-full mt-2"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleInviteCollaborator}
                className="bg-blue-500 text-white w-full py-2 mt-4 rounded"
                disabled={loading}
              >
                Invite Collaborator
              </button>
            </div>
            </>
            )}
            {/* Daftar collaborator */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Collaborators</h3>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b p-2">Email</th>
                      <th className="border-b p-2">Access Level</th>
                      {(userRole !== 'viewer' && userRole !== 'editor') && (
                      <th className="border-b p-2">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {collaborators.map((collab) => (
                      <tr key={collab.collaborator_id}>
                        <td className="border-b p-2">{collab.email}</td>
                        <td className="border-b p-2 capitalize">{collab.access_level}</td>
                        {(userRole !== 'viewer' && userRole !== 'editor') &&(
                          <td className="border-b p-2">
                            {(collab.access_level==='admin' && userRole==='admin') ?(
                            <button
                            className="bg-gray-400 text-white p-2 rounded cursor-not-allowed"
                            title="You cannot remove admin."
                            disabled
                          >
                            Cannot Remove
                          </button>
                            ):
                            (
                              <>
                              <button
                              onClick={() => handleRemoveCollaborator(collab.collaborator_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                            </>
                            )} 

                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <button
              onClick={onClose}
              className="bg-gray-500 text-white w-full py-2 mt-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CollaboratorModal;
