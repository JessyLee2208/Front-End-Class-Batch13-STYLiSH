function addCarSnackbarControl() {
  const snackbar = document.querySelector('.snackbar');
  snackbar.classList.add('active');
  setTimeout(() => {
    snackbar.classList.remove('active');
  }, 3000);
}

function searchEvent() {
  const searchbar = document.querySelector('input[type="search"]');
  const searchInput = document.querySelector('input');

  searchbar.addEventListener('search', function () {
    console.log(searchInput.value);
    if (searchInput.value !== '') {
      window.location.href = `index.html?tag=${searchInput.value}`;
    } else {
      //
    }
  });
}

function controlSearchBar() {
  const searchIcon = document.querySelector('.inputicon');
  const searchInputbg = document.querySelector('.searchbar');
  const searchInput = document.querySelector('input');

  searchIcon.addEventListener('click', function () {
    if (searchInputbg.className === 'searchbar clearfix') {
      searchInputbg.className = 'searchbar clearfix searchactive';
      searchInput.style.display = 'flex';
    } else {
      searchInputbg.className = 'searchbar clearfix';
      searchInput.style.display = 'none';
    }
  });
}

export default { addCarSnackbarControl, searchEvent, controlSearchBar };
