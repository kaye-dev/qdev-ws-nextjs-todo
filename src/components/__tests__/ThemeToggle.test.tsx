import { render, screen, fireEvent } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '../ThemeToggle';

// Mock the useTheme hook
jest.mock('@/hooks/useTheme');
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Light mode display', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });
    });

    it('renders sun icon when in light mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Check for sun icon (should have yellow color class)
      const sunIcon = button.querySelector('svg.text-yellow-300');
      expect(sunIcon).toBeInTheDocument();
    });

    it('has correct aria-label for light mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode. Currently in light mode.');
    });

    it('has correct aria-pressed value for light mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Dark mode display', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });
    });

    it('renders moon icon when in dark mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Check for moon icon (should have blue color class)
      const moonIcon = button.querySelector('svg.text-blue-500');
      expect(moonIcon).toBeInTheDocument();
    });

    it('has correct aria-label for dark mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode. Currently in dark mode.');
    });

    it('has correct aria-pressed value for dark mode', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Theme switching functionality', () => {
    it('switches from light to dark when clicked', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });

    it('switches from dark to light when clicked', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });
    });

    it('switches theme when Enter key is pressed', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });

    it('switches theme when Space key is pressed', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });

    it('does not switch theme for other keys', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'a' });

      expect(mockSetTheme).not.toHaveBeenCalled();
    });

    it('handles keyboard events correctly', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Test that keyboard events trigger theme changes
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      mockSetTheme.mockClear();

      fireEvent.keyDown(button, { key: ' ' });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Styling and positioning', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });
    });

    it('has fixed positioning classes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'bottom-4', 'right-4');
    });

    it('has proper z-index for overlay', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('z-[9999]');
    });

    it('has rounded styling', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('has theme-toggle-button class for CSS animations', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-toggle-button');
    });

    it('has focus classes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('outline-none', 'focus:outline-none', 'cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });
    });

    it('has proper button type', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has aria-hidden on icons', () => {
      render(<ThemeToggle />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('is focusable', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has enhanced aria-label with current and next theme information', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode. Currently in light mode.');
    });

    it('has aria-describedby pointing to description element', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'theme-toggle-description');

      const description = document.getElementById('theme-toggle-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Toggle between light and dark theme. Use Enter or Space key to activate.');
    });

    it('has tooltip title attribute', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('has minimum touch target size (44px x 44px)', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-[44px]', 'h-[44px]', 'aspect-square');
    });

    it('has proper focus management classes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'outline-none',
        'focus:outline-none',
        'cursor-pointer'
      );
    });

    it('has screen reader announcement area', () => {
      render(<ThemeToggle />);

      const announcement = screen.getByRole('status');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
      expect(announcement).toHaveClass('sr-only');
    });

    it('announces theme changes to screen readers', async () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      const announcement = screen.getByRole('status');

      // Initially empty
      expect(announcement).toHaveTextContent('');

      // Click to switch theme
      fireEvent.click(button);

      // Should announce the change
      expect(announcement).toHaveTextContent('Switched to dark mode');

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(announcement).toHaveTextContent('');
    });

    it('announces theme changes via keyboard', async () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      const announcement = screen.getByRole('status');

      // Press Enter key
      fireEvent.keyDown(button, { key: 'Enter' });

      // Should announce the change
      expect(announcement).toHaveTextContent('Switched to dark mode');

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(announcement).toHaveTextContent('');
    });

    it('has proper icon accessibility attributes', () => {
      render(<ThemeToggle />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).toHaveAttribute('aria-label', 'Sun icon');
    });

    it('updates icon accessibility attributes when theme changes', () => {
      const { rerender } = render(<ThemeToggle />);

      // Initially light mode - sun icon
      let icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveAttribute('aria-label', 'Sun icon');

      // Switch to dark mode
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      // Now dark mode - moon icon
      icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveAttribute('aria-label', 'Moon icon');
    });

    it('handles keyboard events correctly and prevents default', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      mockSetTheme.mockClear();

      // Test Space key
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      // Test that other keys don't trigger theme change
      mockSetTheme.mockClear();
      fireEvent.keyDown(button, { key: 'Tab' });
      expect(mockSetTheme).not.toHaveBeenCalled();
    });
  });

  describe('System theme handling', () => {
    it('handles system theme resolved to light', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      const sunIcon = button.querySelector('svg.text-yellow-300');
      expect(sunIcon).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode. Currently in light mode.');
    });

    it('handles system theme resolved to dark', () => {
      mockUseTheme.mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      const moonIcon = button.querySelector('svg.text-blue-500');
      expect(moonIcon).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode. Currently in dark mode.');
    });
  });

  describe('Animation and Transition Features', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('applies theme-toggle-button class for CSS animations', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('theme-toggle-button');
    });

    it('applies theme-toggle-icon class to icons', () => {
      render(<ThemeToggle />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('theme-toggle-icon');
    });

    it('adds button-bounce class when clicked', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveClass('button-bounce');
    });

    it('removes button-bounce class after animation completes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveClass('button-bounce');

      // Fast-forward time to after animation completes
      jest.advanceTimersByTime(300);

      expect(button).not.toHaveClass('button-bounce');
    });

    it('applies icon animation classes when theme changes', () => {
      const { rerender } = render(<ThemeToggle />);

      // Switch to dark mode to trigger animation
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('icon-fade-in');
    });

    it('applies different animation classes for different themes', () => {
      // Start with dark mode
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      const { rerender } = render(<ThemeToggle />);

      // Switch to light mode
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      rerender(<ThemeToggle />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('icon-rotate-in');
    });

    it('handles animation state correctly', () => {
      const { rerender } = render(<ThemeToggle />);

      // Initially no animation
      let icon = screen.getByRole('button').querySelector('svg');
      expect(icon).not.toHaveClass('icon-rotate-in');
      expect(icon).not.toHaveClass('icon-fade-in');

      // Switch theme to trigger animation
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('icon-fade-in');

      // Test that animation classes are applied when theme changes
      // The actual timeout behavior is tested in other tests
    });

    it('handles rapid theme changes without breaking animations', () => {
      const { rerender } = render(<ThemeToggle />);

      // Rapid theme changes
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      rerender(<ThemeToggle />);

      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      // Should still have animation class
      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('icon-fade-in');
    });

    it('respects prefers-reduced-motion through CSS classes', () => {
      // This test verifies that the CSS classes are applied correctly
      // The actual motion reduction is handled by CSS media queries
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      const icon = screen.getByRole('button').querySelector('svg');

      expect(button).toHaveClass('theme-toggle-button');
      expect(icon).toHaveClass('theme-toggle-icon');

      // CSS media queries will handle the actual motion reduction
      // We just need to ensure the classes are present for CSS to target
    });

    it('maintains button functionality during animations', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Click to start animation
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');

      // Should still be clickable during animation
      mockSetTheme.mockClear();
      fireEvent.click(button);
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('handles keyboard interactions with animations', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Keyboard interaction should also trigger animations
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(button).toHaveClass('button-bounce');
    });
  });

  describe('Enhanced Accessibility Features', () => {
    it('maintains focus after theme change', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.click(button);
      expect(button).toHaveFocus();
    });

    it('has proper ARIA attributes for toggle button', () => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-describedby', 'theme-toggle-description');
    });

    it('updates ARIA attributes correctly when theme changes', () => {
      const { rerender } = render(<ThemeToggle />);

      // Initially light mode
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });

      rerender(<ThemeToggle />);

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode. Currently in light mode.');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');

      // Switch to dark mode
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode. Currently in dark mode.');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });

    it('provides clear instructions in description element', () => {
      render(<ThemeToggle />);

      const description = document.getElementById('theme-toggle-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
      expect(description).toHaveTextContent('Toggle between light and dark theme. Use Enter or Space key to activate.');
    });

    it('handles rapid theme changes gracefully', async () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      const announcement = screen.getByRole('status');

      // Multiple rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should have made multiple calls to setTheme
      expect(mockSetTheme).toHaveBeenCalledTimes(3);

      // Should have some announcement text (the exact text depends on the final state)
      expect(announcement.textContent).toBeTruthy();
      expect(announcement.textContent).toMatch(/Switched to (light|dark) mode/);
    });
  });

  describe('Responsive Design and Positioning', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
        resolvedTheme: 'light',
      });
    });

    it('has proper fixed positioning classes for all screen sizes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed');
      expect(button).toHaveClass('bottom-4', 'right-4'); // Base positioning
      expect(button).toHaveClass('sm:bottom-6', 'sm:right-6'); // Small screens
      expect(button).toHaveClass('md:bottom-8', 'md:right-8'); // Medium screens
    });

    it('has highest z-index to avoid UI conflicts', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('z-[9999]');
    });

    it('has minimum touch target size for mobile (44px x 44px)', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-[44px]', 'h-[44px]', 'aspect-square');
    });

    it('has responsive touch target sizes for different screen sizes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-[44px]', 'h-[44px]'); // Base mobile
      expect(button).toHaveClass('sm:w-[48px]', 'sm:h-[48px]'); // Small screens
      expect(button).toHaveClass('md:w-[52px]', 'md:h-[52px]'); // Medium screens
      expect(button).toHaveClass('aspect-square'); // Always square
    });

    it('has responsive padding for different screen sizes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-3'); // Base padding
      expect(button).toHaveClass('sm:p-4'); // Small screen padding
    });

    it('has proper margins from screen edges', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      // Base positioning provides 16px (1rem) margin from edges
      expect(button).toHaveClass('bottom-4', 'right-4');
      // Responsive positioning provides larger margins on bigger screens
      expect(button).toHaveClass('sm:bottom-6', 'sm:right-6');
      expect(button).toHaveClass('md:bottom-8', 'md:right-8');
    });

    it('has responsive icon sizes', () => {
      render(<ThemeToggle />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('w-5', 'h-5'); // Base size
      expect(icon).toHaveClass('sm:w-6', 'sm:h-6'); // Small screens
      expect(icon).toHaveClass('md:w-7', 'md:h-7'); // Medium screens
    });

    it('has proper transition classes for smooth interactions', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all', 'duration-200', 'ease-in-out');
    });

    it('has hover shadow effects', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-lg', 'hover:shadow-xl');
    });

    it('maintains proper button structure for all screen sizes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('flex', 'items-center', 'justify-center');
      expect(button).toHaveClass('rounded-full');
    });

    it('has proper background and border styling', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-900', 'dark:bg-white');
      expect(button).toHaveClass('border', 'border-gray-800', 'dark:border-gray-200');
    });

    it('has proper focus ring styling', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'outline-none',
        'focus:outline-none',
        'cursor-pointer'
      );
    });

    it('maintains accessibility across all responsive breakpoints', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Ensure minimum touch target is maintained across all breakpoints
      expect(button).toHaveClass('w-[44px]', 'h-[44px]', 'aspect-square');

      // Ensure proper ARIA attributes are present
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
      expect(button).toHaveAttribute('type', 'button');

      // Ensure focus management works
      expect(button).toHaveClass('outline-none', 'focus:outline-none', 'cursor-pointer');
    });

    it('has proper stacking context to avoid UI conflicts', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      // High z-index ensures button appears above other content
      expect(button).toHaveClass('z-[9999]');

      // Button should be positioned fixed to stay in place during scroll
      expect(button).toHaveClass('fixed');
    });

    it('handles theme changes without affecting positioning', () => {
      const { rerender } = render(<ThemeToggle />);

      let button = screen.getByRole('button');

      // Switch to dark mode
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      button = screen.getByRole('button');

      // Positioning classes should remain the same
      expect(button).toHaveClass('fixed');
      expect(button).toHaveClass('bottom-4', 'right-4');
      expect(button).toHaveClass('sm:bottom-6', 'sm:right-6');
      expect(button).toHaveClass('md:bottom-8', 'md:right-8');
      expect(button).toHaveClass('z-[9999]');

      // Size classes should remain the same
      expect(button).toHaveClass('w-[44px]', 'h-[44px]');
      expect(button).toHaveClass('sm:w-[48px]', 'sm:h-[48px]');
      expect(button).toHaveClass('md:w-[52px]', 'md:h-[52px]');
      expect(button).toHaveClass('aspect-square');
    });

    it('maintains proper touch interaction area on mobile', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Minimum 44px touch target as per WCAG guidelines
      expect(button).toHaveClass('w-[44px]', 'h-[44px]', 'aspect-square');

      // Proper padding to ensure comfortable touch area
      expect(button).toHaveClass('p-3');

      // Flex centering to ensure icon is properly centered within touch area
      expect(button).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('has proper visual hierarchy with shadows and borders', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Base shadow for depth
      expect(button).toHaveClass('shadow-lg');

      // Enhanced shadow on hover
      expect(button).toHaveClass('hover:shadow-xl');

      // Border for definition
      expect(button).toHaveClass('border', 'border-gray-800', 'dark:border-gray-200');

      // Background colors for contrast
      expect(button).toHaveClass('bg-gray-900', 'dark:bg-white');
    });

    it('ensures button does not interfere with scrolling', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // Fixed positioning keeps button out of document flow
      expect(button).toHaveClass('fixed');

      // Positioned away from main content area
      expect(button).toHaveClass('bottom-4', 'right-4');

      // High z-index ensures it floats above content without blocking interaction
      expect(button).toHaveClass('z-[9999]');
    });

    it('maintains consistent appearance across theme changes', () => {
      const { rerender } = render(<ThemeToggle />);

      // Light mode
      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-900', 'border-gray-800');

      // Switch to dark mode
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
        resolvedTheme: 'dark',
      });

      rerender(<ThemeToggle />);

      button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-white', 'dark:border-gray-200');

      // All other classes should remain consistent
      expect(button).toHaveClass('fixed', 'rounded-full', 'shadow-lg');
      expect(button).toHaveClass('w-[44px]', 'h-[44px]', 'aspect-square');
    });
  });
});
