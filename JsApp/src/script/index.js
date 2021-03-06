// === Vars ===
const table = document.getElementById('filmTable');
const paginationList = document.getElementById('paginationList');
const btnTitleSort = document.getElementById('btnSortTitle');
const btnDateSort = document.getElementById('btnSortDate');
const searchInput = document.getElementById('searchInput');
const notesOnPage = 4;
let currentFilms = [];
let typeOfSort = 'title';
let activePage = 1;
// === / Vars ===

/**
 Entry point in the app   
 */
function init() {
  btnTitleSort.firstChild.classList.add('btnSortArrow-active');

  getFilmData().then(() => {
    setPagination(notesOnPage);
  });
}

// === Film loading ===

/**
 Gett data from database by keys.   
 */
async function getFilmData() {
  const response = await fetch('https://js-camp-htmlform-project-default-rtdb.firebaseio.com/swapi/films.json');
  const filmData = await response.json();

  currentFilms = [];
  for (let key in filmData) {
    currentFilms.push(filmData[key]);
    filmData[key].id = key;
  }

  fillFilmTable();
}

/**
Load film list in the table
 */
function fillFilmTable() {
  clearTable();

  let start = (activePage - 1) * notesOnPage;
  let end = notesOnPage + start;

  let filteredFilms = filterFilms();
  sortFilms(filteredFilms);

  for (let i = start; i < end; i++) {
    if (!filteredFilms[i]) break;
    table.querySelector('#tableBody').appendChild(createHtmlFilmList(filteredFilms[i]));
  }
}

/**
  Remove old notes from table
 */
function clearTable() {
  const tbody = table.querySelector('#tableBody');
  while (tbody.lastChild) {
    tbody.removeChild(tbody.lastChild);
  }
}

/**
 Create DOM elements for new table item
 @param {object} item accept obj item and getting some properties from it
 @returns {HTMLElement} return HTML elem, row of the table
 */
function createHtmlFilmList(item) {
  const { fields } = item;

  const filmInfoUrl = new URL(`./html/filmInfo.html?id=${item.id}`, `${window.location.href}`);
  const HTML = `
    <td><a href="${filmInfoUrl}" class="tableItem tableLink">${fields.title}</a></td>
    <td><div class="tableItem">${fields.release_date}</div></td> 
    <td><div class="tableItem">${fields.director}</div></td>
  `;

  const row = document.createElement('tr');
  row.classList.add('tableRow');
  row.innerHTML = HTML;
  return row;
}
// === / Film loading ===

// === Pagination ===
/**
  Create buttons for pagination film list and add listeners on them 
 */
function setPagination() {
  const numOfBtns = Math.ceil(currentFilms.length / notesOnPage);

  for (let i = 1; i <= numOfBtns; i++) {
    let li = document.createElement('li');
    li.innerHTML = `<button type="button" class="paginationBtn">${i}</button>`;
    li.firstChild.addEventListener('click', function () {
      makePageBtnActive(this);

      let start = (activePage - 1) * notesOnPage;
      let end = notesOnPage + start;

      fillFilmTable(start, end);
    });

    if (parseInt(li.firstChild.innerHTML) === activePage) {
      makePageBtnActive(li.firstChild);
    }

    paginationList.appendChild(li);
  }
}

/**
  Make button, that was click active and other passive
  @param {HTMLElement} elem DOM element, that was click
 */
function makePageBtnActive(elem) {
  activePage = elem.innerHTML;

  let activeBtn = paginationList.querySelector('.active');
  if (activeBtn) {
    activeBtn.classList.remove('active');
  }

  elem.classList.add('active');
}
// === / Pagination ===

// === Sort ===
btnTitleSort.addEventListener('click', () => {
  typeOfSort = typeOfSort === 'title' ? 'title reverse' : 'title';

  toggleSortBtns(btnTitleSort, btnDateSort, 'title reverse');

  fillFilmTable(currentFilms);
});
btnDateSort.addEventListener('click', () => {
  typeOfSort = typeOfSort === 'release_date' ? 'release_date reverse' : 'release_date';

  toggleSortBtns(btnDateSort, btnTitleSort, 'release_date reverse');

  fillFilmTable(currentFilms);
});

/**
  Toggle state of sort buttons.
  @param {HTMLElement} activeBtn button, that was click. Toggle state on active
  @param {HTMLElement} passiveBtn another button. Toggle state on passive
  @param {string} checkTypeSortStr string for chcking state of reverse sort.
 */
function toggleSortBtns(activeBtn, passiveBtn, checkTypeSortStr) {
  if (typeOfSort === checkTypeSortStr) {
    activeBtn.firstChild.classList.add('btnSortArrow-reverse');
  } else {
    activeBtn.firstChild.classList.remove('btnSortArrow-reverse');
  }

  activeBtn.firstChild.classList.add('btnSortArrow-active');

  passiveBtn.firstChild.classList.remove('btnSortArrow-reverse');
  passiveBtn.firstChild.classList.remove('btnSortArrow-active');
}

/**
  Sort the array in place. Returns nothing
  @param {Array} filteredFilms films array after filtration in loadFilmList() func
 */
function sortFilms(filteredFilms) {
  if (typeOfSort.indexOf('reverse') != -1) {
    filteredFilms.sort((a, b) => (a.fields[typeOfSort.substr(0, typeOfSort.indexOf(' '))] < b.fields[typeOfSort.substr(0, typeOfSort.indexOf(' '))] ? 1 : -1));
  } else {
    filteredFilms.sort((a, b) => (a.fields[typeOfSort] > b.fields[typeOfSort] ? 1 : -1));
  }
}
// === / Sort ===

// === Search ===
searchInput.addEventListener('input', () => {
  fillFilmTable();
});

document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
});

/**
  Find input value substring in films titles and filtering array
 */
function filterFilms() {
  return currentFilms.filter(item => {
    if (item.fields.title.toLowerCase().indexOf(searchInput.value.toLowerCase()) != -1) return true;
  });
}
// === / Search ===

document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
});

init();
