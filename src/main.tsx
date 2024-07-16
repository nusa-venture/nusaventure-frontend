import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import { RootRoute } from "./routes/root";
import * as places from "./routes/places";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRoute />,
    children: [
      {
        path: "/",
        // element: <HomeRoute />,
      },
      {
        path: "/about",
        // element: <AboutRoute />,
      },
      {
        path: "/places",
        element: <places.PlacesRoute />,
        loader: places.loader,
      },
      {
        path: "/track-history",
        // element: <TrackHistory />,
      },
      {
        path: "/social-sharing",
        // element: <SocialSharing />,
      },
    ],
  },
  {
    path: "/",
    // element: <RootRoute />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
