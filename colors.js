// frontend/utils/colors.js
export const getRandomColor = () => {
  const colors = ["#9248FE", "#F8DA36", "#F45856"];
  return colors[Math.floor(Math.random() * colors.length)];
};
