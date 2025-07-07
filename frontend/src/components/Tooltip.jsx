import React, { useState, useRef, useEffect } from "react";

const Tooltip = ({ 
  children, 
  content, 
  position = "top", 
  delay = 300,
  className = "",
  disabled = false,
  maxWidth = "200px"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Don't render tooltip if disabled or no content
  if (disabled || !content) {
    return children;
  }

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate optimal position based on viewport
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = position;

      // Check if tooltip would go outside viewport and adjust position
      switch (position) {
        case "top":
          if (rect.top - tooltipRect.height < 10) {
            newPosition = "bottom";
          }
          break;
        case "bottom":
          if (rect.bottom + tooltipRect.height > viewportHeight - 10) {
            newPosition = "top";
          }
          break;
        case "left":
          if (rect.left - tooltipRect.width < 10) {
            newPosition = "right";
          }
          break;
        case "right":
          if (rect.right + tooltipRect.width > viewportWidth - 10) {
            newPosition = "left";
          }
          break;
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none transition-opacity duration-200";
    const positionClasses = {
      top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
    };
    
    return `${baseClasses} ${positionClasses[actualPosition]} ${className}`;
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-gray-900 transform rotate-45";
    const arrowPositions = {
      top: "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      bottom: "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2",
      left: "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2",
      right: "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2"
    };
    
    return `${baseClasses} ${arrowPositions[actualPosition]}`;
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      ref={triggerRef}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={{ 
            opacity: isVisible ? 1 : 0,
            maxWidth: maxWidth,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
          role="tooltip"
          aria-label={typeof content === 'string' ? content : undefined}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
