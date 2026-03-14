import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { Profile } from "./pages/Profile";
import { Root } from "./pages/Root";
import { AddDish } from "./pages/AddDish";
import { DishDetail } from "./pages/DishDetail";
import { MenuGenerate } from "./pages/MenuGenerate";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "library", Component: Library },
      { path: "profile", Component: Profile },
      { path: "add-dish", Component: AddDish },
      { path: "edit-dish/:id", Component: AddDish },
      { path: "dish/:name", Component: DishDetail },
      { path: "menu-generate", Component: MenuGenerate },
    ],
  },
]);
