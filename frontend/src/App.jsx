
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./hooks/ProtectedRoute";


const App = () => {
  
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />}/>
                <Route path="/signup" element={<Signup />}/> 
                {/* Protected dashboard Route */}
                <Route path="/dashboard/*" element={ <ProtectedRoute> <Dashboard />  </ProtectedRoute>  }/> 
                {/* Error Pages */}
                <Route path="*" element={<Home />}/>
            </Routes>

            <ToastContainer
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            theme="light"
          />
        </Router>
    );
};

export default App;
