import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock all page components
jest.mock("./pages/Login", () => () => <div>Login Page</div>);
jest.mock("./pages/Home", () => () => <div>Home Page</div>);
jest.mock("./pages/ForgotPassword", () => () => <div>Forgot Password Page</div>);
jest.mock("./pages/TaskChecklist", () => () => <div>Task Checklist Page</div>);
jest.mock("./pages/ExpenseTracker", () => () => <div>Expense Tracker Page</div>);
jest.mock("./pages/PetJournal", () => () => <div>Journal Page</div>);
jest.mock("./pages/SocialPage", () => () => <div>Social Page</div>);
jest.mock("./pages/PetMgm", () => () => <div>Pet Management Page</div>);
jest.mock("./pages/NearbyServices", () => () => <div>Nearby Services Page</div>);
jest.mock("./components/Spinner", () => () => <div>Spinner</div>);

// Mock fetch for ping
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );

  // Simulate router history change for testing routes
  window.history.pushState({}, "Test page", "/login");
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("App routing and loading", () => {
  it("renders login page at /login", async () => {
    render(<App />);
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("renders home page at /home", async () => {
    window.history.pushState({}, "Test page", "/home");
    render(<App />);
    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("shows and hides spinner during fetch", async () => {
    window.history.pushState({}, "Test page", "/home");
    render(<App />);
    expect(screen.getByText("Spinner")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Spinner")).not.toBeInTheDocument()
    );
  });

  it("renders nearby services at /nearby-services", async () => {
    window.history.pushState({}, "Test page", "/nearby-services");
    render(<App />);
    expect(
      await screen.findByText("Nearby Services Page")
    ).toBeInTheDocument();
  });
});