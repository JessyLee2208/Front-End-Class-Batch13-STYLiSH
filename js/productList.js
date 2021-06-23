import api from './api.js';

const Tag = api.Tag;
const ApiList = api.ApiList;
api.loginEvent();

// eslint-disable-next-line no-undef
const tag = new Tag();
// eslint-disable-next-line no-undef
const apiList = new ApiList();

let tickingHeight = false;
let pageHeight = 130;

class EventList {
  constructor() {
    this.index = 1;
    this.pageScrollListener(), this.searchClickListener(), this.logoTag(), this.showCarNum();
  }

  pageScrollListener() {
    window.addEventListener('scroll', async function () {
      let height = document.body.getBoundingClientRect().bottom - window.innerHeight;

      if (!tickingHeight && height < pageHeight && tag.getPaging() !== 0 && tag.getPaging() !== undefined) {
        tickingHeight = true;
        appendProducts();
      }
    });
  }

  searchClickListener() {
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
  logoTag() {
    const logoTag = document.querySelector('.logo');
    logoTag.addEventListener('click', () => {
      removeProduct();
      appendProducts();
    });
  }

  bannerLoop() {
    this.bannerArry = document.querySelectorAll('.bannerBox');
    this.dotArry = document.querySelectorAll('.dot');

    this.timer = setInterval(() => {
      this.index = this.index === this.bannerArry.length ? this.index - this.bannerArry.length : this.index;
      this.bannerArry[this.index].classList.add('bannerBox-active');
      this.dotArry[this.index].classList.add('active');

      if (this.index == 0) {
        this.bannerArry[this.index - 1 + this.bannerArry.length].classList.remove('bannerBox-active');
        this.dotArry[this.index - 1 + this.bannerArry.length].classList.remove('active');
      } else {
        this.bannerArry[this.index - 1].classList.remove('bannerBox-active');
        this.dotArry[this.index - 1].classList.remove('active');
      }

      this.index = this.index + 1;
    }, 2000);
  }
  dotClick() {
    this.dotArry.forEach((dot) => {
      dot.addEventListener('click', () => {
        clearInterval(this.timer);
        this.index = parseInt(dot.id) + 1;

        for (let i = 0; i < this.bannerArry.length; i++) {
          this.dotArry[i].classList.remove('active');
          this.bannerArry[i].classList.remove('bannerBox-active');
        }

        this.dotArry[this.index - 1].classList.add('active');
        this.bannerArry[this.index - 1].classList.add('bannerBox-active');

        if (this.index == this.bannerArry.length) {
          this.index = 0;
        }
        this.bannerLoop();
      });
    });
  }

  showCarNum() {
    const carVar = document.querySelector('.count');
    if (JSON.parse(localStorage.getItem('wishList')) === null) {
      carVar.innerHTML = 0;
    } else {
      carVar.innerHTML = JSON.parse(localStorage.getItem('wishList')).length;
    }
  }
}

const eventListener = new EventList();
appendProducts();
appendCampaigns();

async function appendProducts() {
  tagCheck();
  let data =
    tag.isPredefinedTag() === true
      ? await apiList.getProducts(tag.getTag(), tag.getPaging())
      : await apiList.getSearch(tag.getTag(), tag.getPaging());

  tag.setPaging(data.next_paging);
  createProductHTML(data.data);
  tickingHeight = false;
}

function createProductHTML(data) {
  window.requestAnimationFrame(function () {
    if (data.length > 0) {
      data.forEach((product) => {
        const productList = document.createElement('a');
        const main_content = document.querySelector('.main-content');
        main_content.appendChild(productList);
        productList.className = 'product';
        productList.href = `product.html?id=${product.id}`;

        productList.innerHTML = `
                      <div class="new-tag"><p class="description">新品</p></div>
                      <img class='product-img' src="${product.main_image}" alt="${product.title}">
                      <div class="product-colors"></div>
                      <div class="product-description">${product.title}</div>
                      <div class="product-price">TWD.${product.price}</div>
                  `;

        product.colors.forEach(function (Color) {
          const newDiv = document.createElement('div');
          const productColors = productList.querySelector('.product-colors');

          newDiv.className = 'product-color';
          newDiv.style.background = `#${Color.code}`;

          productColors.appendChild(newDiv);
        });
      });

      tickingHeight = false;
    } else {
      const productList = document.createElement('div');
      const main_content = document.querySelector('.main-content');
      main_content.appendChild(productList);
      productList.className = 'product';
      productList.innerHTML = `<h2>沒有搜尋到任何產品<h2>`;
      productList.style.textAlign = 'center';
      productList.style.width = '100%';
    }
  });
}

const removeProduct = function () {
  let productListGit = document.getElementById('main-content');
  while (productListGit.firstChild) {
    productListGit.removeChild(productListGit.firstChild);
  }
};

function createBannerHTML(bannerdata) {
  bannerdata.forEach((banner, index) => {
    const bannerDiv = document.createElement('div');
    const dot = document.createElement('div');
    const bannerDescription = document.createElement('div');
    const bannerbox = document.createElement('a');
    const dotbox = document.querySelector('.dotbox');
    const bannerBoxAll = document.querySelector('.bannerBoxAll');

    bannerbox.appendChild(bannerDescription);
    bannerBoxAll.appendChild(bannerbox);
    dotbox.appendChild(dot);

    bannerDiv.className = 'banner';
    dot.className = 'dot';
    bannerbox.className = 'bannerBox';
    bannerDescription.className = 'bannerDescription';

    dot.id = index;
    bannerbox.href = `product.html?id=${banner.product_id}`;
    bannerDescription.textContent = `${banner.story}`;
    bannerbox.style.backgroundImage = `url(${banner.picture})`;
  });
}

async function appendCampaigns() {
  const bannerdata = await apiList.getCampaigns();
  createBannerHTML(bannerdata.data);

  const dotArry = document.querySelectorAll('.dot');
  dotArry[0].className = 'dot active';

  eventListener.bannerLoop();
  eventListener.dotClick();
}

function tagCheck() {
  const womenTag = document.querySelector('.WomenTag');
  const menTag = document.querySelector('.MenTag');
  const accessoriesTag = document.querySelector('.AccessoriesTag');

  tag.getTag() === 'women' ? womenTag.classList.add('active') : (womenTag.className += '');
  tag.getTag() === 'men' ? menTag.classList.add('active') : (menTag.className += '');
  tag.getTag() === 'accessories' ? accessoriesTag.classList.add('active') : (accessoriesTag.className += '');
}
