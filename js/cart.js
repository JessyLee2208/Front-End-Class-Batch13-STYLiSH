import common from './common.js';
import api from './api.js';
api.loginEvent();
common.searchEvent();
common.controlSearchBar();

const FbSDK = api.FbSDK;
let fbSDK = new FbSDK(() => {
  fbSDK.getLoginStatus();
});

const cartList = JSON.parse(localStorage.getItem('wishList'));

let subtotalArray = [];
let Freight = 60;
let cardPrime;
let newCartList;
(function createCartListToHTML() {
  if (cartList !== null) {
    cartList.forEach((item, index) => {
      const carListItem = document.querySelector('.carListItem');
      const itemDetail = document.createElement('div');
      itemDetail.classList = 'itemDetail';
      carListItem.appendChild(itemDetail);

      let itemSubtotal = item.price * item.qty.select;
      subtotalArray.push(itemSubtotal);

      itemDetail.innerHTML = `
            <div class="productDetail">
            <img class="mainimg" src="${item.mainImg}">
            <div class="declarer">
                <p class="title">${item.name}</p>
                <p class="id">${item.id}</p>
                <p class="color">顏色｜${item.color.name}</p>
                <p class="size">尺寸｜${item.size}</p>
            </div>
            </div>
            <div class="productDetail">
                <div class="select">
                    <label for="qty">數量</label>
                    <select name="qty" class="qty">
                    </select>
    
                </div>
                <div class="price">
                    <label for="price">單價</label><p class="price">NT.${item.price}</p>
                </div>
                <div class="subtotal">
                    <label for="subtotal">小計</label><p class="subtotalNum">NT.${itemSubtotal}</p>
                </div>
            </div>
            <div class="removeicon" id="${index}">
                <img class="icon" " src="img/cart-remove.png">
            </div>
            `;
      const removeicon = carListItem.querySelector('.removeicon');
      removeicon.id = item.id;

      let newQtyArray = [];

      for (let i = 1; i <= item.qty.stock; i++) {
        newQtyArray.push(i);
      }
      newQtyArray.forEach((qty, index) => {
        const qtySelect = itemDetail.querySelector('.qty');
        const selectOption = document.createElement('option');
        selectOption.text = `${qty}`;
        selectOption.value = `${qty}`;
        qtySelect.appendChild(selectOption);

        if (index === item.qty.select - 1) {
          selectOption.selected = 'selected';
        }
      });
    });
  }
})();
class CheckOutAPIRequestBody {
  constructor() {
    this.reconsitutionCartList();
  }
  setAll() {
    const recipients = document.getElementById('recipients').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const phoneNum = document.getElementById('phoneNum').value;

    const timeRadios = document.querySelectorAll('input[name="time"]');
    const nodelistToArray = Array.apply(null, timeRadios);
    let time = nodelistToArray.find((check) => check.checked).id;

    this.paymentInfo = {
      prime: cardPrime,
      order: {
        shipping: 'delivery',
        payment: 'credit_card',
        subtotal: eventListener.sum,
        freight: Freight,
        total: eventListener.totalSum,
        recipient: {
          name: recipients,
          phone: phoneNum,
          email: email,
          address: address,
          time: time
        },
        list: this.reconsitutionCartList()
      }
    };
  }
  reconsitutionCartList() {
    newCartList = [];
    cartList.forEach((item) => {
      const list = {
        id: item.id,
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size,
        qty: item.qty.select
      };
      newCartList.push(list);
    });

    return newCartList;
  }
}

class EventListener {
  constructor() {
    this.sum;
    this.totalSum;

    this.deleteItem(), this.changeItemQty(), this.summaryCalculate(), this.defaultDisplay(), this.submitEvent();
  }

