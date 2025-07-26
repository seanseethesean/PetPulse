import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ChatWindow from './ChatWindow';
import SocialService from '../utils/social';
import { io } from 'socket.io-client';

jest.mock('../utils/social');
jest.mock('socket.io-client', () => {
  const socket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  };
  return {
    io: () => socket,
    __esModule: true,
    socket,
  };
});

const mockSocket = io();

describe('ChatWindow', () => {
  const currentUserId = 'me';
  const targetUser = { id: 'you', email: 'you@example.com' };
  const chatId = 'chat_me_you';

  beforeEach(() => {
    SocialService.getChatId.mockReturnValue(chatId);
    SocialService.getMessages.mockResolvedValue({ success: true, messages: [{ content: 'Hello', senderId: 'you' }] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays messages on mount', async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    expect(await screen.findByText('Hello')).toBeInTheDocument();
  });

  it('logs error when getMessages fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    SocialService.getMessages.mockResolvedValueOnce({ success: false, error: 'fail' });

    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Failed to load messages:", { success: false, error: 'fail' });
    });

    errorSpy.mockRestore();
  });

  it('ignores incoming socket message with wrong chatId', async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const handler = mockSocket.on.mock.calls.find(call => call[0] === 'receiveMessage')[1];
    handler({ chatId: 'wrong_id', content: 'Should not appear', senderId: 'you' });

    await waitFor(() => {
      expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
    });
  });

  it('does not send empty message', async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const input = screen.getByRole('textbox');
    const sendBtn = screen.getByText('Send');

    fireEvent.change(input, { target: { value: '    ' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  it('sends message and updates UI on send click', async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const input = screen.getByRole('textbox');
    const sendBtn = screen.getByText('Send');

    fireEvent.change(input, { target: { value: "What's up?" } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('sendMessage', expect.objectContaining({
        senderId: 'me',
        receiverId: 'you',
        content: "What's up?",
        chatId,
      }));
      expect(screen.getByText("What's up?")).toBeInTheDocument();
    });
  });

  it('sends message on Enter key', async () => {
    render(<ChatWindow currentUserId={currentUserId} targetUser={targetUser} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Hey!' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalled();
      expect(screen.getByText('Hey!')).toBeInTheDocument();
    });
  });
});