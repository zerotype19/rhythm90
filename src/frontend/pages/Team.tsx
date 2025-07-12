import { useState, useEffect } from 'react';
import { fetchTeamMembers, addTeamMember, removeTeamMember } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Loading from '../components/Loading';
import AppLayout from '../components/AppLayout';
import CreateTeamModal from '../components/CreateTeamModal';

interface Team {
  id: string;
  name: string;
  created_at: string;
  user_role: string;
  is_current_team: boolean;
}

export default function Team() {
  const [members, setMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, teamsData] = await Promise.all([
        fetchTeamMembers().catch(() => []),
        fetch('/api/teams', { credentials: 'include' }).then(res => res.json()).catch(() => ({ teams: [] }))
      ]);
      
      setMembers(membersData);
      setTeams(teamsData.teams || []);
    } catch (error) {
      console.error('Failed to load team data:', error);
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
      await loadData();
    } catch (error) {
      console.error('Failed to add team member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(userId);
      await loadData();
    } catch (error) {
      console.error('Failed to remove team member:', error);
    }
  };

  const handleSwitchTeam = async (teamId: string) => {
    try {
      const response = await fetch('/api/teams/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teamId })
      });

      if (response.ok) {
        await loadData(); // Refresh data to update current team indicator
      } else {
        console.error('Failed to switch team');
      }
    } catch (error) {
      console.error('Error switching team:', error);
    }
  };

  const handleSuccess = () => {
    loadData(); // Refresh data after successful creation
  };

  if (loading) return <Loading />;

  return (
    <AppLayout maxWidth="4xl" className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-rhythmBlack dark:text-white">Team Management</h1>
        <Button
          onClick={() => setShowCreateTeamModal(true)}
          className="transition-all hover:scale-105"
        >
          Create New Team
        </Button>
      </div>

      {/* Teams List */}
      {teams.length > 0 && (
        <Card className="mb-8 transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Your Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.map((team) => (
                <Card key={team.id} className="transition-all hover:shadow-md hover:scale-[1.01]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{team.name}</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {team.user_role}
                            </Badge>
                            {team.is_current_team && (
                              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!team.is_current_team && (
                          <Button
                            onClick={() => handleSwitchTeam(team.id)}
                            variant="outline"
                            size="sm"
                            className="transition-all hover:scale-105"
                          >
                            Switch to
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  );
} 