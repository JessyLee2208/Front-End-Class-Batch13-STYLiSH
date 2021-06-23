// import common from './common.js';

let stylishAccessToken;

// eslint-disable-next-line no-unused-vars
class Tag {
  constructor() {
    this.tag = new URLSearchParams(window.location.search).get('tag');
    this.paging = new URLSearchParams(window.location.search).get('paging');
    this.getSearchVar = new URLSearchParams(window.location.search).get('keyword');
    this.idNum = new URLSearchParams(window.location.search).get('id');
    this.number = new URLSearchParams(window.location.search).get('number');
  }
  getTag() {
    return this.tag === null ? 'all' : this.tag;
  }
  getPaging() {
    return this.paging === null ? '0' : this.paging;
  }
  getId() {
    return this.idNum;
  }

  getNumber() {
    return this.number;
  }

  setTag(tag) {
    this.tag = tag;
  }
  setPaging(paging) {
    this.paging = paging;
  }
  setId(idNum) {
    this.idNum = idNum;
  }

  isPredefinedTag() {
    if (
      this.tag === 'men' ||
      this.tag === 'women' ||
      this.tag === 'accessories' ||
      this.tag === 'all' ||
      this.tag === null
    ) {
      return true;
    }
    return false;
  }
}
class ApiList {
  constructor() {
    this.host_name = 'https://api.appworks-school.tw/api/1.0';
  }
  async getProducts(tag, paging) {
    const products = await fetch(`${this.host_name}/products/${tag}?paging=${paging}`);
    return await products.json();
  }
  async getSearch(tag, paging) {
    const searchs = await fetch(`${this.host_name}/products/search?keyword=${tag}&paging=${paging}`);
    return await searchs.json();
  }
  async getCampaigns() {
    const banneres = await fetch(`${this.host_name}/marketing/campaigns`);
    return await banneres.json();
  }
  async getProductDerail(idNum) {
    const productDetail = await fetch(`${this.host_name}/products/details?id=${idNum}`);
    return await productDetail.json();
  }
  async getUserProfile(response) {
    const userData = await fetch(`${this.host_name}/user/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'facebook',
        access_token: `${response}`
      })
    });

    return await userData.json();
  }
  async checkOut(paymentInfor) {
    if (!stylishAccessToken) {
      alert('請先登入');
    }
    const userData = await fetch(`${this.host_name}/order/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${stylishAccessToken}`
      },
      body: JSON.stringify(paymentInfor)
    });

    if (403 === userData) {
      alert('請先登入');
    }

    return await userData.json();
  }
}
let api = new ApiList();

class FbSDK {
  constructor(callback) {
    window.fbAsyncInit = this.fbinit.bind(this);
    this.callback = callback;
    this.SDK();
    this.stylishAccessToken = undefined;
  }

  SDK() {
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/zh_TW/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }

  fbinit() {
    window.FB.init({
      appId: '763071177743836',
      cookie: true,
      xfbml: true,
      version: 'v10.0'
    });
    this.callback();
  }

  getLoginStatus() {
    return new Promise((res) => {
      window.FB.getLoginStatus((response) => {
        res(response);
      });
    });
  }
  handleLoginStatus(response) {
    console.log(response);
    if (response.status === 'connected') {
      return api.getUserProfile(response.authResponse.accessToken).then((data) => {
        stylishAccessToken = data.data.access_token;
        return data;
      });
    } else {
      this.login();
      return Promise.resolve(1);
    }
  }
  login() {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          this.handleLoginStatus(response);
        }
      },
      { scope: 'public_profile,email' }
    );
  }
}

let fbSDK = new FbSDK(() => {
  fbSDK.getLoginStatus();
});

function loginEvent() {
  const loginButtom = document.querySelector('.login');
  loginButtom.addEventListener('click', () => {
    fbSDK.getLoginStatus().then((response) => {
      if (response.authResponse) {
        window.location.href = 'profile.html';
      } else {
        fbSDK.handleLoginStatus(response);
      }
    });
  });
}

export default { Tag, ApiList, FbSDK, loginEvent };
