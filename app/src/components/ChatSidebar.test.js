import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatSidebar from "./ChatSidebar";

// Mock ChatWindow to isolate behavior
jest.mock("./ChatWindow", () => () => <div data-testid="chat-window">ChatWindow</div>);

describe("ChatSidebar", () => {
  const currentUserId = "me123";

  it("shows message when there are no mutuals", () => {
    render(<ChatSidebar currentUserId={currentUserId} mutuals={[]} />);

    expect(screen.getByText("No mutuals to chat with.")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-window")).not.toBeInTheDocument();
  });

  it("renders buttons for each mutual", () => {
    const mutuals = [
      { id: "user1", email: "user1@example.com" },
      { id: "user2", displayName: "FriendlyUser" }
    ];

    render(<ChatSidebar currentUserId={currentUserId} mutuals={mutuals} />);

    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("FriendlyUser")).toBeInTheDocument();
  });

  it("clicking a mutual user shows the ChatWindow", () => {
    const mutuals = [{ id: "user1", email: "user1@example.com" }];

    render(<ChatSidebar currentUserId={currentUserId} mutuals={mutuals} />);

    const userBtn = screen.getByText("user1@example.com");
    fireEvent.click(userBtn);

    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
  });
});