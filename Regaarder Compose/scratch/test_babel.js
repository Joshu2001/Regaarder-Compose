
const babel = require('@babel/core');
const code =   const App = () => {
    return (
      <div>
        {true ? (
          <div></div>
        ) : (
          <div></div>
        )}
      </div>
    );
  };
\;
console.log(babel.transformSync(code, {presets: ['@babel/preset-react']}).code);
