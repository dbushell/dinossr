// Return the documentation list index of the current page
export const docsIndex = (docs, url) => {
  let index = 0;
  for (let i = 0; i < docs.pages.length; i++) {
    if (docs.pages[i].href === url?.pathname) {
      index = i;
      break;
    }
  }
  return index;
};
