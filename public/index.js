//number formatting script

// "1234567" -> "1 234 567"
function formatNumber(number) {
  return Number(number).toLocaleString('ru-RU');
}

const numberElements = document.getElementsByClassName('number');

Array.from(numberElements).forEach((element) => {
  const originalNumber = element.textContent;
  element.textContent = formatNumber(originalNumber);
});
