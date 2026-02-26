import type { ContentBlock } from '../types/content-blocks';

export const RICH_CODE_COUNTER: ContentBlock[] = [
  {
    type: 'code',
    language: 'tsx',
    filename: 'Counter.tsx',
    value: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p className="text-4xl font-bold">{count}</p>
      <div className="flex gap-2">
        <button onClick={() => setCount(count - 1)}>−</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
    </div>
  );
}`,
  },
];

export const RICH_CODE_TOPIC: Record<string, ContentBlock[]> = {
  useState: [
    {
      type: 'code',
      language: 'tsx',
      filename: 'useState.tsx',
      value: `import { useState } from 'react';

// Basic pattern
const [value, setValue] = useState(initialValue);

// Example: toggle
function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button onClick={() => setOn(!on)}>
      {on ? 'ON' : 'OFF'}
    </button>
  );
}`,
    },
  ],
  useEffect: [
    {
      type: 'code',
      language: 'tsx',
      filename: 'useEffect.tsx',
      value: `import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Runs after render when userId changes
    fetchUser(userId).then(setUser);

    // Cleanup runs before next effect or unmount
    return () => {
      // cancel pending requests here
    };
  }, [userId]); // dependency array

  return <div>{user?.name}</div>;
}`,
    },
  ],
  useContext: [
    {
      type: 'code',
      language: 'tsx',
      filename: 'useContext.tsx',
      value: `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('light');

// Provider wraps the tree
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={theme}>
      <DeepChild />
    </ThemeContext.Provider>
  );
}

// Any descendant can consume without prop drilling
function DeepChild() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Hello</div>;
}`,
    },
  ],
  useCallback: [
    {
      type: 'code',
      language: 'tsx',
      filename: 'useCallback.tsx',
      value: `import { useState, useCallback, memo } from 'react';

// Without useCallback: new function reference on every render
// → ExpensiveList re-renders every time Parent renders

const ExpensiveList = memo(({ onItemClick }: { onItemClick: (id: number) => void }) => {
  console.log('ExpensiveList rendered');
  return <button onClick={() => onItemClick(1)}>Item 1</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // Stable reference — ExpensiveList only re-renders if deps change
  const handleClick = useCallback((id: number) => {
    console.log('clicked', id);
  }, []); // empty deps = never changes

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Re-render parent</button>
      <ExpensiveList onItemClick={handleClick} />
    </>
  );
}`,
    },
  ],
  useMemo: [
    {
      type: 'code',
      language: 'tsx',
      filename: 'useMemo.tsx',
      value: `import { useState, useMemo } from 'react';

function ProductList({ products, filter }: { products: Product[]; filter: string }) {
  // Without useMemo: filters entire list on every render
  // With useMemo: only re-computes when products or filter changes
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filter)),
    [products, filter]
  );

  return (
    <ul>
      {filtered.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}`,
    },
  ],
  'Custom Hooks': [
    {
      type: 'code',
      language: 'tsx',
      filename: 'useLocalStorage.tsx',
      value: `import { useState, useEffect } from 'react';

// Custom hook: encapsulates localStorage sync logic
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage — looks just like useState but persists across refreshes
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}`,
    },
  ],
};

export const RICH_COMPARISON_TABLE: ContentBlock[] = [
  {
    type: 'comparison-table',
    title: 'useState vs useReducer',
    leftLabel: 'useState',
    rightLabel: 'useReducer',
    rows: [
      {
        aspect: 'Best for',
        left: 'Simple, independent values',
        right: 'Complex state with multiple sub-values',
      },
      {
        aspect: 'Update style',
        left: 'setValue(newValue)',
        right: 'dispatch({ type, payload })',
      },
      {
        aspect: 'Logic location',
        left: 'Inline in event handlers',
        right: 'Centralized in reducer function',
      },
      {
        aspect: 'Testability',
        left: 'Harder — tied to component',
        right: 'Easy — pure function, no DOM needed',
      },
      {
        aspect: 'Boilerplate',
        left: 'Minimal',
        right: 'More setup (reducer + action types)',
      },
    ],
  },
];

export const RICH_FLASHCARDS: ContentBlock[] = [
  {
    type: 'flashcard-deck',
    topic: 'useState',
    cards: [
      {
        id: 'fc1',
        question: 'What does useState return?',
        answer:
          'A tuple: [currentValue, setterFunction]. The setter triggers a re-render with the new value.',
      },
      {
        id: 'fc2',
        question: 'When does calling setState trigger a re-render?',
        answer:
          'Only when the new value differs from the current value (by Object.is equality). Setting the same primitive value skips re-render.',
      },
      {
        id: 'fc3',
        question: "What's the functional update form and when do you need it?",
        answer:
          'setValue(prev => prev + 1). Use it when the new value depends on the previous one — especially inside async callbacks or closures where the captured state may be stale.',
      },
      {
        id: 'fc4',
        question: 'Is the initial value argument used on every render?',
        answer:
          'No — only on the first render. On subsequent renders the argument is ignored. For expensive computations, pass a function: useState(() => computeExpensiveValue()).',
      },
    ],
  },
];
