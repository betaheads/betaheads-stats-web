//number formatting script

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const numberElements = document.getElementsByClassName('number');

Array.from(numberElements).forEach((element) => {
  const originalNumber = element.textContent;
  element.textContent = formatNumber(originalNumber);
});
