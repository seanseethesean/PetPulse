import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/home' }), // simulate starting at "/home"
  };
});

jest.mock('../assets/images/Petpulse.png', () => 'mock-logo.png');

describe('Navbar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders all navigation buttons and logo', () => {
    render(<Navbar />);

    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();

    const navItems = [
      'Home',
      'Social',
      'Task Checklist',
      'Pet Journal',
      'Expense Tracker',
      'Nearby Services',
      'Pet Profile',
    ];

    navItems.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('disables the button for current path (/home)', () => {
    render(<Navbar />);
    const homeBtn = screen.getByText('Home');
    expect(homeBtn).toBeDisabled();
    expect(homeBtn).toHaveClass('active');
  });

  test('navigates when other buttons are clicked', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByText('Social'));
    expect(mockNavigate).toHaveBeenCalledWith('/social-Page');

    fireEvent.click(screen.getByText('Task Checklist'));
    expect(mockNavigate).toHaveBeenCalledWith('/task-Checklist');

    fireEvent.click(screen.getByText('Pet Journal'));
    expect(mockNavigate).toHaveBeenCalledWith('/journal');

    fireEvent.click(screen.getByText('Expense Tracker'));
    expect(mockNavigate).toHaveBeenCalledWith('/expense-Tracker');

    fireEvent.click(screen.getByText('Nearby Services'));
    expect(mockNavigate).toHaveBeenCalledWith('/nearby-services');

    fireEvent.click(screen.getByText('Pet Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/petmgm');
  });
});