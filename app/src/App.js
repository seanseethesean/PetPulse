import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  //const appName = "PetPulse";

  return (
    <div className = "App">
      <Navbar />
      <div className = "content"></div>
        <Home></Home>
    </div>
  );
}

export default App;
