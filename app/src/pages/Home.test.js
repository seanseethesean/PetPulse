import { render, screen } from "@testing-library/react";
import Home from "./Home";
import React from "react";

// Mock the Navbar component to isolate testing
jest.mock("../components/Navbar", () => () => <div>MockNavbar</div>);

describe("Home component", () => {
  beforeEach(() => {
    // Set up the localStorage mock
    localStorage.setItem("selectedPetName", "Charlie");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders the pet name from localStorage", () => {
    render(<Home />);
    expect(screen.getByText(/Charlie's day is about to get a whole lot better!/)).toBeInTheDocument();
  });

  it("does not render message if no pet name in localStorage", () => {
    localStorage.removeItem("selectedPetName");
    render(<Home />);
    expect(screen.queryByText(/day is about to get a whole lot better!/)).not.toBeInTheDocument();
  });
});