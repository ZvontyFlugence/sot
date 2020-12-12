export const getXpNeeded = level => {
  return Math.round(0.08*(level**3)+0.8*(level**2)+2*level);
};