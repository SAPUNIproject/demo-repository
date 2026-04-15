import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Login from "./pages/out/Login";
import SignUp from "./pages/out/SignUp";
import Dashboard from "./pages/layout/Dashboard";
import Documents from "./pages/layout/Documents";
import DocumentDetails from "./pages/layout/DocumentDetails";
import Profile from "./pages/account/Profile";
import Settings from "./pages/account/Settings";
import Users from "./pages/layout/Users";
import Help from "./pages/out/Help";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/help" element={<Help />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id" element={<DocumentDetails />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;