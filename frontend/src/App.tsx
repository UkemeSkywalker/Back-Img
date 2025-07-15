import React from 'react';
import './App.css';
import ImageEditor from './components/ImageEditor';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Behind-Image Text Generator</h1>
        <p>Add text behind objects in your images</p>
      </header>
      <main>
        <ImageEditor />
      </main>
    </div>
  );
}

export default App;