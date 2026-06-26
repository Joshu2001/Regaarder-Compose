const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const spot = `export default function App() {`;

const newEffect = `export default function App() {
  useEffect(() => {
    const handleBlockHover = (e) => {
      const targetBlock = e.target.closest?.('[data-block-type]');
      const menu = e.target.closest?.('#block-hover-menu');
      
      if (targetBlock) {
        setHoveredBlockMenu({
          element: targetBlock,
          type: targetBlock.getAttribute('data-block-type'),
          rect: targetBlock.getBoundingClientRect()
        });
      } else if (!menu) {
        setHoveredBlockMenu(null);
      }
    };
    document.addEventListener('mousemove', handleBlockHover);
    return () => document.removeEventListener('mousemove', handleBlockHover);
  }, []);`;

if (!app.includes('handleBlockHover')) {
  app = app.replace(spot, newEffect);
  fs.writeFileSync('src/App.jsx', app);
  console.log('Hover effect inserted successfully.');
} else {
  console.log('Hover effect already exists.');
}
