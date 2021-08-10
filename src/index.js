const rangeControl = document.querySelector("#distance");
const rangeOutput = document.querySelector('#distance-display')
rangeControl.addEventListener('input', (e) => {
  const padRight = (value, length) => {
    const rightLength = value.toString().split('.')[1]?.length || 0
    return rightLength === 0 ? `${value}.${'0'.repeat(length)}` : rightLength < length ? `${value}${'0'.repeat(length - rightLength)}` : `${value}`;
  }
  const mileValue = (miles) => miles <= 1 ? `${padRight(miles, 2)} mile` : `${padRight(miles, 2)} miles`;
  rangeOutput.value = mileValue(e.target.value);
})

fetch('http://localhost:3000/api/test', {
  method: 'GET'
}).then(res => res.json()).then(console.log)