  deleteItem() {
    let removeIcons = document.querySelectorAll('.removeicon');
    const carListItem = document.querySelector('.carListItem');
    const itemDetail = document.querySelectorAll('.itemDetail');

    removeIcons.forEach((remove, index) => {
      let itemColor = cartList[index].color.code;
      let itemId = cartList[index].id;
      let itemSize = cartList[index].size;

      remove.addEventListener('click', () => {
        let checkCarItem = cartList.findIndex(
          (t) => t.id === itemId && t.color.code === itemColor && t.size === itemSize
        );

        cartList.splice(checkCarItem, 1);

        itemDetail[index].style.display = 'none';
        carListItem.removeChild(itemDetail[index]);

        common.addCarSnackbarControl();
        localStorage.setItem('wishList', JSON.stringify(cartList));

        this.defaultDisplay();
        this.summaryCalculate();
      });
    });
  }
  changeItemQty() {
    const itemSelects = document.querySelectorAll('.qty');
    const subtotal = document.querySelectorAll('.subtotalNum');

    itemSelects.forEach((item, index) => {
      let itemColor = cartList[index].color.code;
      let itemId = cartList[index].id;
      let itemSize = cartList[index].size;

      item.addEventListener('change', () => {
        let checkSelectItem = cartList.findIndex(
          (t) => t.id === itemId && t.color.code === itemColor && t.size === itemSize
        );

        item.selected = 'selected';
        let itemSubtotal = cartList[checkSelectItem].price * item.value;

        cartList[checkSelectItem].qty.select = item.value;

        subtotal[checkSelectItem].innerHTML = `NT.${itemSubtotal}`;
        localStorage.setItem('wishList', JSON.stringify(cartList));
        this.summaryCalculate();
      });
    });
  }
  summaryCalculate() {
    const allPriceDOM = {
      summary: document.querySelector('.amount'),
      summaryTotal: document.querySelector('.amount_total'),
      summaryFreight: document.querySelector('.amount_freight'),
      listNum: document.querySelector('.listNum')
    };

    if (cartList === null || cartList.length === 0) {
      allPriceDOM.summaryFreight.innerHTML = `0`;
      this.sum = 0;
      allPriceDOM.listNum.innerHTML = ` (0)`;
      this.totalSum = 0;
    } else {
      subtotalArray = [];
      cartList.forEach((item) => {
        let itemSubtotal = item.price * item.qty.select;
        subtotalArray.push(itemSubtotal);
      });
      allPriceDOM.summaryFreight.innerHTML = `${Freight}`;
      this.sum = subtotalArray.reduce((acc, cur) => acc + cur);
      allPriceDOM.listNum.innerHTML = ` (${cartList.length})`;
      this.totalSum = this.sum + Freight;
    }
    allPriceDOM.summary.innerHTML = this.sum;
    allPriceDOM.summaryTotal.innerHTML = this.totalSum;
  }

  defaultDisplay() {
    const carVar = document.querySelector('.count');
    const payButtom = document.querySelector('.pay');

    if (
      JSON.parse(localStorage.getItem('wishList')) === null ||
      JSON.parse(localStorage.getItem('wishList')).length === 0
    ) {
      carVar.innerHTML = 0;
      const carListItem = document.querySelector('.carListItem');
      const itemDetail = document.createElement('div');
      itemDetail.innerHTML = '</br></br><p>  &nbsp&nbsp&nbsp&nbsp購物車空空如也~~~</p></br></br>';
      carListItem.appendChild(itemDetail);
      payButtom.disabled = true;
      payButtom.classList.add('pay-disable');
    } else {
      carVar.innerHTML = JSON.parse(localStorage.getItem('wishList')).length;
      payButtom.disabled = false;
      payButtom.classList.remove('pay-disable');
    }
  }
  submitEvent() {
    const payButtom = document.querySelector('.pay');

    payButtom.addEventListener('click', () => {
      sendFormDataToAPI(event);
    });
  }
}

let eventListener = new EventListener();

function sendFormDataToAPI(event) {
  const tappayStatus = window.TPDirect.card.getTappayFieldsStatus();

  let inputCkeck = new InputCkeck();
  inputCkeck.putValueToFunction();
  inputCkeck.tapPayCheck(event);

  if (tappayStatus.canGetPrime === false) {
    return;
  }

  window.TPDirect.card.getPrime((result) => {
    cardPrime = result.card.prime;
    let checkOutAPIRequestBody = new CheckOutAPIRequestBody();

    // eslint-disable-next-line no-undef
    fbSDK.getLoginStatus().then((response) => {
      if (response.authResponse) {
        loddingAnimate();
        catrApi.checkOut(checkOutAPIRequestBody.paymentInfo).then((res) => {
          while (cartList.length) {
            cartList.pop();
          }
          localStorage.setItem('wishList', JSON.stringify(cartList));
          window.location.href = `thankyou.html?number=${res.data.number}`;
        });

      } else {

        const snackbarContext = document.querySelector('.snackbar-content');
        snackbarContext.innerHTML = `請先登入會員`;
        common.addCarSnackbarControl();
      }
    });

    checkOutAPIRequestBody.setAll();

  });
}

function loddingAnimate() {
  let dialog = document.querySelector('.dialog');

  dialog.classList.add('show');
  const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');
  const body = document.body;
  body.style.height = '100vh';
  body.style.overflowY = 'hidden';

  window.addEventListener('scroll', () => {
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
  });
}
const ApiList = api.ApiList;
// eslint-disable-next-line no-undef
let catrApi = new ApiList();

let fields = {
  number: {
    element: '#card-number',
    placeholder: '**** **** **** ****'
  },
  expirationDate: {
    element: document.getElementById('card-expiration-date'),
    placeholder: 'MM / YY'
  },
  ccv: {
    element: '#card-ccv',
    placeholder: '後三碼'
  }
};

