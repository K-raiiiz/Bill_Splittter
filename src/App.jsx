import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import StartSession from './pages/StartSession';
import ItemEntry from './pages/ItemEntry';
import Summary from './pages/Summary';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header className="app-header">
            <h1>BillSplit</h1>
            <p className="subtitle">Split the bill, not the friendship.</p>
          </header>

          <main className="app-main" style={{ flexGrow: 1 }}>
            <div className="glass-card">
              <Routes>
                <Route path="/" element={<Navigate to="/start" replace />} />
                <Route path="/start" element={<StartSession />} />
                <Route path="/entry" element={<ItemEntry />} />
                <Route path="/summary" element={<Summary />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
