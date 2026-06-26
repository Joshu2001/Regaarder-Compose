const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Sparkles, X, Search, Link, ImageIcon } = require('lucide-react');

// Mock document.execCommand
global.document = {
  execCommand: () => {}
};

// Paste the components here
const AIGenerationModal = ({ isOpen, setOpen }) => {
  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {};

  return React.createElement('div', null,
    React.createElement(Sparkles, { size: 18, className: "text-purple-500" }),
    React.createElement(X, { size: 16 })
  );
};

console.log(ReactDOMServer.renderToString(React.createElement(AIGenerationModal, { isOpen: true, setOpen: () => {} })));
