export interface TreeNode {
  id: string;
  title: string;
  type: 'phase' | 'step' | 'checkpoint';
  status: 'completed' | 'in-progress' | 'locked';
  children?: TreeNode[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
  connections: string[];
  type: 'main' | 'sub' | 'detail';
}

export const learningTree: TreeNode = {
  id: 'root',
  title: 'React Fundamentals',
  type: 'phase',
  status: 'in-progress',
  children: [
    {
      id: 'phase-1',
      title: 'Phase 1: Core Concepts',
      type: 'phase',
      status: 'completed',
      children: [
        { id: 'step-1-1', title: 'JSX Syntax', type: 'step', status: 'completed' },
        { id: 'step-1-2', title: 'Components', type: 'step', status: 'completed' },
        { id: 'step-1-3', title: 'Props & State', type: 'step', status: 'completed' },
        { id: 'checkpoint-1', title: 'Checkpoint: Build a Counter', type: 'checkpoint', status: 'completed' },
      ]
    },
    {
      id: 'phase-2',
      title: 'Phase 2: Hooks',
      type: 'phase',
      status: 'in-progress',
      children: [
        { id: 'step-2-1', title: 'useState', type: 'step', status: 'completed' },
        { id: 'step-2-2', title: 'useEffect', type: 'step', status: 'in-progress' },
        { id: 'step-2-3', title: 'useContext', type: 'step', status: 'locked' },
        { id: 'step-2-4', title: 'Custom Hooks', type: 'step', status: 'locked' },
        { id: 'checkpoint-2', title: 'Checkpoint: Data Fetching', type: 'checkpoint', status: 'locked' },
      ]
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Advanced Patterns',
      type: 'phase',
      status: 'locked',
      children: [
        { id: 'step-3-1', title: 'Render Props', type: 'step', status: 'locked' },
        { id: 'step-3-2', title: 'Higher-Order Components', type: 'step', status: 'locked' },
        { id: 'step-3-3', title: 'Compound Components', type: 'step', status: 'locked' },
        { id: 'checkpoint-3', title: 'Checkpoint: Build a Modal System', type: 'checkpoint', status: 'locked' },
      ]
    },
  ]
};

export const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Welcome back! You're making great progress on React Hooks. Let's continue with useEffect - the hook for side effects.",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    role: 'user',
    content: "Can you explain the dependency array in useEffect?",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    role: 'assistant',
    content: "Great question! I've created a visual explanation in the content panel. The dependency array controls when your effect runs - it's like telling React 'only re-run this effect when these specific values change.'",
    timestamp: new Date(Date.now() - 180000),
  },
];

export const flashcards: Flashcard[] = [
  {
    id: 'fc-1',
    question: 'What is the purpose of useEffect?',
    answer: 'useEffect lets you perform side effects in function components, such as data fetching, subscriptions, or manually changing the DOM.',
    topic: 'Hooks',
  },
  {
    id: 'fc-2',
    question: 'What happens when you pass an empty dependency array []?',
    answer: 'The effect runs only once after the initial render, similar to componentDidMount in class components.',
    topic: 'Hooks',
  },
  {
    id: 'fc-3',
    question: 'What is the cleanup function in useEffect?',
    answer: 'A function returned from useEffect that runs before the component unmounts or before the effect runs again, used to clean up subscriptions or timers.',
    topic: 'Hooks',
  },
];

export const conceptMap: ConceptNode[] = [
  { id: 'useEffect', label: 'useEffect', x: 50, y: 50, connections: ['deps', 'cleanup', 'callback'], type: 'main' },
  { id: 'deps', label: 'Dependencies', x: 20, y: 30, connections: ['empty', 'values'], type: 'sub' },
  { id: 'cleanup', label: 'Cleanup', x: 80, y: 30, connections: ['unmount', 'rerun'], type: 'sub' },
  { id: 'callback', label: 'Effect Callback', x: 50, y: 80, connections: ['async', 'sync'], type: 'sub' },
  { id: 'empty', label: '[] = once', x: 10, y: 10, connections: [], type: 'detail' },
  { id: 'values', label: '[a,b] = watch', x: 30, y: 10, connections: [], type: 'detail' },
  { id: 'unmount', label: 'On unmount', x: 70, y: 10, connections: [], type: 'detail' },
  { id: 'rerun', label: 'Before re-run', x: 90, y: 10, connections: [], type: 'detail' },
  { id: 'async', label: 'Async pattern', x: 40, y: 95, connections: [], type: 'detail' },
  { id: 'sync', label: 'Sync execution', x: 60, y: 95, connections: [], type: 'detail' },
];

export const codeExample = `// useEffect Example
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Effect callback
    async function fetchUser() {
      setLoading(true);
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      setUser(data);
      setLoading(false);
    }

    fetchUser();

    // Cleanup function
    return () => {
      // Cancel any pending requests
      console.log('Cleanup on userId change');
    };
  }, [userId]); // Dependency array

  if (loading) return <Spinner />;
  return <div>{user?.name}</div>;
}`;
