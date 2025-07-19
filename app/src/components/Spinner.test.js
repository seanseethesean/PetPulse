import { render } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner component', () => {
  test('renders spinner container and spinner element', () => {
    const { container } = render(<Spinner />);
    const overlay = container.firstChild;
    const spinner = overlay.firstChild;

    expect(overlay).toHaveClass('spinner-overlay');
    expect(spinner).toHaveClass('spinner');
  });
});