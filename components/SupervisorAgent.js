import React, { useState } from 'react';
import MorningAgent from './MorningAgent';

const SupervisorAgent = () => {
  const [activeAgent, setActiveAgent] = useState(null);

  const agents = [
    { id: 'morning', name: 'Morning Routine', component: <MorningAgent /> },
    // Additional agents can be added here
  ];

  const selectedAgent = agents.find(a => a.id === activeAgent);

  return (
    <div className="min-h-screen p-4 text-gray-100 bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Supervisor Agent</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 bg-gray-800 p-4 rounded">
          <h2 className="text-xl mb-2">Agents</h2>
          <ul>
            {agents.map(agent => (
              <li key={agent.id}>
                <button
                  className="w-full text-left p-2 hover:bg-gray-700 rounded"
                  onClick={() => setActiveAgent(agent.id)}
                >
                  {agent.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 bg-gray-800 p-4 rounded min-h-[300px]">
          {selectedAgent ? (
            selectedAgent.component
          ) : (
            <p className="text-gray-400">Select an agent to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorAgent;
