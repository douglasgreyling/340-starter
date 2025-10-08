function showSaveModal() {
  document.getElementById('saveModal').style.display = 'block';
}

function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('saveModal');

  if (modal) {
    window.onclick = function(event) {
      if (event.target === modal) {
        closeSaveModal();
      }
    };
  }

  addPrintButton();
});

function addPrintButton() {
  const header = document.querySelector('.comparison-header');
  if (header) {
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print Comparison';
    printBtn.className = 'btn btn-outline';
    printBtn.onclick = printComparison;
    header.appendChild(printBtn);
  }
}

function printComparison() {
  const printWindow = window.open('', '_blank');

  const comparisonContent = document.querySelector('.comparison-container').innerHTML;
  const title = document.querySelector('h1').textContent;

  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          text-align: center;
          color: #007bff;
          margin-bottom: 30px;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
        }
        .comparison-row {
          display: table-row;
        }
        .spec-label,
        .vehicle-column {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
          vertical-align: top;
        }
        .spec-label {
          background-color: #f8f9fa;
          font-weight: bold;
          width: 150px;
        }
        .vehicle-column {
          text-align: center;
        }
        .image-row img {
          max-width: 150px;
          height: auto;
          margin-bottom: 10px;
        }
        .price {
          font-weight: bold;
          color: #28a745;
          font-size: 1.1em;
        }
        .description-text {
          text-align: left;
          font-size: 0.9em;
          line-height: 1.4;
        }
        .btn {
          display: none; /* Hide buttons in print */
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="comparison-container">
        ${comparisonContent}
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.close();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printHTML);
  printWindow.document.close();
}

document.addEventListener('DOMContentLoaded', function() {
  highlightBestValues();
});

function highlightBestValues() {
  highlightLowestPrice();

  highlightLowestMileage();

  highlightNewestYear();
}

function highlightLowestPrice() {
  const priceRows = document.querySelectorAll('.comparison-row');
  let priceRow = null;

  priceRows.forEach(row => {
    const label = row.querySelector('.spec-label');
    if (label && label.textContent.trim() === 'Price') {
      priceRow = row;
    }
  });

  if (!priceRow) return;

  const priceCells = priceRow.querySelectorAll('.vehicle-column .price');
  let lowestPrice = Infinity;
  let lowestCell = null;

  priceCells.forEach(cell => {
    const priceText = cell.textContent.replace(/[\$,]/g, '');
    const price = parseFloat(priceText);

    if (price < lowestPrice) {
      lowestPrice = price;
      lowestCell = cell;
    }
  });

  if (lowestCell) {
    lowestCell.style.backgroundColor = '#d4edda';
    lowestCell.style.border = '2px solid #28a745';
    lowestCell.title = 'Lowest Price';
  }
}

function highlightLowestMileage() {
  const rows = document.querySelectorAll('.comparison-row');
  let mileageRow = null;

  rows.forEach(row => {
    const label = row.querySelector('.spec-label');
    if (label && label.textContent.trim() === 'Mileage') {
      mileageRow = row;
    }
  });

  if (!mileageRow) return;

  const mileageCells = mileageRow.querySelectorAll('.vehicle-column');
  let lowestMileage = Infinity;
  let lowestCell = null;

  mileageCells.forEach(cell => {
    const mileageText = cell.textContent.replace(/[,\s]/g, '').replace('miles', '');
    const mileage = parseInt(mileageText);

    if (!isNaN(mileage) && mileage < lowestMileage) {
      lowestMileage = mileage;
      lowestCell = cell;
    }
  });

  if (lowestCell) {
    lowestCell.style.backgroundColor = '#d4edda';
    lowestCell.style.border = '2px solid #28a745';
    lowestCell.title = 'Lowest Mileage';
  }
}

function highlightNewestYear() {
  const rows = document.querySelectorAll('.comparison-row');
  let yearRow = null;

  rows.forEach(row => {
    const label = row.querySelector('.spec-label');
    if (label && label.textContent.trim() === 'Year') {
      yearRow = row;
    }
  });

  if (!yearRow) return;

  const yearCells = yearRow.querySelectorAll('.vehicle-column');
  let newestYear = 0;
  let newestCell = null;

  yearCells.forEach(cell => {
    const year = parseInt(cell.textContent.trim());

    if (!isNaN(year) && year > newestYear) {
      newestYear = year;
      newestCell = cell;
    }
  });

  if (newestCell) {
    newestCell.style.backgroundColor = '#d4edda';
    newestCell.style.border = '2px solid #28a745';
    newestCell.title = 'Newest Year';
  }
}