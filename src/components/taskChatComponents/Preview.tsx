import React, { useEffect, useRef, useState } from 'react';
import {
  GitBranch,
  Folder,
  File,
  Code,
  FileText,
  Layout,
  Database,
  User,
  Users,
  GitPullRequest,
  Tag,
} from 'lucide-react';

const OrbitalRepoGraph = () => {
  const cyRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.23.0/cytoscape.min.js';
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      const cy = window.cytoscape({
        container: containerRef.current,
        elements: [
          // Root Repository
          {
            data: {
              id: 'repo',
              label: 'orbital',
              type: 'repo',
              description: 'SDLC Platform',
              stack: 'React + TypeScript + Vite',
              stars: 5,
              forks: 1,
            },
          },

          // === CONTRIBUTORS ===
          {
            data: {
              id: 'contributor-team',
              label: 'Contributors',
              type: 'team',
              count: 4,
              totalCommits: 110,
            },
          },
          {
            data: {
              id: 'contrib-pranav',
              label: 'pranav-94',
              type: 'contributor',
              commits: 65,
              avatar: 'https://avatars.githubusercontent.com/u/118586743?v=4',
              contribution: '59%',
            },
          },
          {
            data: {
              id: 'contrib-mohit',
              label: 'SuperMohit',
              type: 'contributor',
              commits: 29,
              avatar: 'https://avatars.githubusercontent.com/u/7871501?v=4',
              contribution: '26%',
            },
          },
          {
            data: {
              id: 'contrib-qmohit',
              label: 'qmohit-code',
              type: 'contributor',
              commits: 15,
              avatar: 'https://avatars.githubusercontent.com/u/189113078?v=4',
              contribution: '14%',
            },
          },
          {
            data: {
              id: 'contrib-arun',
              label: 'ArunRawat404',
              type: 'contributor',
              commits: 1,
              avatar: 'https://avatars.githubusercontent.com/u/88387461?v=4',
              contribution: '1%',
            },
          },

          // Core Config
          { data: { id: 'vite-config', label: 'vite.config.ts', type: 'config', purpose: 'Build config' } },
          { data: { id: 'tsconfig', label: 'tsconfig.json', type: 'config', purpose: 'TypeScript config' } },

          // Main Directories
          { data: { id: 'src', label: '/src', type: 'directory', role: 'source-root' } },

          // Entry Points
          { data: { id: 'main', label: 'main.tsx', type: 'entry', flow: 'Application entry point' } },
          { data: { id: 'app', label: 'App.tsx', type: 'entry', flow: 'Root component + Router' } },

          // Core Directories
          { data: { id: 'pages-dir', label: '/pages', type: 'directory', role: 'routes' } },
          { data: { id: 'components-dir', label: '/components', type: 'directory', role: 'ui-logic' } },
          { data: { id: 'api-dir', label: '/api-client', type: 'directory', role: 'backend-communication' } },

          // === PUBLIC ROUTES ===
          { data: { id: 'route-landing', label: 'Index.tsx', type: 'route', path: '/', auth: 'public', flow: 'Landing page' } },
          { data: { id: 'route-signin', label: 'SignIn.tsx', type: 'route', path: '/sign-in', auth: 'public', flow: 'Authentication' } },
          { data: { id: 'route-signup', label: 'SignUp.tsx', type: 'route', path: '/sign-up', auth: 'public', flow: 'Registration' } },
          { data: { id: 'route-waitlist', label: 'Waitlist.tsx', type: 'route', path: '/waitlist', auth: 'public', flow: 'Join waitlist' } },

          // === PROTECTED ROUTES ===
          { data: { id: 'route-board', label: 'ProjectBoard.tsx', type: 'route', path: '/project-board', auth: 'protected', flow: 'Main dashboard' } },
          { data: { id: 'route-software', label: 'SoftwareEngineering.tsx', type: 'route', path: '/software-engineering', auth: 'protected', flow: 'Code editor' } },
          { data: { id: 'route-tasks', label: 'UserTasks.tsx', type: 'route', path: '/user-tasks', auth: 'protected', flow: 'Task management' } },
          { data: { id: 'route-inbox', label: 'Inbox.tsx', type: 'route', path: '/inbox', auth: 'protected', flow: 'Notifications' } },
          { data: { id: 'route-templates', label: 'Template.tsx', type: 'route', path: '/templates', auth: 'protected', flow: 'Project templates' } },
          { data: { id: 'route-profile', label: 'ProfilePage.tsx', type: 'route', path: '/profile', auth: 'protected', flow: 'User settings' } },

          // === COMPONENT GROUPS ===
          { data: { id: 'comp-landing-dir', label: '/landingPageComponents', type: 'comp-group', purpose: 'Marketing components' } },
          { data: { id: 'comp-board-dir', label: '/projectBoardComponents', type: 'comp-group', purpose: 'Kanban & tasks' } },
          { data: { id: 'comp-software-dir', label: '/softwareEngineeringComponents', type: 'comp-group', purpose: 'Code editor tools' } },
          { data: { id: 'comp-taskchat-dir', label: '/taskChatComponents', type: 'comp-group', purpose: 'Task collaboration' } },
          { data: { id: 'comp-global-dir', label: '/globalComponents', type: 'comp-group', purpose: 'Shared UI' } },

          // === LANDING COMPONENTS ===
          { data: { id: 'landing-hero', label: 'HeroSection', type: 'component', category: 'landing' } },
          { data: { id: 'landing-features', label: 'Features', type: 'component', category: 'landing' } },
          { data: { id: 'landing-cta', label: 'CTASection', type: 'component', category: 'landing' } },

          // === PROJECT BOARD COMPONENTS ===
          { data: { id: 'board-kanban', label: 'KanbanBoard', type: 'component', category: 'board', feature: 'Task visualization' } },
          { data: { id: 'board-taskcard', label: 'TaskCard', type: 'component', category: 'board', feature: 'Task item' } },
          { data: { id: 'board-create', label: 'CreateTask', type: 'component', category: 'board', feature: 'Task creation' } },

          // === SOFTWARE ENGINEERING COMPONENTS ===
          { data: { id: 'software-monaco', label: 'MonacoCanvas', type: 'component', category: 'code', feature: 'Code editor' } },
          { data: { id: 'software-mermaid', label: 'MermaidComponent', type: 'component', category: 'diagram', feature: 'Diagram renderer' } },
          { data: { id: 'software-codegen', label: 'CodeGeneration', type: 'component', category: 'ai', feature: 'AI code gen' } },

          // === TASK CHAT COMPONENTS ===
          { data: { id: 'chat-main', label: 'TaskChat', type: 'component', category: 'chat', feature: 'Task discussion', route: '/tasks/:taskId' } },

          // === GLOBAL COMPONENTS ===
          { data: { id: 'global-sidebar', label: 'Sidebar', type: 'component', category: 'navigation', feature: 'App navigation' } },

          // === API LAYER ===
          { data: { id: 'api-client', label: 'api.ts', type: 'api', purpose: 'OpenAPI client', endpoints: 'All backend calls' } },

          // === NEW: WORK ITEMS GROUPS (Issues / PRs) ===
          { data: { id: 'issues-group', label: 'Issues', type: 'issue-group' } },
          { data: { id: 'prs-group', label: 'Pull Requests', type: 'pr-group' } },

          // === EDGES: Contributors ===
          { data: { source: 'repo', target: 'contributor-team', label: 'TEAM' } },
          { data: { source: 'contributor-team', target: 'contrib-mohit', label: 'DEV' } },
          { data: { source: 'contributor-team', target: 'contrib-pranav', label: 'DEV' } },
          { data: { source: 'contributor-team', target: 'contrib-qmohit', label: 'DEV' } },
          { data: { source: 'contributor-team', target: 'contrib-arun', label: 'DEV' } },

          // Contributor code connections (major contributions)
          { data: { source: 'contrib-pranav', target: 'route-board', label: 'BUILT' } },
          { data: { source: 'contrib-pranav', target: 'software-monaco', label: 'BUILT' } },
          { data: { source: 'contrib-pranav', target: 'chat-main', label: 'BUILT' } },
          { data: { source: 'contrib-mohit', target: 'route-software', label: 'DESIGNED' } },
          { data: { source: 'contrib-mohit', target: 'software-codegen', label: 'DESIGNED' } },
          { data: { source: 'contrib-qmohit', target: 'comp-board-dir', label: 'CONTRIBUTED' } },

          // === EDGES: Config ===
          { data: { source: 'repo', target: 'vite-config', label: 'BUILD' } },
          { data: { source: 'repo', target: 'tsconfig', label: 'TYPES' } },

          // === EDGES: Structure ===
          { data: { source: 'repo', target: 'src', label: 'CONTAINS' } },
          { data: { source: 'src', target: 'main', label: 'ENTRY' } },
          { data: { source: 'src', target: 'app', label: 'ROOT' } },
          { data: { source: 'main', target: 'app', label: 'RENDERS' } },

          // === EDGES: Directories ===
          { data: { source: 'src', target: 'pages-dir', label: 'CONTAINS' } },
          { data: { source: 'src', target: 'components-dir', label: 'CONTAINS' } },
          { data: { source: 'src', target: 'api-dir', label: 'CONTAINS' } },

          // === EDGES: Component Groups ===
          { data: { source: 'components-dir', target: 'comp-landing-dir', label: 'GROUP' } },
          { data: { source: 'components-dir', target: 'comp-board-dir', label: 'GROUP' } },
          { data: { source: 'components-dir', target: 'comp-software-dir', label: 'GROUP' } },
          { data: { source: 'components-dir', target: 'comp-taskchat-dir', label: 'GROUP' } },
          { data: { source: 'components-dir', target: 'comp-global-dir', label: 'GROUP' } },

          // === EDGES: Public Routes ===
          { data: { source: 'app', target: 'route-landing', label: 'ROUTE' } },
          { data: { source: 'app', target: 'route-signin', label: 'ROUTE' } },
          { data: { source: 'app', target: 'route-signup', label: 'ROUTE' } },
          { data: { source: 'app', target: 'route-waitlist', label: 'ROUTE' } },

          // === EDGES: Protected Routes ===
          { data: { source: 'app', target: 'route-board', label: 'PROTECTED' } },
          { data: { source: 'app', target: 'route-software', label: 'PROTECTED' } },
          { data: { source: 'app', target: 'route-tasks', label: 'PROTECTED' } },
          { data: { source: 'app', target: 'route-inbox', label: 'PROTECTED' } },
          { data: { source: 'app', target: 'route-templates', label: 'PROTECTED' } },
          { data: { source: 'app', target: 'route-profile', label: 'PROTECTED' } },
          { data: { source: 'app', target: 'chat-main', label: 'DYNAMIC' } },

          // === EDGES: Route Location ===
          { data: { source: 'pages-dir', target: 'route-landing', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-signin', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-signup', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-waitlist', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-board', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-software', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-tasks', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-inbox', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-templates', label: 'CONTAINS' } },
          { data: { source: 'pages-dir', target: 'route-profile', label: 'CONTAINS' } },

          // === EDGES: Landing Components ===
          { data: { source: 'comp-landing-dir', target: 'landing-hero', label: 'CONTAINS' } },
          { data: { source: 'comp-landing-dir', target: 'landing-features', label: 'CONTAINS' } },
          { data: { source: 'comp-landing-dir', target: 'landing-cta', label: 'CONTAINS' } },
          { data: { source: 'route-landing', target: 'landing-hero', label: 'USES' } },
          { data: { source: 'route-landing', target: 'landing-features', label: 'USES' } },
          { data: { source: 'route-landing', target: 'landing-cta', label: 'USES' } },

          // === EDGES: Board Components ===
          { data: { source: 'comp-board-dir', target: 'board-kanban', label: 'CONTAINS' } },
          { data: { source: 'comp-board-dir', target: 'board-taskcard', label: 'CONTAINS' } },
          { data: { source: 'comp-board-dir', target: 'board-create', label: 'CONTAINS' } },
          { data: { source: 'route-board', target: 'board-kanban', label: 'USES' } },
          { data: { source: 'route-board', target: 'board-create', label: 'USES' } },
          { data: { source: 'board-kanban', target: 'board-taskcard', label: 'RENDERS' } },

          // === EDGES: Software Components ===
          { data: { source: 'comp-software-dir', target: 'software-monaco', label: 'CONTAINS' } },
          { data: { source: 'comp-software-dir', target: 'software-mermaid', label: 'CONTAINS' } },
          { data: { source: 'comp-software-dir', target: 'software-codegen', label: 'CONTAINS' } },
          { data: { source: 'route-software', target: 'software-monaco', label: 'USES' } },
          { data: { source: 'route-software', target: 'software-mermaid', label: 'USES' } },
          { data: { source: 'route-software', target: 'software-codegen', label: 'USES' } },
          { data: { source: 'software-codegen', target: 'software-monaco', label: 'OUTPUTS_TO' } },

          // === EDGES: TaskChat Components ===
          { data: { source: 'comp-taskchat-dir', target: 'chat-main', label: 'CONTAINS' } },

          // === EDGES: Global Components ===
          { data: { source: 'comp-global-dir', target: 'global-sidebar', label: 'CONTAINS' } },
          { data: { source: 'route-board', target: 'global-sidebar', label: 'USES' } },
          { data: { source: 'route-software', target: 'global-sidebar', label: 'USES' } },
          { data: { source: 'route-tasks', target: 'global-sidebar', label: 'USES' } },

          // === EDGES: API ===
          { data: { source: 'api-dir', target: 'api-client', label: 'CONTAINS' } },
          { data: { source: 'route-board', target: 'api-client', label: 'CALLS' } },
          { data: { source: 'route-software', target: 'api-client', label: 'CALLS' } },
          { data: { source: 'route-tasks', target: 'api-client', label: 'CALLS' } },
          { data: { source: 'chat-main', target: 'api-client', label: 'CALLS' } },
          { data: { source: 'board-create', target: 'api-client', label: 'CALLS' } },
          { data: { source: 'software-codegen', target: 'api-client', label: 'CALLS' } },

          // === NEW: EDGES from repo to groups ===
          { data: { source: 'repo', target: 'issues-group', label: 'ISSUES' } },
          { data: { source: 'repo', target: 'prs-group', label: 'PRS' } },
        ],
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              color: '#0F172A',
              'text-outline-color': 'rgba(255,255,255,0.8)',
              'text-outline-width': 1,
              'font-size': '11px',
              'text-valign': 'center',
              'text-halign': 'center',
              width: '56px',
              height: '56px',
              'font-weight': '600',
              'background-color': 'rgba(255,255,255,0.75)',
              'border-width': 2,
              'border-color': '#0284C7',
              'shadow-blur': 12,
              'shadow-color': 'rgba(2, 132, 199, 0.25)',
            },
          },
          {
            selector: 'node[type="repo"]',
            style: {
              'background-color': 'rgba(255,255,255,0.85)',
              'border-color': '#0EA5E9',
              'border-width': 4,
              'shadow-blur': 22,
              'shadow-color': 'rgba(14, 165, 233, 0.35)',
              width: '120px',
              height: '120px',
              'font-size': '20px',
            },
          },
          {
            selector: 'node[type="team"]',
            style: {
              'border-color': '#F59E0B',
              'shadow-color': 'rgba(245, 158, 11, 0.25)',
              width: '86px',
              height: '86px',
              'font-size': '14px',
            },
          },
          {
            selector: 'node[type="contributor"]',
            style: {
              'border-color': '#EC4899',
              'shadow-color': 'rgba(236, 72, 153, 0.25)',
              width: '64px',
              height: '64px',
              'font-size': '10px',
              'border-width': 2.5,
            },
          },
          {
            selector: 'node[type="config"]',
            style: {
              'border-color': '#10B981',
              'shadow-color': 'rgba(16, 185, 129, 0.25)',
              width: '60px',
              height: '60px',
              'font-size': '10px',
            },
          },
          {
            selector: 'node[type="directory"]',
            style: {
              'border-color': '#3B82F6',
              'shadow-color': 'rgba(59, 130, 246, 0.25)',
              width: '74px',
              height: '74px',
              'font-size': '12px',
            },
          },
          {
            selector: 'node[type="entry"]',
            style: {
              'border-color': '#A855F7',
              'shadow-color': 'rgba(168, 85, 247, 0.25)',
              width: '70px',
              height: '70px',
              'font-size': '11px',
            },
          },
          {
            selector: 'node[type="route"]',
            style: {
              'border-color': '#06B6D4',
              'shadow-color': 'rgba(6, 182, 212, 0.25)',
              width: '64px',
              height: '64px',
              'font-size': '10px',
            },
          },
          {
            selector: 'node[type="comp-group"]',
            style: {
              'border-color': '#EC4899',
              'shadow-color': 'rgba(236, 72, 153, 0.25)',
              width: '70px',
              height: '70px',
              'font-size': '10px',
            },
          },
          {
            selector: 'node[type="component"]',
            style: {
              'border-color': '#22C55E',
              'shadow-color': 'rgba(34, 197, 94, 0.25)',
              width: '60px',
              height: '60px',
              'font-size': '10px',
            },
          },
          {
            selector: 'node[type="api"]',
            style: {
              'border-color': '#EF4444',
              'shadow-color': 'rgba(239, 68, 68, 0.25)',
              width: '60px',
              height: '60px',
              'font-size': '10px',
            },
          },
          // Work items groups and nodes (light)
          {
            selector: 'node[type="issue-group"]',
            style: {
              'border-color': '#F59E0B',
              'shadow-color': 'rgba(245, 158, 11, 0.25)',
              width: '80px',
              height: '80px',
              'font-size': '12px',
              'border-width': 3,
            },
          },
          {
            selector: 'node[type="pr-group"]',
            style: {
              'border-color': '#10B981',
              'shadow-color': 'rgba(16, 185, 129, 0.25)',
              width: '80px',
              height: '80px',
              'font-size': '12px',
              'border-width': 3,
            },
          },
          {
            selector: 'node[type="issue"]',
            style: {
              'border-color': '#F59E0B',
              'shadow-color': 'rgba(245, 158, 11, 0.2)',
              width: '60px',
              height: '60px',
              'font-size': '14px',
            },
          },
          {
            selector: 'node[type="pr"]',
            style: {
              'border-color': '#10B981',
              'shadow-color': 'rgba(16, 185, 129, 0.2)',
              width: '60px',
              height: '60px',
              'font-size': '10px',
            },
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 6,
              'border-color': '#0EA5E9',
              'overlay-opacity': 0.12,
              'overlay-color': '#0EA5E9',
              'shadow-blur': 26,
              'shadow-color': 'rgba(14, 165, 233, 0.45)',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2.5,
              opacity: 0.95,
              'line-color': '#94A3B8',
              'target-arrow-color': '#94A3B8',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              label: 'data(label)',
              'font-size': '8px',
              color: '#0F172A',
              'text-rotation': 'autorotate',
              'text-margin-y': -6,
              'text-background-color': 'rgba(255,255,255,0.92)',
              'text-background-opacity': 1,
              'text-background-padding': '3px',
              'text-outline-width': 0,
            },
          },
          {
            selector: 'edge:selected',
            style: {
              'line-color': '#0EA5E9',
              'target-arrow-color': '#0EA5E9',
              width: 3.5,
            },
          },
        ],
        layout: {
          name: 'cose',
          animate: true,
          animationDuration: 2000,
          nodeRepulsion: 30000,
          idealEdgeLength: 120,
          edgeElasticity: 200,
          nestingFactor: 1.2,
          gravity: 50,
          numIter: 3000,
          initialTemp: 300,
          coolingFactor: 0.95,
          minTemp: 1.0,
        },
      });

      // Select / deselect behavior
      cy.on('tap', 'node', (evt: any) => {
        const node = evt.target;
        const nodeData = node.data();

      if (nodeData.type === 'issue') return;


        const properties: any = {};
        Object.keys(nodeData).forEach((key) => {
          if (key !== 'id' && key !== 'label' && key !== 'type') {
            properties[key] = nodeData[key];
          }
        });

        setSelectedNode({
          id: node.id(),
          label: nodeData.label,
          type: nodeData.type,
          properties,
        });
      });

      cy.on('tap', (evt: any) => {
        if (evt.target === cy) setSelectedNode(null);
      });

      cyRef.current = cy;

      // === Fetch Issues and Pull Requests (open by default) ===
      const owner = 'AximoxAI';
      const repo = 'orbital';

      const loginToContributorNode: Record<string, string> = {
        'pranav-94': 'contrib-pranav',
        SuperMohit: 'contrib-mohit',
        'qmohit-code': 'contrib-qmohit',
        ArunRawat404: 'contrib-arun',
      };

      async function loadWorkItems() {
        try {
          // Fetch issues (this endpoint returns issues + PRs; filter out PRs)
          const issuesResp = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30`,
            { headers: { Accept: 'application/vnd.github+json' } }
          );
          const issuesJson = await issuesResp.json();
          const pureIssues = Array.isArray(issuesJson) ? issuesJson.filter((it) => !it.pull_request) : [];

          // Fetch PRs
          const prsResp = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=30`,
            { headers: { Accept: 'application/vnd.github+json' } }
          );
          const prsJson = await prsResp.json();
          const purePRs = Array.isArray(prsJson) ? prsJson : [];

          // Add Issue nodes
          for (const issue of pureIssues) {
            const issueId = `issue-${issue.number}`;
            if (cy.getElementById(issueId).nonempty()) continue;

            cy.add({
              data: {
                id: issueId,
                label: `#${issue.number}`,
                type: 'issue',
                number: issue.number,
                title: issue.title,
                state: issue.state,
                author: issue.user?.login ?? 'unknown',
                comments: issue.comments,
                labels: (issue.labels || []).map((l: any) => (typeof l === 'string' ? l : l.name)).join(', '),
                createdAt: issue.created_at,
                url: issue.html_url,
              },
            });

            cy.add({ data: { source: 'issues-group', target: issueId, label: 'ISSUE' } });

            const authorLogin = issue.user?.login;
            const contribId = authorLogin ? loginToContributorNode[authorLogin] : undefined;
            if (contribId && cy.getElementById(contribId).nonempty()) {
              cy.add({ data: { source: contribId, target: issueId, label: 'OPENED' } });
            }
          }

          // Add PR nodes
          for (const pr of purePRs) {
            const prId = `pr-${pr.number}`;
            if (cy.getElementById(prId).nonempty()) continue;

            cy.add({
              data: {
                id: prId,
                label: `PR #${pr.number}`,
                type: 'pr',
                number: pr.number,
                state: pr.state,
                draft: !!pr.draft,
                author: pr.user?.login ?? 'unknown',
                createdAt: pr.created_at,
                url: pr.html_url,
                base: pr.base?.ref,
                head: pr.head?.ref,
              },
            });

            cy.add({ data: { source: 'prs-group', target: prId, label: 'PR' } });

            const authorLogin = pr.user?.login;
            const contribId = authorLogin ? loginToContributorNode[authorLogin] : undefined;
            if (contribId && cy.getElementById(contribId).nonempty()) {
              cy.add({ data: { source: contribId, target: prId, label: 'OPENED' } });
            }
          }

          // Re-run layout to place new nodes nicely
          cy.layout({
            name: 'cose',
            animate: true,
            animationDuration: 1200,
            nodeRepulsion: 30000,
            idealEdgeLength: 120,
            edgeElasticity: 200,
            nestingFactor: 1.2,
            gravity: 50,
            numIter: 1200,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0,
          }).run();
        } catch (e) {
          const errId = 'work-items-error';
          if (!cy.getElementById(errId).nonempty()) {
            cy.add({
              data: {
                id: errId,
                label: 'GitHub API error',
                type: 'issue',
                details:
                  'Failed to load issues/PRs. You may be rate-limited. Try again later or add a token-proxy.',
              },
            });
            cy.add({ data: { source: 'repo', target: errId, label: 'ERROR' } });
          }
        }
      }

      loadWorkItems();
    };

    document.body.appendChild(script);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  const nodeConfig = {
    repo: { color: '#0EA5E9', icon: GitBranch, name: 'Repository' },
    team: { color: '#F59E0B', icon: Users, name: 'Team' },
    contributor: { color: '#EC4899', icon: User, name: 'Contributor' },
    config: { color: '#10B981', icon: FileText, name: 'Configuration' },
    directory: { color: '#3B82F6', icon: Folder, name: 'Directory' },
    entry: { color: '#A855F7', icon: Code, name: 'Entry Point' },
    route: { color: '#06B6D4', icon: Layout, name: 'Route/Page' },
    'comp-group': { color: '#EC4899', icon: Folder, name: 'Component Group' },
    component: { color: '#22C55E', icon: Code, name: 'Component' },
    api: { color: '#EF4444', icon: Database, name: 'API Client' },
    'issue-group': { color: '#F59E0B', icon: Tag, name: 'Issues' },
    'pr-group': { color: '#10B981', icon: GitPullRequest, name: 'Pull Requests' },
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="border-b p-3 grid grid-cols-3 overflow-x-auto" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderBottomWidth: 1 }}>
        <div className="flex gap-4 min-w-max whitespace-nowrap">
          {Object.entries(nodeConfig).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: config.color }}>
                  <IconComponent size={16} className="text-white" />
                </div>
                <span className="text-slate-700 text-xs font-medium">{config.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{
            backgroundColor: '#F8FAFC',
            backgroundImage: `
              radial-gradient(900px 500px at -10% -10%, rgba(236, 72, 153, 0.12), transparent 60%),
              radial-gradient(700px 380px at 110% 110%, rgba(14, 165, 233, 0.12), transparent 60%),
              repeating-linear-gradient(0deg, rgba(15,23,42,0.05) 0, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(90deg, rgba(15,23,42,0.05) 0, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 20px)
            `,
          }}
        />
      </div>

      {selectedNode && cyRef.current && (
        <div className="border-t p-4 max-h-80 overflow-y-auto" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderTopWidth: 1 }}>
          <div className="flex items-center gap-3 mb-3">
            {React.createElement(nodeConfig[selectedNode.type].icon, {
              size: 28,
              style: { color: nodeConfig[selectedNode.type].color },
            })}
            <div>
              <h3 className="text-slate-900 font-bold text-xl">
                {selectedNode.type === 'issue'
                  ? `#${selectedNode.properties.number} ${selectedNode.properties.title ?? ''}`
                  : selectedNode.label}
              </h3>
              <p className="text-slate-600 text-sm">{nodeConfig[selectedNode.type].name}</p>
            </div>
          </div>

          {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
            <div className="mb-3 rounded-lg p-3" style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(148,163,184,0.25)' }}>
              <h4 className="text-slate-900 font-semibold text-sm mb-2">Details</h4>
              <div className="space-y-1">
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-slate-600 capitalize font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-slate-900 ml-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-slate-700 text-sm">
            <strong className="text-base">
              Connections ({Array.from(cyRef.current.getElementById(selectedNode.id).connectedEdges()).length})
            </strong>
            <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {Array.from(cyRef.current.getElementById(selectedNode.id).connectedEdges()).map((edge: any, i: number) => {
                const source = edge.source();
                const target = edge.target();
                const otherNode = source.id() === selectedNode.id ? target : source;
                const direction = source.id() === selectedNode.id ? '→' : '←';

                return (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer hover:opacity-90 transition-all hover:scale-105"
                    style={{
                      backgroundColor: (nodeConfig[otherNode.data('type')]?.color || '#0EA5E9') + '22',
                      color: nodeConfig[otherNode.data('type')]?.color || '#0EA5E9',
                      border: `2px solid ${nodeConfig[otherNode.data('type')]?.color || '#0EA5E9'}`,
                    }}
                    onClick={() => cyRef.current.getElementById(otherNode.id()).select()}
                  >
                    {edge.data('label')} {direction} {otherNode.data('label')}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrbitalRepoGraph;