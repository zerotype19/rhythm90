import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

interface OnboardingStepProps {
  onNext: (data?: any) => void;
  onBack: () => void;
  onSkip?: () => void;
  data?: any;
  user?: any;
}

// Step 1: Complete Profile
const ProfileStep: React.FC<OnboardingStepProps> = ({ onNext, user }) => {
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    onNext({ name, role });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-muted-foreground">Let's get to know you better</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Role/Title</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select your role</option>
            <option value="founder">Founder</option>
            <option value="ceo">CEO</option>
            <option value="marketing_manager">Marketing Manager</option>
            <option value="growth_hacker">Growth Hacker</option>
            <option value="product_manager">Product Manager</option>
            <option value="consultant">Consultant</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <Button onClick={handleNext} className="w-full">
        Continue
      </Button>
    </div>
  );
};

// Step 2: Create or Join Team
const TeamStep: React.FC<OnboardingStepProps> = ({ onNext, onBack, data }) => {
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/onboarding/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        onNext({ team: result.team });
      } else {
        setError(result.message || 'Failed to create team');
      }
    } catch (error) {
      setError('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/onboarding/join-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        onNext({ team: result.team });
      } else {
        setError(result.message || 'Failed to join team');
      }
    } catch (error) {
      setError('Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'create') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Create a New Team</h2>
          <p className="text-muted-foreground">Start your team and invite others to collaborate</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Team Name *</label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setStep('choice')} className="flex-1">
            Back
          </Button>
          <Button onClick={handleCreateTeam} disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'join') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Join Existing Team</h2>
          <p className="text-muted-foreground">Enter the invite code to join a team</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Invite Code *</label>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full uppercase"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setStep('choice')} className="flex-1">
            Back
          </Button>
          <Button onClick={handleJoinTeam} disabled={loading} className="flex-1">
            {loading ? 'Joining...' : 'Join Team'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create or Join a Team</h2>
        <p className="text-muted-foreground">Teams help you collaborate and organize your marketing plays</p>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <details className="group">
            <summary className="cursor-pointer font-medium text-blue-900">
              Why do I need a team? <span className="group-open:hidden">▼</span><span className="hidden group-open:inline">▲</span>
            </summary>
            <p className="mt-2 text-blue-800 text-sm">
              Teams allow you to collaborate with colleagues, share plays and signals, 
              and organize your marketing efforts. You can invite team members using 
              invite codes and manage permissions.
            </p>
          </details>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep('create')}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Create New Team</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start a new team and become the owner. You can invite others later.
            </p>
            <Button variant="outline" className="w-full">Create Team</Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep('join')}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Join Existing Team</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join a team using an invite code from a team member.
            </p>
            <Button variant="outline" className="w-full">Join Team</Button>
          </CardContent>
        </Card>
      </div>
      
      <Button variant="outline" onClick={onBack} className="w-full">
        Back
      </Button>
    </div>
  );
};

// Step 3: Create First Play
const PlayStep: React.FC<OnboardingStepProps> = ({ onNext, onBack, data }) => {
  const [playName, setPlayName] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');

  const handleNext = () => {
    if (!playName.trim()) {
      alert('Please enter a play name');
      return;
    }
    onNext({ playName, targetOutcome });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Your First Play</h2>
        <p className="text-muted-foreground">A play is a marketing strategy you want to test</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Play Name *</label>
          <Input
            value={playName}
            onChange={(e) => setPlayName(e.target.value)}
            placeholder="e.g., Increase Email Engagement"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Target Outcome</label>
          <Input
            value={targetOutcome}
            onChange={(e) => setTargetOutcome(e.target.value)}
            placeholder="e.g., Boost open rates by 25%"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Create Play
        </Button>
      </div>
    </div>
  );
};

// Step 4: Log First Signal
const SignalStep: React.FC<OnboardingStepProps> = ({ onNext, onBack, data }) => {
  const [observation, setObservation] = useState('');
  const [playId, setPlayId] = useState('');

  const handleNext = () => {
    if (!observation.trim()) {
      alert('Please enter an observation');
      return;
    }
    onNext({ observation, playId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Log Your First Signal</h2>
        <p className="text-muted-foreground">Signals are observations that help you understand what's working</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Play</label>
          <select
            value={playId}
            onChange={(e) => setPlayId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a play</option>
            <option value="demo-play-1">Increase Email Engagement</option>
            <option value="demo-play-2">Boost Conversion</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Observation *</label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="What did you observe? e.g., Email open rate increased by 30%"
            className="w-full p-2 border border-gray-300 rounded-md h-24"
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Log Signal
        </Button>
      </div>
    </div>
  );
};

// Step 5: Wrap-up
const WrapUpStep: React.FC<OnboardingStepProps> = ({ onNext, user }) => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground">Welcome to Rhythm90. You've successfully completed onboarding.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium">Profile</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium">Team</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium">Play</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium">Signal</div>
        </div>
      </div>
      
      <Button onClick={handleComplete} className="w-full">
        Continue to Dashboard
      </Button>
    </div>
  );
};

const Onboarding: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<any>({});
  const [showSkip, setShowSkip] = useState(false);

  const steps: OnboardingStep[] = [
    { id: 'profile', title: 'Profile', description: 'Complete your profile', component: ProfileStep },
    { id: 'team', title: 'Team', description: 'Create or join a team', component: TeamStep },
    { id: 'play', title: 'Play', description: 'Create your first play', component: PlayStep },
    { id: 'signal', title: 'Signal', description: 'Log your first signal', component: SignalStep },
    { id: 'wrapup', title: 'Complete', description: 'You\'re all set!', component: WrapUpStep }
  ];

  useEffect(() => {
    if (!loading && user) {
      // Check if user has completed onboarding
      if (user.current_team_id) {
        navigate('/dashboard');
      }
      
      // Show skip option for admins
      setShowSkip(user.role === 'admin');
    }
  }, [user, loading, navigate]);

  const handleNext = (data?: any) => {
    if (data) {
      setStepData({ ...stepData, ...data });
    }
    
    // Mark step as completed
    fetch('/onboarding/complete-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ step: steps[currentStep].id })
    });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch('/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const result = await response.json();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Welcome to Rhythm90</h1>
              <Badge variant="secondary">Step {currentStep + 1} of {steps.length}</Badge>
            </div>
            {showSkip && currentStep < steps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Onboarding
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={index <= currentStep ? 'text-blue-600 font-medium' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              data={stepData}
              user={user}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding; 