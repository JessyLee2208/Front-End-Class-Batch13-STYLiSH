import api from './api.js';
import common from './common.js';

const FbSDK = api.FbSDK;
common.searchEvent();
common.controlSearchBar();

const logoutButtom = document.querySelector('.logout');
const userInfoDom = {
  name: document.querySelector('.userName'),
  email: document.querySelector('.userEmail'),
  photo: document.querySelector('.photo')
};

let fbSDKforProfile = new FbSDK(() => {
  fbSDKforProfile.getLoginStatus().then((response) => {
    fbSDKforProfile.handleLoginStatus(response).then((data) => {
      userInfoDom.name.innerHTML = data.data.user.name;
      userInfoDom.email.innerHTML = data.data.user.email;
      userInfoDom.photo.src = `${data.data.user.picture}`;
    });
  });
});

logoutButtom.addEventListener('click', () => {
  window.FB.logout(function () {
    userInfoDom.name.innerHTML = '';
    userInfoDom.email.innerHTML = '';
    userInfoDom.photo.src = '';
    window.location.href = 'index.html';
  });
});
(function () {
  const carVar = document.querySelector('.count');
  if (JSON.parse(localStorage.getItem('wishList')) === null) {
    carVar.innerHTML = 0;
  } else {
    carVar.innerHTML = JSON.parse(localStorage.getItem('wishList')).length;
  }
})();
