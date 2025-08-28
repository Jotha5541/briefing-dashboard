import './App.css';

import WeatherWidget from './components/WeatherWidget';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Daily Briefing Dashboard</h1>
        <WeatherWidget />
      </header>
    </div>
  );
}

export default App;
