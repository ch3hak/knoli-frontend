import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Landing from "./components/pages/Landing";
import Auth from "./components/pages/Auth";
import {Toaster} from  "./components/ui/Toaster"

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "*",
      element: <Landing />,
    },
  ]);

  return (
  <>
  <RouterProvider router={router} />
  <Toaster />
  </>
  );
}
