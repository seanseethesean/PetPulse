import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "./ChatWindow";
import SocialService from "../utils/social";
import { getSocket } from "../utils/socket";

jest.mock("../utils/socket", () => ({
  getSocket: jest.fn(),
}));

jest.mock("../utils/social", () => ({
  getChatId: jest.fn(),
  getMessages: jest.fn(),
}));

describe("ChatWindow", () => {
  const currentUserId = "me";
  const targetUser = { id: "you", displayName: "You", email: "you@example.com" };
  const mockChatId = "chat_me_you";
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getSocket.mockReturnValue(mockSocket);
    SocialService.getChatId.mockReturnValue(mockChatId);
    SocialService.getMessages.mockResolvedValue({
      success: true,
      messages: [
        { senderId: "me", content: "Hi", chatId: mockChatId },
        { senderId: "you", content: "Hello", chatId: mockChatId },
      ],
    });
  });

  test("renders chat window with initial messages", async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);

    expect(await screen.findByText("Chat with You")).toBeInTheDocument();
    expect(await screen.findByText("Hi")).toBeInTheDocument();
    expect(await screen.findByText("Hello")).toBeInTheDocument();
  });

  test("sends a new message on button click", async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const input = await screen.findByRole("textbox");
    const button = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "What's up?" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("sendMessage", expect.objectContaining({
        content: "What's up?",
        senderId: "me",
        receiverId: "you",
        chatId: mockChatId,
      }));
    });

    expect(screen.getByText("What's up?")).toBeInTheDocument();
    expect(input.value).toBe(""); // Should clear input
  });

  test("sends a new message on Enter key", async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const input = await screen.findByRole("textbox");

    fireEvent.change(input, { target: { value: "Hello Enter" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("sendMessage", expect.objectContaining({
        content: "Hello Enter",
      }));
    });

    expect(screen.getByText("Hello Enter")).toBeInTheDocument();
  });

  test("ignores empty input", async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const button = screen.getByText("Send");
    fireEvent.click(button);
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  test("handles receiving a new message via socket", async () => {
    let receiveCallback;
    mockSocket.on.mockImplementation((event, cb) => {
      if (event === "receiveMessage") receiveCallback = cb;
    });

    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);

    // Wait for initial load
    await screen.findByText("Hi");

    const newMsg = {
      senderId: "you",
      receiverId: "me",
      content: "Real-time update!",
      chatId: mockChatId,
    };

    // Simulate receiving a message
    receiveCallback(newMsg);

    expect(await screen.findByText("Real-time update!")).toBeInTheDocument();
  });

  test("cleans up socket listener on unmount", async () => {
    const { unmount } = render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    await screen.findByText("Hi");
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith("receiveMessage", expect.any(Function));
  });
});