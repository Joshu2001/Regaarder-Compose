import React, { useState } from 'react';
import { 
  Menu, Search, Plus, Sparkles, Bell, 
  ChevronLeft, Cloud, Users, Home, Inbox, Star, 
  FileText, Trash, Settings, MoreHorizontal,
  Mic, ArrowUp, MessageSquare, CheckSquare, Calendar, 
  File, User, PenTool, AlignLeft, AlignCenter, AlignRight, 
  List, Bold, Italic, Underline, Type, X, ChevronDown,
  LayoutGrid, BookOpen, Scissors, Expand, Check,
  AlertTriangle, MonitorPlay, MessageCircle, FileQuestion, Hash
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('AI Assistant');

  // Helper component for the Workspace icons in the sidebar
  const WorkspaceIcon = ({ letter, colorClass }) => (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${colorClass}`}>
      {letter}
    </div>
  );

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden">
      
      {/* 1. Left Navigation Sidebar */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0">
        {/* Logo Area */}
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            {/* Custom Logo SVG - Elegant, minimalist "C" and "R" intersection */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-600">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 12 10c3.1 0 5.89-1.41 1.77-5.5L12 13.5L8.5 17H6.5L12 11.5L17.5 17H15.5L12 13.5L15.5 10H19.5C21.1 12 22 14.4 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
            </svg>
            <span className="tracking-tight">Regaarder Compose</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </div>

        <div className="px-4 py-3">
          <button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 flex items-center justify-center gap-2 font-medium text-sm transition-colors">
            <Plus size={16} />
            New Composition
          </button>
        </div>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search compositions..." 
              className="w-full bg-white border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:border-violet-300"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 border border-gray-200 rounded px-1">⌘ K</span>
          </div>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <Home size={16} /> Home
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm bg-violet-50 text-violet-700 rounded-md font-medium">
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-violet-600" /> Library
            </div>
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <div className="flex items-center gap-3">
              <Inbox size={16} /> Inbox
            </div>
            <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full font-medium">12</span>
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <Star size={16} /> Starred
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <Users size={16} /> Shared
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md mb-4">
            <Trash size={16} /> Trash
          </button>

          {/* Workspaces Section */}
          <div className="flex items-center justify-between px-2 py-2 mt-4">
            <span className="text-xs font-semibold text-gray-500">Workspaces</span>
            <Plus size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              <WorkspaceIcon letter="R" colorClass="bg-indigo-500" /> Regaarder
            </button>
            
            {/* Expanded Product Workspace */}
            <div>
              <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium">
                <div className="flex items-center gap-3">
                  <WorkspaceIcon letter="P" colorClass="bg-orange-500" /> Product
                </div>
                <MoreHorizontal size={14} className="text-gray-400" />
              </button>
              
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-200">
                <button className="w-full flex items-center justify-between pl-3 pr-2 py-1 text-sm bg-violet-50 text-violet-700 rounded-r-md">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-violet-500" />
                    Product Launch Plan
                  </div>
                  <MoreHorizontal size={14} className="text-violet-400" />
                </button>
                <button className="w-full flex items-center gap-2 pl-3 pr-2 py-1 text-sm text-gray-600 hover:text-gray-900">
                  PRD - Compose v1.0
                </button>
                <button className="w-full flex items-center gap-2 pl-3 pr-2 py-1 text-sm text-gray-600 hover:text-gray-900">
                  Roadmap
                </button>
                <button className="w-full flex items-center gap-2 pl-3 pr-2 py-1 text-sm text-gray-600 hover:text-gray-900">
                  Meeting Notes 05/12
                </button>
              </div>
            </div>

            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              <WorkspaceIcon letter="M" colorClass="bg-emerald-500" /> Marketing
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              <WorkspaceIcon letter="F" colorClass="bg-blue-500" /> Finance
            </button>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              <WorkspaceIcon letter="P" colorClass="bg-fuchsia-500" /> Personal
            </button>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 w-full">
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* 2. Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Top Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <FileText size={16} className="text-gray-400" />
              Product Launch Plan
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-4">
              <Cloud size={14} /> Saved 2m ago
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors">
              <Users size={16} /> Share
            </button>
            
            {/* Avatars */}
            <div className="flex -space-x-2">
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="User" />
            </div>

            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-violet-100 text-violet-600">
              <Sparkles size={14} />
            </button>
          </div>
        </div>

        {/* Formatting Ribbon */}
        <div className="h-12 border-b border-gray-100 flex items-center px-6 gap-6 text-sm text-gray-600 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            Heading 1 <ChevronDown size={14} className="text-gray-400" />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            Inter <ChevronDown size={14} className="text-gray-400" />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
            32 <ChevronDown size={14} className="text-gray-400" />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <button className="font-bold hover:text-gray-900">B</button>
            <button className="italic font-serif hover:text-gray-900">I</button>
            <button className="underline hover:text-gray-900">U</button>
            <button className="line-through hover:text-gray-900">S</button>
            <div className="flex items-center gap-0.5 hover:text-gray-900 cursor-pointer">
              <Type size={14} /> <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <AlignLeft size={16} className="text-violet-600" />
            <AlignCenter size={16} className="hover:text-gray-900 cursor-pointer" />
            <AlignRight size={16} className="hover:text-gray-900 cursor-pointer" />
            <List size={16} className="hover:text-gray-900 cursor-pointer" />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <span className="font-serif italic font-bold hover:text-gray-900 cursor-pointer">∑</span>
          </div>
        </div>

        {/* Document Editor Content */}
        <div className="flex-1 overflow-y-auto relative bg-[#F7F7F9] p-6 md:p-8">
          <div className="max-w-[850px] mx-auto bg-white rounded-[24px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 px-12 md:px-16 pt-16 pb-32 min-h-[calc(100vh-13rem)] relative">
            
            {/* Title & Subtitle */}
            <h1 className="text-[40px] font-bold text-gray-900 leading-tight mb-4 tracking-tight">
              Product Launch Plan
            </h1>
            <p className="text-[18px] text-gray-500 mb-12 leading-relaxed max-w-2xl">
              A strategic plan to successfully launch Regaarder Compose and drive adoption, engagement, and growth.
            </p>

            <div className="w-full h-px bg-gray-100 mb-10"></div>

            {/* 1. Objective */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span> 1. Objective
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Launch Regaarder Compose to establish it as the most intuitive AI-native productivity workspace for modern teams and individuals.
              </p>
            </div>

            {/* 2. Key Initiatives Table */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                <span className="text-2xl">🚀</span> 2. Key Initiatives
              </h2>
              
              <div className="border border-gray-100 rounded-lg overflow-hidden mt-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAFC] text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 w-[40%] font-medium">Initiative</th>
                      <th className="py-3 px-4 font-medium">Owner</th>
                      <th className="py-3 px-4 font-medium">Timeline</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    <tr>
                      <td className="py-3 px-4">Beta Launch</td>
                      <td className="py-3 px-4">Alex R.</td>
                      <td className="py-3 px-4">May 15 - May 30</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">In Progress</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Creator Outreach</td>
                      <td className="py-3 px-4">Maya K.</td>
                      <td className="py-3 px-4">May 20 - Jun 10</td>
                      <td className="py-3 px-4">
                        <span className="bg-violet-50 text-violet-600 text-xs px-2.5 py-1 rounded-full font-medium">Planned</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Product Hunt Launch</td>
                      <td className="py-3 px-4">Jordan T.</td>
                      <td className="py-3 px-4">Jun 15</td>
                      <td className="py-3 px-4">
                        <span className="bg-violet-50 text-violet-600 text-xs px-2.5 py-1 rounded-full font-medium">Planned</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Paid Campaigns</td>
                      <td className="py-3 px-4">Sam K.</td>
                      <td className="py-3 px-4">Jun 20 - Jul 10</td>
                      <td className="py-3 px-4">
                        <span className="bg-violet-50 text-violet-600 text-xs px-2.5 py-1 rounded-full font-medium">Planned</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Target Audience */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                <span className="text-2xl">👥</span> 3. Target Audience
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Knowledge workers, founders, creators, marketers, and teams who want a smarter, calmer, and more connected workspace.
              </p>
            </div>

            {/* Floating AI Prompt Bar (Moved inside the document card) */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-full flex items-center px-2 py-1.5 z-10">
              <div className="flex items-center gap-3 px-3 flex-1">
                <Sparkles size={18} className="text-violet-500 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Ask Compose AI anything or type '/' for commands..." 
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 py-2"
                />
              </div>
              <div className="flex items-center gap-2 pr-1 shrink-0">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <Mic size={18} />
                </button>
                <button className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition-colors flex items-center justify-center h-8 w-8">
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-gray-100 flex items-center justify-between px-6 text-xs text-gray-500 bg-white shrink-0">
          <div className="flex items-center gap-6">
            <span>1,234 words</span>
            <div className="flex items-center gap-1 cursor-pointer">
              English (US) <ChevronDown size={12} />
            </div>
            <span>Focus</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <FileText size={14} className="cursor-pointer hover:text-gray-600" />
              <Type size={14} className="cursor-pointer hover:text-gray-600" />
              <LayoutGrid size={14} className="cursor-pointer hover:text-gray-600" />
              <AlertTriangle size={14} className="cursor-pointer hover:text-gray-600" />
            </div>
            <span>100%</span>
            <ChevronDown size={12} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* 3. Right Sidebar (AI Assistant / Smart Tools) */}
      <div className="w-[320px] border-l border-gray-100 flex flex-col bg-white shrink-0">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 text-sm font-medium mt-2">
          <button 
            className={`flex-1 text-center py-4 ${activeTab === 'AI Assistant' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('AI Assistant')}
          >
            AI Assistant
          </button>
          <button 
            className={`flex-1 text-center py-4 ${activeTab === 'Smart Tools' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('Smart Tools')}
          >
            Smart Tools
          </button>
          <div className="w-12 flex items-center justify-center">
            <X size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Good morning, Alex <span className="text-xl">👋</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">How can I help you today?</p>
          </div>

          {/* Action Buttons Grid */}
          <div className="space-y-2 mb-10">
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors shadow-sm shadow-gray-50/50">
              <PenTool size={16} className="text-violet-500" /> Improve writing
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors shadow-sm shadow-gray-50/50">
              <FileText size={16} className="text-gray-400" /> Summarize
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors shadow-sm shadow-gray-50/50">
              <Scissors size={16} className="text-violet-400" /> Make shorter
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors shadow-sm shadow-gray-50/50">
              <Expand size={16} className="text-violet-400" /> Expand
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors shadow-sm shadow-gray-50/50">
              <Check size={16} className="text-violet-500" /> Fix spelling & grammar
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors shadow-sm shadow-gray-50/50">
              <TerminalIcon size={16} className="text-gray-400" /> Custom prompt
            </button>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-3">Suggestions</h4>
            <div className="space-y-3">
              <div className="bg-[#FAFAFC] rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="text-sm font-medium text-gray-800">Create a launch timeline</div>
                <div className="text-xs text-gray-500 mt-1">Based on this plan</div>
              </div>
              <div className="bg-[#FAFAFC] rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="text-sm font-medium text-gray-800">Extract tasks</div>
                <div className="text-xs text-gray-500 mt-1">Create actionable tasks</div>
              </div>
              <div className="bg-[#FAFAFC] rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="text-sm font-medium text-gray-800">Generate a risk analysis</div>
                <div className="text-xs text-gray-500 mt-1">Identify potential risks</div>
              </div>
              <div className="bg-[#FAFAFC] rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="text-sm font-medium text-gray-800">Turn into presentation</div>
                <div className="text-xs text-gray-500 mt-1">Create slides outline</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Far Right Mini Sidebar (Icons only) */}
      <div className="w-16 border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0">
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <MessageCircle size={20} />
          <span className="text-[10px]">Chat</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <FileText size={20} />
          <span className="text-[10px]">Notes</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <CheckSquare size={20} />
          <span className="text-[10px]">Tasks</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <Calendar size={20} />
          <span className="text-[10px]">Calendar</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <File size={20} />
          <span className="text-[10px]">Files</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <Users size={20} />
          <span className="text-[10px]">People</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-4">
          <MoreHorizontal size={20} />
          <span className="text-[10px]">More</span>
        </div>
      </div>

    </div>
  );
}

// Quick custom icon for the terminal window prompt
function TerminalIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}