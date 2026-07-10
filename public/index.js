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

// clickable table rows, keep the inner <a> working for middle click / new tab
document.querySelectorAll('tr[data-href]').forEach((row) => {
  row.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      return;
    }

    if (window.getSelection().toString().length > 0) {
      return;
    }

    window.location.href = row.dataset.href;
  });
});
