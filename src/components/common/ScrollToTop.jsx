import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures that every navigation reset the scroll position
 * of the window to the top. This is essential in SPAs where the browser 
 * might preserve scroll state between different views.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the window to the top instantly
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
