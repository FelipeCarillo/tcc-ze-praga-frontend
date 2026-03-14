export const delay = (ms = 1200) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 800));
