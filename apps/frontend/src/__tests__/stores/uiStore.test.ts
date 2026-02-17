import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: true,
      mobileNavOpen: false,
    });
  });

  it('sidebar defaults to open', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar toggles sidebar state', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleMobileNav toggles mobile nav state', () => {
    expect(useUIStore.getState().mobileNavOpen).toBe(false);

    useUIStore.getState().toggleMobileNav();
    expect(useUIStore.getState().mobileNavOpen).toBe(true);

    useUIStore.getState().toggleMobileNav();
    expect(useUIStore.getState().mobileNavOpen).toBe(false);
  });

  it('closeMobileNav forces mobile nav closed', () => {
    useUIStore.getState().toggleMobileNav();
    expect(useUIStore.getState().mobileNavOpen).toBe(true);

    useUIStore.getState().closeMobileNav();
    expect(useUIStore.getState().mobileNavOpen).toBe(false);
  });
});
