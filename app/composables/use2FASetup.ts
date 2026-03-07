/**
 * Global singleton state for the Enable 2FA modal.
 * Any component can call `use2FASetup().open()` to trigger it.
 */
const isOpen = ref(false);

export function use2FASetup() {
  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, open, close };
}
