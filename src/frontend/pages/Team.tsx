import { useState, useEffect } from 'react';
import { fetchTeamMembers, addTeamMember, removeTeamMember } from '../utils/api';
import Loading from '../components/Loading';

export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('member');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await fetchTeamMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newUserId.trim()) return;
    
    try {
      await addTeamMember(newUserId, newRole);
      setNewUserId('');
      setNewRole('member');
      await loadMembers();
    } catch (error) {
      console.error('Failed to add team member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(userId);
      await loadMembers();
    } catch (error) {
      console.error('Failed to remove team member:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-rhythmBlack mb-8">Team Management</h1>
      
      {/* Add Member Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed"
              placeholder="Enter user ID"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rhythmRed"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button
            onClick={handleAddMember}
            className="px-4 py-2 bg-rhythmRed text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Add Member
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        {members.length === 0 ? (
          <p className="text-gray-500">No team members found.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <span className="font-medium">{member.user_id}</span>
                  <span className="ml-2 text-sm text-gray-500">({member.role})</span>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.user_id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 