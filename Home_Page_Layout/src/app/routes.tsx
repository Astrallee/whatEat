import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { Profile } from "./pages/Profile";
import { Root } from "./pages/Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "library", Component: Library },
      { path: "profile", Component: Profile },
    ],
  },
]);
