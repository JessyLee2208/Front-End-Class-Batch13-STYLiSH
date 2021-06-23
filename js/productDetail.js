import common from './common.js';
import api from './api.js';

const Tag = api.Tag;
const ApiList = api.ApiList;
api.loginEvent();
common.searchEvent();
common.controlSearchBar();

// eslint-disable-next-line no-undef
const tag = new Tag();
// eslint-disable-next-line no-undef
const apiList = new ApiList();

let maxQuantity;
const minQuantity = 1;
let count = 1;

const addcar = document.querySelector('.addcar');

let selectSize;
let selectColor;
let selectColorName;

class ProductDetailRender {
  renderVariantDefault(data) {
    const colors = document.querySelectorAll('.color');
    const sizes = document.querySelectorAll('.size');
    colors[0].classList.add('active');
    sizes[0].classList.add('active');

    selectColor = colors[0].id;
    selectSize = sizes[0].id;
    this.renderSizeDisable(data, selectColor);
    this.renderSizeActive(data, selectColor, selectSize);
  }

  renderSizeActive(data, color, size) {
    const sizes = document.querySelectorAll('.size');
    sizes.forEach((size) => {
      size.classList.remove('active');
    });

    if (data.variants.find((s) => s.color_code === color && s.size === size).stock !== 0) {
      const sizeDiv = document.getElementById(size);
      sizeDiv.classList.remove('disable');
      sizeDiv.classList.add('active');
      maxQuantity = data.variants.find((s) => s.color_code === color && s.size === size).stock;
    } else {
      const active = data.variants.find((s) => s.color_code === color && s.stock !== 0).size;
      const sizeDiv = document.getElementById(active);
      sizeDiv.classList.add('active');
      selectSize = sizeDiv.id;
    }
  }

  renderSizeDisable(data, color) {
    const colorDiv = document.getElementById(color);
    const sizes = document.querySelectorAll('.size');
    const disableArray = data.variants.filter((s) => s.color_code === colorDiv.id && s.stock === 0);

    if (disableArray.length !== 0) {
      disableArray.forEach((disable) => {
        const sizeDiv = document.getElementById(disable.size);

        sizeDiv.classList.add('disable');
      });
    } else {
      sizes.forEach((s) => {
        s.classList.remove('disable');
      });
    }
  }
}
const productDetailRender = new ProductDetailRender();

class EventListener {
  constructor() {
    this.quantityComputation();
    this.addCar();
    this.showCarNum();
    // this.searchEvent();
  }

  clickListener(data) {
    const colors = document.querySelectorAll('.color');
    const sizes = document.querySelectorAll('.size');
    const incrementBtn = document.querySelector('.increment');

    colors.forEach((color) => {
      color.addEventListener('click', () => {
        selectColor = color.id;
        count = minQuantity;
        incrementBtn.style.color = 'black';

        wishList.setWishListColor(color.name, selectColor);

        this.updateCountDisplay();
        wishList.setQuantity(count, maxQuantity);

        colors.forEach((color) => {
          color.classList.remove('active');
        });
        color.classList.add('active');

        productDetailRender.renderSizeActive(data, selectColor, selectSize);
        productDetailRender.renderSizeDisable(data, selectColor);
      });
    });
    sizes.forEach((size) => {
      size.addEventListener('click', () => {
        count = minQuantity;
        incrementBtn.style.color = 'black';

        this.updateCountDisplay();

        productDetailRender.renderSizeDisable(data, selectColor);
        if (size.className !== 'size disable') {
          selectSize = size.id;
          productDetailRender.renderSizeActive(data, selectColor, size.id);
        }
        wishList.setWishListSize(selectSize);
      });
    });
  }

  quantityComputation() {
    const decrementBtn = document.querySelector('.decrement');
    const incrementBtn = document.querySelector('.increment');

    incrementBtn.addEventListener('click', () => {
      decrementBtn.style.color = 'black';
      if (count === maxQuantity) {
        incrementBtn.style.color = 'lightgray';
        const snackbarContext = document.querySelector('.snackbar-content');
        snackbarContext.innerHTML = `此商品目前庫存為 ${maxQuantity} 件`;
        common.addCarSnackbarControl();
      } else {
        if (count >= minQuantity && count < maxQuantity) {
          count++;
          this.updateCountDisplay();
          wishList.setQuantity(count, maxQuantity);
        } else {
          count = maxQuantity;
        }
      }
    });
    decrementBtn.addEventListener('click', () => {
      incrementBtn.style.color = 'black';
      if (count === minQuantity) {
        decrementBtn.style.color = 'lightgray';
      } else {
        if (count <= maxQuantity && count > minQuantity) {
          decrementBtn.style.color = 'black';
          count--;
          this.updateCountDisplay();
          wishList.setQuantity(count, maxQuantity);
        } else {
          count = minQuantity;
        }
      }
    });
  }

