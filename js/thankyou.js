import api from './api.js';
import common from './common.js';

const Tag = api.Tag;
common.searchEvent();
common.controlSearchBar();
// const ApiList = api.ApiList;
api.loginEvent();

/* eslint-disable no-undef */
let tag = new Tag();

const displayorderNum = document.querySelector('.userNumber');
displayorderNum.innerHTML = tag.getNumber();

const searchbar = document.querySelector('input[type="search"]');
const searchInput = document.querySelector('input');

searchbar.addEventListener('search', function () {
  window.location.href = `index.html?tag=${searchInput.value}`;
});
