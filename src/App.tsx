import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Landing from "./components/pages/Landing";
import Auth from "./components/pages/Auth";
import Dashboard from "./components/pages/Dashboard";
import CreateDeck from "./components/pages/CreateDeck";
import CreateCard from "./components/pages/CreateCard";
import DeckView from "./components/pages/DeckView";
import FlashcardStudy from "./components/pages/FlashcardStudy";
// import Profile from "./components/pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/Toaster";

export default function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/auth", element: <Auth /> },

    {
      element: <ProtectedRoute />,
      children: [
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/deck/new", element: <CreateDeck /> },
        { path: "/deck/:id", element: <DeckView /> },
        { path: "/deck/:id/card/new", element: <CreateCard /> },
        { path: "/deck/:id/study", element: <FlashcardStudy /> },
        // { path: "/profile", element: <Profile /> },
      ],
    },

    { path: "*", element: <Landing /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
