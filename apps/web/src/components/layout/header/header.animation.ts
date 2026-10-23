export const dropdownAnimation = (isMenuOpen: boolean) => {
  return {
    initial: false,
    animate: {
      // 0 (not 1vh) so the closed layer does not cover logo/menu hit targets.
      maxHeight: isMenuOpen ? '100vh' : 0,
    },
    transition: {
      duration: 0.3,
    },
  };
};
