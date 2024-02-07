// Return the documentation list index of the current page
export const docsIndex = (menu: Array<Partial<{href: string}>>, url: URL) => {
  let index = 0;
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].href === url?.pathname) {
      index = i;
      break;
    }
  }
  return index;
};
