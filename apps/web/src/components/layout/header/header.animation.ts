export const dropdownAnimation = (isMenuOpen: boolean) => {
  return {
    initial: false,
    animate: {
      maxHeight: isMenuOpen ? '100vh' : '1vh',
    },
    transition: {
      duration: 0.3,
    },
  };
};
