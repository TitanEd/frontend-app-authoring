// Copy of OutlineSidebar for the custom UI: the info sidebar starts closed
// when the course outline loads. Users open/close it as usual afterwards, and
// actions that open it (e.g. selecting a section) still work.
import { useEffect, useRef } from 'react';

import { Sidebar } from '@src/generic/sidebar';

import { useOutlineSidebarContext } from './OutlineSidebarContext';
import { useOutlineSidebarPagesContext } from './OutlineSidebarPagesContext';

const CustomOutlineSidebar = () => {
  const {
    currentPageKey,
    setCurrentPageKey,
    isOpen,
    toggle,
  } = useOutlineSidebarContext();

  const sidebarPages = useOutlineSidebarPagesContext();

  // Close once on first render only (the stock context opens it by default).
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      if (isOpen) { toggle(); }
    }
  }, [isOpen, toggle]);

  return (
    <Sidebar
      pages={sidebarPages}
      currentPageKey={currentPageKey}
      setCurrentPageKey={setCurrentPageKey}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};

export default CustomOutlineSidebar;