window.TPDirect.card.setup({
  fields: fields,
  styles: {
    input: {
      color: 'gray'
    },
    '.valid': {
      color: 'green'
    },
    '.invalid': {
      color: 'red'
    },
    '@media screen and (max-width: 400px)': {
      input: {
        color: 'orange'
      }
    }
  }
});
(function tapPayUpdata() {
  window.TPDirect.card.onUpdate(function (update) {
    const cardNumberErrornote = document.querySelector('.email-cardNumber');
    const expirationErrornote = document.querySelector('.card-expiration-date');
    const ccvErrornote = document.querySelector('.card-ccv');
    const cardNumber = document.getElementById('card-number');
    const recipientsNumber = document.getElementById('card-expiration-date');
    const ccvNumber = document.getElementById('card-ccv');

    if (update.status.number === 2) {
      cardNumber.style.border = 'solid 1px red';
    } else if (update.status.number === 0) {
      cardNumber.style.border = 'solid 1px #979797';
      cardNumberErrornote.classList.remove('active');
    }

    if (update.status.expiry === 2) {
      recipientsNumber.style.border = 'solid 1px red';
    } else if (update.status.expiry === 0) {
      recipientsNumber.style.border = 'solid 1px #979797';
      expirationErrornote.classList.remove('active');
    }

    if (update.status.ccv === 2) {
      ccvNumber.style.border = 'solid 1px red';
    } else if (update.status.ccv === 0) {
      ccvNumber.style.border = 'solid 1px #979797';
      ccvErrornote.classList.remove('active');
    }
  });

  window.TPDirect.card.getTappayFieldsStatus();
})();

class InputCkeck {
  constructor() {
    this.recipientsErrornote = document.querySelector('.recipients-errornote');
    this.emailErrornote = document.querySelector('.email-errornote');
    this.phoneNumErrornote = document.querySelector('.phoneNum-errornote');
    this.addressErrornote = document.querySelector('.address-errornote');

    this.recipients = document.getElementById('recipients');
    this.email = document.getElementById('email');
    this.phoneNum = document.getElementById('phoneNum');
    this.address = document.getElementById('address');

    this.emailCheckRule = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9])+$/;
    this.phoneCheck = /((?=(09))[0-9]{10})$/;

    this.direct = 'solid 1px #979797';
    this.error = 'solid 1px red';

    this.formValue = [
      {
        d: this.recipients,
        note: this.recipientsErrornote,
        method: this.recipients.value === ''
      },
      {
        d: this.email,
        note: this.emailErrornote,
        method: this.emailCheckRule.exec(this.email.value) === null
      },
      {
        d: this.phoneNum,
        note: this.phoneNumErrornote,
        method: this.phoneNum.value.match(this.phoneCheck) === null
      },
      {
        d: this.address,
        note: this.addressErrornote,
        method: this.address.value === ''
      }
    ];
  }

  putValueToFunction() {
    this.formValue.forEach((value) => {
      this.formCheck(value.d, value.note, value.method);
    });
  }

  formCheck(d, note, method) {
    if (method) {
      d.focus();
      d.style.border = this.error;
      note.classList.add('active');
      this.formEvent(d, note, method);
      return false;
    } else {
      note.classList.remove('active');
      d.style.border = this.direct;
      return true;
    }
  }

  formEvent(d, note, method) {
    // eslint-disable-next-line no-unused-vars
    d.addEventListener('change', (remove) => {
      if (method) {
        d.style.border = this.direct;
        note.classList.remove('active');
        // eslint-disable-next-line no-unused-vars
        d.removeEventListener('change', (remove) => {});
      }
    });
  }

  tapPayCheck(event) {
    event.preventDefault();
    const tappayStatus = window.TPDirect.card.getTappayFieldsStatus();

    const cardNumberErrornote = document.querySelector('.email-cardNumber');
    const expirationErrornote = document.querySelector('.card-expiration-date');
    const ccvErrornote = document.querySelector('.card-ccv');
    const cardNumber = document.getElementById('card-number');
    const recipientsNumber = document.getElementById('card-expiration-date');
    const ccvNumber = document.getElementById('card-ccv');

    // eslint-disable-next-line no-unused-vars
    let inputCkeck = new InputCkeck();

    if (tappayStatus.status.number === 1) {
      cardNumber.style.border = 'solid 1px red';
      cardNumberErrornote.classList.add('active');
    }

    if (tappayStatus.status.expiry === 1) {
      recipientsNumber.style.border = 'solid 1px red';
      expirationErrornote.classList.add('active');
    }

    if (tappayStatus.status.ccv === 1) {
      ccvNumber.style.border = 'solid 1px red';
      ccvErrornote.classList.add('active');
    }

    if (tappayStatus.canGetPrime === false) {
      return;
    }
  }
}
