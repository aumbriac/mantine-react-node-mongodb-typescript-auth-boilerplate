import React, { useState } from "react";
import "./App.css";
import Landing from "./pages/Landing";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Members from "./pages/Members";
import AppState from "./context/AppState";
import { NotificationsProvider } from "@mantine/notifications";
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  AppShell,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ResetPassword from './pages/ResetPassword'

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "boilerplate-color-scheme",
    defaultValue: "light",
  });
  const toggleColorScheme = () =>
    setColorScheme((current: string) =>
      current === "dark" ? "light" : "dark"
    );

  return (
    <AppState>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >
          <NotificationsProvider>
            <AppShell
              navbarOffsetBreakpoint="sm"
              asideOffsetBreakpoint="sm"
              navbar={<Navbar />}
              aside={<Sidebar />}
              footer={<Footer />}
              header={<Header />}
            >
              <Router>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/resetPassword" element={<ResetPassword />} />
                  <Route path="*" element={<p>404 | Page Not Found</p>} />
                </Routes>
              </Router>
            </AppShell>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </AppState>
  );
}

export default App;