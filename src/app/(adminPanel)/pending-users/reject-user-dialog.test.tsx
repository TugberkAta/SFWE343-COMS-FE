import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectUserDialog } from './reject-user-dialog';

global.fetch = vi.fn();

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

describe('RejectUserDialog', () => {
  const mockUser = {
    id: 'user-123',
    firstName: 'Ahmet',
    lastName: 'Yilmaz',
    email: 'ahmet@example.com',
  };

  const mockOnRejected = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open is true', () => {
    render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText(/Ahmet Yilmaz/i)).toBeDefined();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={false}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(container.textContent).toBe('');
  });

  it('should display firstName and lastName together', () => {
    render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText(/Ahmet Yilmaz/i)).toBeDefined();
  });

  it('should display only firstName when lastName is empty', () => {
    const userOnlyFirst = { ...mockUser, lastName: '' };
    
    render(
      <RejectUserDialog
        user={userOnlyFirst}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const element = screen.getByText((content) => content.includes('Ahmet'));
    expect(element).toBeDefined();
  });

  it('should display only lastName when firstName is empty', () => {
    const userOnlyLast = { ...mockUser, firstName: '', lastName: 'Demir' };
    
    render(
      <RejectUserDialog
        user={userOnlyLast}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const element = screen.getByText((content) => content.includes('Demir'));
    expect(element).toBeDefined();
  });

  it('should call fetch with correct API endpoint and payload', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({ ok: true });

    render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Reject request/i });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/pending-users/reject',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: mockUser.email }),
        })
      );
    });
  });

  it('should call onRejected callback after successful submission', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({ ok: true });

    render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Reject request/i });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockOnRejected).toHaveBeenCalled();
    });
  });

  it('should handle API error correctly', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({ ok: false });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Reject request/i });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should not call onRejected when API fails', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValue({ ok: false });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RejectUserDialog
        user={mockUser}
        onRejected={mockOnRejected}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const rejectButton = screen.getByRole('button', { name: /Reject request/i });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(mockOnRejected).not.toHaveBeenCalled();
  });

  it('should render dialog even when user is null', () => {
  render(
    <RejectUserDialog
      user={null}
      onRejected={mockOnRejected}
      open={true}
      onOpenChange={mockOnOpenChange}
    />
  );

  expect(screen.getByText(/Reject this request/i)).toBeDefined();
});
});
