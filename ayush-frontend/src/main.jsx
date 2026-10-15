import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import SignIn from "./pages/SignIn.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Features from "./pages/Features.jsx";
import ApiDocs from "./pages/ApiDocs.jsx";
import Contact from "./pages/Contact.jsx";
import SandboxFlow from "./pages/sandbox/SandboxFlow.jsx";
import "./theme.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/dashboard/:tab?" element={<Features />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/sandbox" element={<SandboxFlow />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/features" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
