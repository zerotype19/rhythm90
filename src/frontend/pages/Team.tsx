import { useState, useEffect } from 'react';
import { fetchTeamMembers, addTeamMember, removeTeamMember } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
      <h1 className="text-3xl font-bold text-rhythmBlack dark:text-white mb-8">Team Management</h1>
      
      {/* Add Member Form */}
      <Card className="mb-8 transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID
              </label>
              <Input
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rhythmRed focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-rhythmRed transition-colors"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <Button
              onClick={handleAddMember}
              className="transition-all hover:scale-105"
            >
              Add Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No team members found.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <Card key={member.user_id} className="transition-all hover:shadow-md hover:scale-[1.01]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{member.user_id}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({member.role})</span>
                      </div>
                      <Button
                        onClick={() => handleRemoveMember(member.user_id)}
                        variant="destructive"
                        size="sm"
                        className="transition-all hover:scale-105"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 