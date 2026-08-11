import React, { useState, useEffect, useCallback } from 'react';
import BrowserTabBar from './BrowserTabBar';
import BrowserToolbar from './BrowserToolbar';
import BrowserViewport from './BrowserViewport';
import BrowserResearchPanel from './BrowserResearchPanel';
import SendToSheetsPopover from './SendToSheetsPopover';
import SendToComposePopover from './SendToComposePopover';
import CompetitorResearchWorkflow from './CompetitorResearchWorkflow';
import BrowserFlowsPopover from './flows/BrowserFlowsPopover';
import RecordingIndicatorBar from './flows/RecordingIndicatorBar';
import FlowSynthesisModal from './flows/FlowSynthesisModal';
import FlowLibraryModal from './flows/FlowLibraryModal';
import FlowExecutionModal from './flows/FlowExecutionModal';
import { globalActivityObserver, synthesizeFlowFromActions, getSavedFlows } from '../../services/flowEngine';

const STORAGE_KEY = 'regaarder_research_tabs_v2';
const SAVED_ITEMS_KEY = 'regaarder_saved_research_v1';
const DEFAULT_RESEARCH_URL = 'regaarder://research';

export const BrowserWorkspace = ({ showToast, setProductMode }) => {
  const isElectron = Boolean(window.electronAPI?.isElectron);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Popover state anchors
  const [sendToSheetsPopoverRect, setSendToSheetsPopoverRect] = useState(null);
  const [sendToComposePopoverRect, setSendToComposePopoverRect] = useState(null);
  const [showCompetitorWorkflow, setShowCompetitorWorkflow] = useState(false);

  // Regaarder Flows system state
  const [isFlowRecording, setIsFlowRecording] = useState(false);
  const [flowsPopoverRect, setFlowsPopoverRect] = useState(null);
  const [recordedActionCount, setRecordedActionCount] = useState(0);
  const [synthesizedFlowToReview, setSynthesizedFlowToReview] = useState(null);
  const [showFlowLibraryModal, setShowFlowLibraryModal] = useState(false);
  const [activeExecutingFlow, setActiveExecutingFlow] = useState(null);

  // Restore or initialize research tabs
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[BrowserWorkspace] Failed to restore saved tabs:', e);
    }
    return [
      {
        id: 'tab-1',
        title: 'Regaarder Research',
        url: DEFAULT_RESEARCH_URL,
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        favicon: '',
        isSecure: true
      }
    ];
  });

  const [activeTabId, setActiveTabId] = useState(() => tabs[0]?.id || 'tab-1');

  // Saved Research & Bookmarks store
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'saved-1',
        title: 'SaaS Competitive Pricing Matrix 2026',
        url: 'https://docs.google.com',
        type: 'pages',
        tag: 'Pricing Matrix',
        savedAt: 'Today, 09:42 AM'
      },
      {
        id: 'saved-2',
        title: 'AI Agent Architecture Patterns & Benchmarks',
        url: 'https://github.com',
        type: 'clippings',
        tag: 'Clipping',
        savedAt: 'Yesterday, 04:15 PM'
      }
    ];
  });

  // Persist tabs
  useEffect(() => {
    try {
      const tabDataToSave = tabs.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        favicon: t.favicon,
        isSecure: t.isSecure
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabDataToSave));
    } catch (e) {
      // ignore
    }
  }, [tabs]);

  // Persist saved items
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
    } catch (e) {
      // ignore
    }
  }, [savedItems]);

  // Sync with Electron Main Process
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    tabs.forEach((tab) => {
      if (tab.url !== DEFAULT_RESEARCH_URL && tab.url !== 'regaarder://saved') {
        window.electronAPI.createTab(tab.id, tab.url);
      }
    });

    if (activeTabId) {
      const current = tabs.find((t) => t.id === activeTabId);
      if (current && current.url !== DEFAULT_RESEARCH_URL && current.url !== 'regaarder://saved') {
        window.electronAPI.selectTab(activeTabId);
      }
    }

    const unsubscribe = window.electronAPI.onTabUpdated((data) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id === data.tabId) {
            return {
              ...tab,
              url: data.url !== undefined ? data.url : tab.url,
              title: data.title !== undefined ? data.title : tab.title,
              isLoading: data.isLoading !== undefined ? data.isLoading : tab.isLoading,
              canGoBack: data.canGoBack !== undefined ? data.canGoBack : tab.canGoBack,
              canGoForward: data.canGoForward !== undefined ? data.canGoForward : tab.canGoForward,
              favicon: data.favicon !== undefined ? data.favicon : tab.favicon,
              isSecure: data.isSecure !== undefined ? data.isSecure : tab.isSecure
            };
          }
          return tab;
        })
      );
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isElectron]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isBookmarked = savedItems.some((item) => item.url === activeTab?.url);

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (isElectron && window.electronAPI && tab && tab.url !== DEFAULT_RESEARCH_URL && tab.url !== 'regaarder://saved') {
      window.electronAPI.selectTab(tabId);
    }
  };

  const handleNewTab = (initialUrl = DEFAULT_RESEARCH_URL) => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: initialUrl === DEFAULT_RESEARCH_URL ? 'Regaarder Research' : (initialUrl === 'regaarder://saved' ? 'Saved Research' : 'New Tab'),
      url: initialUrl,
      isLoading: initialUrl !== DEFAULT_RESEARCH_URL && initialUrl !== 'regaarder://saved',
      canGoBack: false,
      canGoForward: false,
      favicon: '',
      isSecure: true
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);

    if (isElectron && window.electronAPI && initialUrl !== DEFAULT_RESEARCH_URL && initialUrl !== 'regaarder://saved') {
      window.electronAPI.createTab(newId, initialUrl);
      window.electronAPI.selectTab(newId);
    }
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length <= 1) return;

    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);

    if (activeTabId === tabId) {
      const nextActiveId = nextTabs[nextTabs.length - 1].id;
      setActiveTabId(nextActiveId);
      const nextTab = nextTabs[nextTabs.length - 1];
      if (isElectron && window.electronAPI && nextTab && nextTab.url !== DEFAULT_RESEARCH_URL && nextTab.url !== 'regaarder://saved') {
        window.electronAPI.selectTab(nextActiveId);
      }
    }

    if (isElectron && window.electronAPI) {
      window.electronAPI.closeTab(tabId);
    }
  };

  const handleNavigate = (targetUrl) => {
    let formattedUrl = targetUrl;
    if (formattedUrl !== DEFAULT_RESEARCH_URL && formattedUrl !== 'regaarder://saved' && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: formattedUrl,
              title: formattedUrl === DEFAULT_RESEARCH_URL ? 'Regaarder Research' : (formattedUrl === 'regaarder://saved' ? 'Saved Research' : t.title),
              isLoading: formattedUrl !== DEFAULT_RESEARCH_URL && formattedUrl !== 'regaarder://saved',
              isSecure: formattedUrl.startsWith('https://') || formattedUrl.startsWith('regaarder://')
            }
          : t
      )
    );

    if (isElectron && window.electronAPI && formattedUrl !== DEFAULT_RESEARCH_URL && formattedUrl !== 'regaarder://saved') {
      window.electronAPI.createTab(activeTabId, formattedUrl);
      window.electronAPI.navigate(activeTabId, formattedUrl);
    }

    // Record action in Flow engine
    globalActivityObserver.record({
      type: 'navigate',
      url: formattedUrl,
      title: activeTab?.title || formattedUrl
    });
    setRecordedActionCount((prev) => prev + 1);
  };

  const handleGoBack = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.goBack(activeTabId);
    }
  };

  const handleGoForward = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.goForward(activeTabId);
    }
  };

  const handleReload = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.reload(activeTabId);
    } else {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: t.url } : t))
      );
    }
  };

  const handleStop = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.stop(activeTabId);
    }
  };

  const handleHome = () => {
    handleNavigate(DEFAULT_RESEARCH_URL);
  };

  const handleOpenExternal = () => {
    if (activeTab?.url && activeTab.url !== DEFAULT_RESEARCH_URL && activeTab.url !== 'regaarder://saved') {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Flow Recording Control Handlers
  const handleStartRecordingFlow = () => {
    globalActivityObserver.startRecording();
    setIsFlowRecording(true);
    setRecordedActionCount(0);
    if (showToast) showToast('Started Flow recording session');
  };

  const handleStopRecordingFlow = () => {
    const sessionActions = globalActivityObserver.stopRecording();
    setIsFlowRecording(false);
    const synthesized = synthesizeFlowFromActions(
      sessionActions.length > 0 ? sessionActions : globalActivityObserver.getRecentActions(),
      'Competitor Pricing Research'
    );
    setSynthesizedFlowToReview(synthesized);
  };

  const handleSaveRecentAsFlow = () => {
    const recent = globalActivityObserver.getRecentActions();
    const synthesized = synthesizeFlowFromActions(recent, 'Flow from Recent Activity');
    setSynthesizedFlowToReview(synthesized);
  };

  // Direct Toggle Bookmark Action (Zero dialogs prompt, toast with Undo)
  const handleToggleBookmark = () => {
    if (!activeTab?.url) return;

    if (isBookmarked) {
      const removedItem = savedItems.find((i) => i.url === activeTab.url);
      const prevItems = [...savedItems];
      setSavedItems((prev) => prev.filter((i) => i.url !== activeTab.url));

      const undoAction = () => {
        setSavedItems(prevItems);
        if (showToast) showToast(`Restored ${activeTab.title || 'page'} to Saved Research`);
      };

      if (showToast) {
        showToast('Removed from Saved Research', undoAction);
      }
    } else {
      const newItem = {
        id: `saved-${Date.now()}`,
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
        type: 'pages',
        tag: 'Saved Page',
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const prevItems = [...savedItems];
      setSavedItems((prev) => [newItem, ...prev]);

      const undoAction = () => {
        setSavedItems(prevItems);
        if (showToast) showToast(`Removed ${activeTab.title || 'page'} from Saved Research`);
      };

      if (showToast) {
        showToast('Saved to Research', undoAction);
      }
    }
  };

  const handleRemoveBookmark = (itemId) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
    if (showToast) showToast('Removed from Saved Research');
  };

  const handleExtractText = async () => {
    if (isElectron && window.electronAPI) {
      const result = await window.electronAPI.extractPageText(activeTabId);
      if (result.success) {
        return result.text;
      }
    }
    return `Sample research context from ${activeTab?.title || activeTab?.url || 'webpage'}. Regaarder AI automatically ingests live webpage documents, tables, and notes.`;
  };

  // Contextual Action: Send to Sheets Execution & Undo System
  const handleExecuteSendToSheets = (payload) => {
    const { destinationSheet, tableData } = payload;
    const count = tableData.rows ? tableData.rows.length : 24;
    const msg = `${count} rows added to ${destinationSheet}`;

    globalActivityObserver.record({
      type: 'send_to_sheets',
      target: 'Sheets',
      destination: destinationSheet
    });
    setRecordedActionCount((prev) => prev + 1);

    const undoAction = () => {
      if (showToast) showToast(`Reverted data export to ${destinationSheet}`);
    };

    if (showToast) {
      showToast(msg, undoAction);
    }
  };

  // Contextual Action: Send to Compose Execution & Undo System
  const handleExecuteSendToCompose = (payload) => {
    const { destinationDoc } = payload;
    const msg = `Added to ${destinationDoc}`;

    globalActivityObserver.record({
      type: 'send_to_compose',
      target: 'Compose',
      destination: destinationDoc
    });
    setRecordedActionCount((prev) => prev + 1);

    const undoAction = () => {
      if (showToast) showToast(`Reverted content export to ${destinationDoc}`);
    };

    if (showToast) {
      showToast(msg, undoAction);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 overflow-hidden font-sans select-none relative">
      {/* Active Flow Recording Sticky Indicator Bar */}
      {isFlowRecording && (
        <RecordingIndicatorBar
          actionCount={recordedActionCount}
          onStop={handleStopRecordingFlow}
        />
      )}

      {/* Regaarder Research Tab Bar */}
      <BrowserTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab(DEFAULT_RESEARCH_URL)}
      />

      {/* Regaarder Research Toolbar */}
      <BrowserToolbar
        currentUrl={activeTab?.url || ''}
        isLoading={activeTab?.isLoading || false}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        isSecure={activeTab?.isSecure !== false}
        isBookmarked={isBookmarked}
        isSidePanelOpen={isSidePanelOpen}
        isFlowRecording={isFlowRecording}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onStop={handleStop}
        onHome={handleHome}
        onOpenExternal={handleOpenExternal}
        onToggleBookmark={handleToggleBookmark}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        onOpenSendToSheetsPopover={(rect) => setSendToSheetsPopoverRect(rect)}
        onOpenSendToComposePopover={(rect) => setSendToComposePopoverRect(rect)}
        onOpenFlowsPopover={(rect) => setFlowsPopoverRect((prev) => (prev ? null : rect))}
        onSendWhiteboardChip={() => {
          if (showToast) showToast('Clipped visual layout to Whiteboard canvas');
        }}
        onSaveMemoryChip={() => {
          if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Memory`);
        }}
        onSummarizeChip={() => {
          setIsSidePanelOpen(true);
        }}
      />

      {/* Viewport + Side Panel Layout */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative">
        <BrowserViewport
          activeTab={activeTab}
          savedItems={savedItems}
          isElectron={isElectron}
          isSidePanelOpen={isSidePanelOpen}
          onNavigate={handleNavigate}
          onLaunchCompetitorWorkflow={() => setShowCompetitorWorkflow(true)}
          onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
          onRemoveBookmark={handleRemoveBookmark}
        />

        {/* Regaarder AI Assistant Side Panel */}
        {isSidePanelOpen && (
          <BrowserResearchPanel
            activeTab={activeTab}
            onClose={() => setIsSidePanelOpen(false)}
            onExtractText={handleExtractText}
            onOpenSendToCompose={() => {
              setSendToComposePopoverRect({ bottom: 60, right: 300 });
            }}
            onOpenSendToSheets={() => {
              setSendToSheetsPopoverRect({ bottom: 60, right: 300 });
            }}
            onSaveToMemory={() => {
              if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Memory`);
            }}
            onSendToWhiteboard={() => {
              if (showToast) showToast('Clipped visual layout to Whiteboard canvas');
            }}
            onRunFlowRequested={(flow, initialInputs) => {
              setActiveExecutingFlow({ flow, initialInputs });
            }}
            showToast={showToast}
          />
        )}
      </div>

      {/* Regaarder Flows Menu Popover */}
      {flowsPopoverRect && (
        <BrowserFlowsPopover
          anchorRect={flowsPopoverRect}
          isRecording={isFlowRecording}
          onClose={() => setFlowsPopoverRect(null)}
          onStartRecording={() => {
            if (isFlowRecording) {
              handleStopRecordingFlow();
            } else {
              handleStartRecordingFlow();
            }
          }}
          onSaveRecentAsFlow={handleSaveRecentAsFlow}
          onOpenRunFlow={() => {
            const saved = getSavedFlows();
            if (saved.length > 0) {
              setActiveExecutingFlow({ flow: saved[0] });
            }
          }}
          onOpenMyFlows={() => setShowFlowLibraryModal(true)}
        />
      )}

      {/* Flow Synthesis & Review Modal */}
      {synthesizedFlowToReview && (
        <FlowSynthesisModal
          synthesizedFlow={synthesizedFlowToReview}
          onClose={() => setSynthesizedFlowToReview(null)}
          onSaveSuccess={(updatedFlows, savedFlow) => {
            // Optionally auto-open execution modal for immediate reuse
          }}
          showToast={showToast}
        />
      )}

      {/* My Flows Library Modal */}
      {showFlowLibraryModal && (
        <FlowLibraryModal
          onClose={() => setShowFlowLibraryModal(false)}
          onRunFlow={(flow) => setActiveExecutingFlow({ flow })}
          showToast={showToast}
        />
      )}

      {/* Flow Execution Overlay Modal */}
      {activeExecutingFlow && (
        <FlowExecutionModal
          flow={activeExecutingFlow.flow}
          initialInputs={activeExecutingFlow.initialInputs}
          onClose={() => setActiveExecutingFlow(null)}
          onNavigate={handleNavigate}
          onSendToSheets={(tableData) => {
            handleExecuteSendToSheets({
              destinationSheet: activeExecutingFlow.flow?.name || 'Competitor Analysis',
              tableData
            });
          }}
          showToast={showToast}
        />
      )}

      {/* Contextual Action Popover: Send to Sheets */}
      {sendToSheetsPopoverRect && (
        <SendToSheetsPopover
          anchorRect={sendToSheetsPopoverRect}
          activeTab={activeTab}
          onClose={() => setSendToSheetsPopoverRect(null)}
          onExecuteExport={handleExecuteSendToSheets}
          showToast={showToast}
        />
      )}

      {/* Contextual Action Popover: Send to Compose */}
      {sendToComposePopoverRect && (
        <SendToComposePopover
          anchorRect={sendToComposePopoverRect}
          activeTab={activeTab}
          onClose={() => setSendToComposePopoverRect(null)}
          onExecuteExport={handleExecuteSendToCompose}
          showToast={showToast}
        />
      )}

      {/* Intelligent Workflow: Competitor Research */}
      {showCompetitorWorkflow && (
        <CompetitorResearchWorkflow
          onClose={() => setShowCompetitorWorkflow(false)}
          onSendToSheets={(tableData) => {
            handleExecuteSendToSheets({
              destinationSheet: 'Competitor Research Matrix',
              tableData
            });
          }}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default BrowserWorkspace;