  updateCountDisplay() {
    const counterDisplay = document.querySelector('.num');
    counterDisplay.innerHTML = count;
  }

  addCar() {
    addcar.addEventListener('click', () => {
      const carVar = document.querySelector('.count');
      this.upDateCart();
      carVar.innerHTML = JSON.parse(localStorage.getItem('wishList')).length;
      common.addCarSnackbarControl();
    });
  }

  upDateCart() {
    const carList = JSON.parse(localStorage.getItem('wishList')) || [];
    const checkCarItem = carList.findIndex(
      (t) =>
        t.id === wishList.wishList.id &&
        t.color.code === wishList.wishList.color.code &&
        t.size === wishList.wishList.size
    );

    if (checkCarItem === -1) {
      carList.push(wishList.wishList);
      localStorage.setItem('wishList', JSON.stringify(carList));
    } else {
      carList[checkCarItem] = wishList.wishList;
      localStorage.setItem('wishList', JSON.stringify(carList));
    }
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

class WishList {
  setAll(ProductDetaildata) {
    this.wishList = {
      id: `${ProductDetaildata.id}`,
      name: `${ProductDetaildata.title}`,
      price: `${ProductDetaildata.price}`,
      color: {
        name: selectColorName,
        code: selectColor
      },
      size: selectSize,
      qty: {
        select: count,
        stock: maxQuantity
      },
      mainImg: `${ProductDetaildata.main_image}`
    };
  }

  setWishListColor(colorName, colorCode) {
    this.wishList.color.name = colorName;
    this.wishList.color.code = colorCode;
  }

  setWishListSize(size) {
    this.wishList.size = size;
  }

  setQuantity(select, stock) {
    this.wishList.qty.select = select;
    this.wishList.qty.stock = stock;
  }
}
const wishList = new WishList();
const eventListener = new EventListener();

async function appendProductDetail() {
  const productDetail = await apiList.getProductDerail(tag.getId());

  createProductDetailToHTML(productDetail.data);

  const getQuantityData = productDetail.data.variants;
  const colors = document.querySelectorAll('.color');
  const sizes = document.querySelectorAll('.size');

  selectColorName = colors[0].name;
  selectColor = colors[0].id;
  selectSize = sizes[0].id;

  maxQuantity = getQuantityData[0].stock;

  wishList.setAll(productDetail.data);
  productDetailRender.renderVariantDefault(productDetail.data);
  eventListener.clickListener(productDetail.data);
}

appendProductDetail();
eventListener.updateCountDisplay();

// count

function createProductDetailToHTML(ProductDetaildata) {
  const mainImage = document.querySelector('.mainimg');
  const productTitle = document.querySelector('.product-title');
  const productId = document.querySelector('.product-id');
  const productPrice = document.querySelector('.product-price');
  const colorBox = document.querySelector('.colorbox');
  const sizeBox = document.querySelector('.sizebox');
  const productDescription = document.querySelector('.product-detail-description');
  const description = document.querySelector('.detail-description');
  const imgBox = document.querySelector('.images');
  const productListTitle = document.querySelector('.productList-title');

  productListTitle.innerHTML = `${ProductDetaildata.title} - STYLiSH 2021`;
  mainImage.src = `${ProductDetaildata.main_image}`;
  productTitle.innerHTML = `${ProductDetaildata.title}`;
  productId.innerHTML = `${ProductDetaildata.id}`;
  productPrice.innerHTML = `TWD. ${ProductDetaildata.price}`;

  productDescription.innerHTML = `${ProductDetaildata.note}\n\n${ProductDetaildata.texture}\n${ProductDetaildata.description}\n\n清洗：${ProductDetaildata.wash}\n產地：${ProductDetaildata.place}`;

  description.innerHTML = `TWD. ${ProductDetaildata.story}`;

  ProductDetaildata.colors.forEach((color) => {
    const colorDiv = document.createElement('div');

    colorDiv.className = 'color';
    colorDiv.style.background = `#${color.code}`;
    colorDiv.id = `${color.code}`;
    colorDiv.name = `${color.name}`;

    colorBox.appendChild(colorDiv);
  });

  ProductDetaildata.sizes.forEach((size) => {
    const sizesDiv = document.createElement('div');
    sizesDiv.className = 'size';
    sizesDiv.innerHTML = size;
    sizesDiv.id = `${size}`;
    sizeBox.appendChild(sizesDiv);
  });

  ProductDetaildata.images.forEach((img) => {
    const imgDiv = document.createElement('img');
    imgDiv.className = 'image';
    imgDiv.src = `${img}`;
    imgBox.appendChild(imgDiv);
  });
}
