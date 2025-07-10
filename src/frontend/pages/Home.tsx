import { Button } from "../components/ui/button";

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold text-rhythmRed mb-4">Welcome to Rhythm90.io</h1>
      <p className="text-lg text-rhythmGray dark:text-gray-300 mb-8">Your team's digital toolbox to run smarter marketing quarters.</p>
      <Button className="transition-all hover:scale-105">Try a shadcn/ui Button</Button>
    </div>
  );
} 