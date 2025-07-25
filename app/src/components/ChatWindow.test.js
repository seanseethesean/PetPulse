import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "./ChatWindow";
import SocialService from "../utils/social";

jest.mock("../utils/social");

describe("ChatWindow", () => {
  const currentUserId = "me";
  const targetUser = { id: "you", email: "you@example.com" };
  const chatId = "chat_me_you";

  beforeEach(() => {
    jest.clearAllMocks();
    SocialService.getChatId.mockReturnValue(chatId);
  });

  it("fetches and displays messages on load", async () => {
    SocialService.getMessages.mockResolvedValue({
      success: true,
      messages: [
        { senderId: "me", content: "Hello" },
        { senderId: "you", content: "Hi there!" }
      ]
    });

    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);

    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("sends a new message and displays it", async () => {
    SocialService.getMessages.mockResolvedValue({ success: true, messages: [] });
    SocialService.sendMessage.mockResolvedValue({ success: true });

    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);

    const input = screen.getByRole("textbox");
    const sendBtn = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "What's up?" } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(SocialService.sendMessage).toHaveBeenCalledWith(chatId, expect.objectContaining({
        senderId: "me",
        receiverId: "you",
        content: "What's up?"
      }));
      expect(screen.getByText("What's up?")).toBeInTheDocument();
    });
  });

  it("does not send empty or whitespace-only messages", async () => {
    SocialService.getMessages.mockResolvedValue({ success: true, messages: [] });

    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);

    const input = screen.getByRole("textbox");
    const sendBtn = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(sendBtn);

    expect(SocialService.sendMessage).not.toHaveBeenCalled();
  });

  it("sends message on Enter key", async () => {
    SocialService.getMessages.mockResolvedValue({ success: true, messages: [] });
    SocialService.sendMessage.mockResolvedValue({ success: true });

    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hey!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(SocialService.sendMessage).toHaveBeenCalled();
      expect(screen.getByText("Hey!")).toBeInTheDocument();
    });
  });
});