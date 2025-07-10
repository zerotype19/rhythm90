import { useDemo } from "../contexts/DemoContext";

export function useDemoSafeguard() {
  const { isDemoMode } = useDemo();

  const getDemoTooltip = (action: string) => {
    return isDemoMode ? `Disabled in demo mode - ${action}` : undefined;
  };

  const isDisabled = (action: string) => {
    return isDemoMode;
  };

  return {
    isDemoMode,
    getDemoTooltip,
    isDisabled,
  };
} 