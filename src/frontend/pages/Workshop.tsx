import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { fetchWorkshopSteps, updateWorkshopProgress, fetchTemplates, fetchTeamMembersWithRoles, updateWorkshopPresence, fetchWorkshopPresence, fetchWorkshopSync } from "../utils/api";

interface WorkshopStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: string;
}

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

interface TeamMember {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

interface ActiveUser {
  user_id: string;
  current_step: string;
  last_seen: string;
  name: string;
  email: string;
}

export default function Workshop() {
  const [steps, setSteps] = useState<WorkshopStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("goals");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [lastSync, setLastSync] = useState<string>(new Date().toISOString());
  
  // Step data
  const [goals, setGoals] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [playOwners, setPlayOwners] = useState<Record<string, string[]>>({});
  const [signals, setSignals] = useState<Record<string, Array<{ observation: string; meaning: string; action: string }>>>({});

  useEffect(() => {
    loadWorkshopData();
    startLiveSync();
  }, []);

  useEffect(() => {
    // Update presence when current step changes
    if (currentStep) {
      updateWorkshopPresence(currentStep);
    }
  }, [currentStep]);

  async function loadWorkshopData() {
    try {
      const [workshopData, templatesData, membersData] = await Promise.all([
        fetchWorkshopSteps(),
        fetchTemplates(),
        fetchTeamMembersWithRoles()
      ]);

      setSteps(workshopData.steps || []);
      setCurrentStep(workshopData.currentStep || "goals");
      setTemplates(templatesData.templates || []);
      setTeamMembers(membersData.members || []);
    } catch (error) {
      console.error("Failed to load workshop data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function startLiveSync() {
    // Initial presence update
    await updateWorkshopPresence(currentStep);
    
    // Start polling for presence and sync updates
    const presenceInterval = setInterval(async () => {
      try {
        const [presenceData, syncData] = await Promise.all([
          fetchWorkshopPresence(),
          fetchWorkshopSync(lastSync)
        ]);
        
        setActiveUsers(presenceData.activeUsers || []);
        
        // Apply any sync updates
        if (syncData.updates && syncData.updates.length > 0) {
          // Update local state based on team changes
          // For now, just update the last sync timestamp
          setLastSync(new Date().toISOString());
        }
      } catch (error) {
        console.error("Live sync error:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(presenceInterval);
  }

  async function saveStepProgress(step: string, status: string, data?: any) {
    setSaving(true);
    try {
      await updateWorkshopProgress({
        step,
        status,
        data: data ? JSON.stringify(data) : undefined
      });
      
      // Update local step status
      setSteps(prev => prev.map(s => 
        s.id === step ? { ...s, status } : s
      ));
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setSaving(false);
    }
  }

  function getStepStatus(stepId: string): string {
    const step = steps.find(s => s.id === stepId);
    return step?.status || "pending";
  }

  function canAccessStep(stepId: string): boolean {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === 0) return true;
    
    // Check if previous step is completed
    const previousStep = steps[stepIndex - 1];
    return previousStep?.status === "completed";
  }

  function getStepBadge(status: string) {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✓ Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">⟳ In Progress</Badge>;
      default:
        return <Badge variant="secondary">⏳ Pending</Badge>;
    }
  }

  function getActiveUsersForStep(stepId: string): ActiveUser[] {
    return activeUsers.filter(user => user.current_step === stepId);
  }

  async function handleStepComplete(stepId: string) {
    let stepData: any = {};
    
    switch (stepId) {
      case "goals":
        stepData = { goals };
        break;
      case "plays":
        stepData = { selectedTemplates: selectedTemplates.map(t => ({ id: t.id, title: t.title })) };
        break;
      case "owners":
        stepData = { playOwners };
        break;
      case "signals":
        stepData = { signals };
        break;
      case "review":
        stepData = { completed: true };
        break;
    }

    await saveStepProgress(stepId, "completed", stepData);
    
    // Move to next step
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  }

  function toggleTemplate(template: Template) {
    setSelectedTemplates(prev => 
      prev.find(t => t.id === template.id)
        ? prev.filter(t => t.id !== template.id)
        : [...prev, template]
    );
  }

  function addPlayOwner(playId: string, userId: string) {
    setPlayOwners(prev => ({
      ...prev,
      [playId]: [...(prev[playId] || []), userId]
    }));
  }

  function removePlayOwner(playId: string, userId: string) {
    setPlayOwners(prev => ({
      ...prev,
      [playId]: (prev[playId] || []).filter(id => id !== userId)
    }));
  }

  function addSignal(playId: string) {
    setSignals(prev => ({
      ...prev,
      [playId]: [...(prev[playId] || []), { observation: "", meaning: "", action: "" }]
    }));
  }

  function updateSignal(playId: string, index: number, field: string, value: string) {
    setSignals(prev => ({
      ...prev,
      [playId]: (prev[playId] || []).map((signal, i) => 
        i === index ? { ...signal, [field]: value } : signal
      )
    }));
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading workshop...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎯 Team Workshop</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your marketing strategy in 5 simple steps
        </p>
        
        {/* Live collaboration indicator */}
        {activeUsers.length > 0 && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activeUsers.length} team member{activeUsers.length !== 1 ? 's' : ''} active
            </span>
          </div>
        )}
      </div>

      {/* Stepper Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-4">
          {steps.map((step, index) => {
            const stepActiveUsers = getActiveUsersForStep(step.id);
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canAccessStep(step.id) && setCurrentStep(step.id)}
                  disabled={!canAccessStep(step.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
                    currentStep === step.id
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : canAccessStep(step.id)
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      : "bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <span className="text-sm font-medium">{index + 1}</span>
                  <span className="text-sm">{step.title}</span>
                  {getStepBadge(step.status)}
                  
                  {/* Active users indicator */}
                  {stepActiveUsers.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {stepActiveUsers.length}
                    </div>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Users Panel */}
      {activeUsers.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              👥 Live Collaboration
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeUsers.map((user) => (
                <div key={user.user_id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {steps.find(s => s.id === user.current_step)?.title || user.current_step}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {steps.find(s => s.id === currentStep)?.title}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {steps.find(s => s.id === currentStep)?.estimatedTime}
              </span>
              {/* Show who's currently on this step */}
              {getActiveUsersForStep(currentStep).length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveUsersForStep(currentStep).length} active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Define Team Goals */}
          {currentStep === "goals" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps.find(s => s.id === "goals")?.description}
              </p>
              <Textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Define your team's marketing goals and objectives..."
                rows={6}
              />
              <Button 
                onClick={() => handleStepComplete("goals")}
                disabled={!goals.trim() || saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Continue to Select Plays"}
              </Button>
            </div>
          )}

          {/* Step 2: Select Plays */}
          {currentStep === "plays" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps.find(s => s.id === "plays")?.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTemplates.find(t => t.id === template.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => toggleTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{template.title}</h4>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => handleStepComplete("plays")}
                disabled={selectedTemplates.length === 0 || saving}
                className="w-full"
              >
                {saving ? "Saving..." : `Continue with ${selectedTemplates.length} Play${selectedTemplates.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          )}

          {/* Step 3: Assign Owners */}
          {currentStep === "owners" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps.find(s => s.id === "owners")?.description}
              </p>
              {selectedTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{template.title}</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign Owners:</label>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((member) => (
                        <button
                          key={member.user_id}
                          onClick={() => {
                            const isAssigned = playOwners[template.id]?.includes(member.user_id);
                            if (isAssigned) {
                              removePlayOwner(template.id, member.user_id);
                            } else {
                              addPlayOwner(template.id, member.user_id);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            playOwners[template.id]?.includes(member.user_id)
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {member.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => handleStepComplete("owners")}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Continue to Set Signals"}
              </Button>
            </div>
          )}

          {/* Step 4: Set Signals */}
          {currentStep === "signals" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps.find(s => s.id === "signals")?.description}
              </p>
              {selectedTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{template.title}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addSignal(template.id)}
                    >
                      Add Signal
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(signals[template.id] || []).map((signal, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          placeholder="Observation"
                          value={signal.observation}
                          onChange={(e) => updateSignal(template.id, index, "observation", e.target.value)}
                        />
                        <Input
                          placeholder="Meaning"
                          value={signal.meaning}
                          onChange={(e) => updateSignal(template.id, index, "meaning", e.target.value)}
                        />
                        <Input
                          placeholder="Action"
                          value={signal.action}
                          onChange={(e) => updateSignal(template.id, index, "action", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => handleStepComplete("signals")}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Continue to Review"}
              </Button>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === "review" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {steps.find(s => s.id === "review")?.description}
              </p>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Team Goals</h4>
                  <p className="text-gray-600 dark:text-gray-400">{goals}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Selected Plays ({selectedTemplates.length})</h4>
                  <div className="space-y-2">
                    {selectedTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between">
                        <span>{template.title}</span>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleStepComplete("review")}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Complete Workshop"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 