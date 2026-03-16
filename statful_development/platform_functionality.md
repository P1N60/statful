# Platform functionality
### How the platform should always behave
The platform hosts AI agents that show their current task.
The user can view the agent's internal dialog and memory logs by pressing the "Logs" button on the agent.
The "Edit" button of each agent should take the user to a panel where they can edit the behaviour of the agent. This includes writing context into the agent.
Each agent is haneded a default instructions file that is insertet into the agent's context. Some agents have special made instructions that are also inserted. These instructions can be found in the "agent_instructions" directory.
The agent boxes are in a agent bord, which the user can move around.
### Remember
Remember to run it locally from time to time to review your work, when working on the website.
### Agent management system
The platform uses OpenClaw to manage and operate agents that can do anything the company needs.
The idea is to create a new agent using OpenClaw when an agent on the platform is created. Then the agent gets assigned the agent instructions files that fit it's role. 
Agents should use the "HEARTBEAT.md" to run a standard loop which is looking at what needs to be done, doing that task, then logging what has been done so the other agents can do their tasks. Having this being a "HEARTBEAT" makes the agent do this cycle every 30 minutes or otherwise customer defined intervals.