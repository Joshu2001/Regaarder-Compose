
const babel = require('@babel/core');
try {
  babel.transformSync('const App = () => { return <div></div></div>; };', {presets: ['@babel/preset-react']});
} catch(e) {
  console.log(e.message);
}
