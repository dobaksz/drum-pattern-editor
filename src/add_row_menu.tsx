import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Palette, Plus } from "lucide-react";
import { ROW_PRESET_GROUPS, RowDetails } from "./pattern_config";

interface AddRowMenuProps {
  onAddPreset: (details: RowDetails) => void;
  onCreateCustom: () => void;
}

export function AddRowMenu({ onAddPreset, onCreateCustom }: AddRowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: PointerEvent): void {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const button = containerRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;

    const gap = 7;
    const viewportPadding = 8;
    const buttonRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const toolbarBottom = document.querySelector(".editor-toolbar")?.getBoundingClientRect().bottom ?? 0;
    const spaceAbove = buttonRect.top - toolbarBottom - gap;
    const spaceBelow = window.innerHeight - buttonRect.bottom - gap;
    const preferredTop = spaceAbove >= menuRect.height || spaceAbove >= spaceBelow
      ? buttonRect.top - menuRect.height - gap
      : buttonRect.bottom + gap;

    setMenuPosition({
      left: Math.min(
        window.innerWidth - menuRect.width - viewportPadding,
        Math.max(viewportPadding, buttonRect.left + buttonRect.width / 2 - menuRect.width / 2)
      ),
      top: Math.min(
        Math.max(toolbarBottom + viewportPadding, window.innerHeight - menuRect.height - viewportPadding),
        Math.max(toolbarBottom + viewportPadding, preferredTop)
      )
    });
  }, [isOpen]);

  function closeMenu(): void {
    setIsOpen(false);
  }

  function addPreset(details: RowDetails): void {
    onAddPreset(details);
    setIsOpen(false);
  }

  function createCustom(): void {
    setIsOpen(false);
    onCreateCustom();
  }

  return (
    <div className="add-row-menu" ref={containerRef}>
      <button
        className="add-row-button"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => {
          setMenuPosition(null);
          setIsOpen((open) => !open);
        }}
      >
        <Plus size={15} />
        Add row
        <ChevronDown size={14} />
      </button>
      {isOpen && createPortal(
        <div
          className="row-preset-menu"
          ref={menuRef}
          role="menu"
          style={{
            left: menuPosition?.left ?? 0,
            top: menuPosition?.top ?? 0,
            visibility: menuPosition ? "visible" : "hidden"
          } as CSSProperties}
        >
          {ROW_PRESET_GROUPS.map((group) => (
            <div className="row-preset-group" key={group.label}>
              <p>{group.label}</p>
              {group.presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  role="menuitem"
                  onClick={() => addPreset(preset)}
                >
                  <span className="row-preset-swatch" style={{ background: preset.color }} />
                  {preset.name}
                </button>
              ))}
            </div>
          ))}
          <button className="custom-row-option" type="button" role="menuitem" onClick={createCustom}>
            <Palette size={15} />
            Custom row…
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
