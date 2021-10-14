let cartTable = document.querySelector(".cart__table tbody");

// Load giỏ hàng
const loadCartItems = () => {
  if (window.location.pathname !== "/cart.html") return;

  let cartItems = getCartItems();
  let cartMain = document.querySelector(".cart__main");

  // Nếu cartItems trong local storage không tồn tại hoặc rỗng thì hiển thị trang giỏ hàng rỗng
  if (!cartItems || cartItems.length === 0) {
    let cartNextBtn = document.querySelector(".cart__next-btn");
    cartNextBtn.classList.add("disabled");

    let cartDesc = document.createElement("p");
    cartDesc.classList.add("text-center", "fs-2", "py-5");
    cartDesc.textContent = '"Hổng" có gì trong giỏ hết, lựa hàng ngay đi!';
    cartMain.appendChild(cartDesc);
  } else {
    renderCart(cartItems); // Render giỏ hàng trong gi
    handleCartItemQty(cartItems); // Xử lí hiển thị số lượng sản phẩm trong giỏ hàng trên header
    handleDeletCartItem(cartItems); // Xử lí xóa sản phẩm trong giỏ hàng
  }

  handleCartPayment(calcTotalPayment(cartItems));
};

// Render cart item
const renderCart = (cartItems) => {
  let htmls = cartItems.map((item) => {
    return `
      <tr class='cart-item__row'>
          <td>
            <img src="./assets/images/${item.img}" alt="${item.imgAlt}">
          </td>
          <td>
            <p class="cart-item__name">${item.name}</p>
          </td>
          <td>
            <h4 class="cart-item__price price">${parseInt(
              item.price
            ).toLocaleString("vi-VN")}</h4>
          </td>
          <td>
            <input class="cart-item__qty" type="number" min=1 value="${
              item.inCart
            }">
          </td>
          <td>
            <h4 class="cart-item__total price">${(
              item.price * item.inCart
            ).toLocaleString("vi-VN")}</h4>
          </td>
          <td>
            <em class="cart-item__remove p-4 far fa-trash-alt"></em>
          </td>
      </tr>
      `;
  });

  cartTable.innerHTML = htmls.join("");
};

// Xử lí hiển thị số lượng sản phẩm trong giỏ hàng trên header
const handleCartItemQty = (cartItems) => {
  let cartItemQties = document.querySelectorAll(".cart-item__qty");
  let cartItemTotals = document.querySelectorAll(".cart-item__total");

  for (let i = 0; i < cartItemQties.length; i++) {
    cartItemQties[i].onchange = () => {
      // If user change qty of cart item less than 1, return 1
      if (cartItemQties[i].value <= 0) {
        cartItemQties[i].value = 1;
      }

      // If user change qty of cart item greater than 1, handle the event
      cartItems[i].inCart = parseInt(cartItemQties[i].value);

      let productTotal = cartItemQties[i].value * cartItems[i].price;
      cartItemTotals[i].textContent = productTotal.toLocaleString("vi-VN");

      localStorage.setItem("cart", JSON.stringify(cartItems));
      handleCartPayment(calcTotalPayment(cartItems));
    };
  }
};

// Tính tổng số tiền thanh toán trong giỏ hàng
const calcTotalPayment = (cartItems) => {
  return cartItems
    ? cartItems.reduce((result, item) => {
        return result + parseInt(item.price) * parseInt(item.inCart);
      }, 0)
    : 0;
};

// Xử lí render tổng số tiền và lưu vào local storage
const handleCartPayment = (param) => {
  if (param !== 0) {
    let cartPayment = document.querySelector(".cart__payment");
    let html = `<p class='price text-end fs-1 pt-5'>Tổng thanh toán: ${param.toLocaleString(
      "vi-VN"
    )}</p>`;
    cartPayment.innerHTML = html;
  }

  localStorage.setItem("totalPayment", JSON.stringify(param));
};

// Xử lí xóa sản phẩm trong giỏ hàng
const handleDeletCartItem = (cartItems) => {
  let cartItemDelBtns = document.querySelectorAll(".cart-item__remove");
  let cartItemRows = document.querySelectorAll(".cart-item__row");
  for (let i = 0; i < cartItemDelBtns.length; i++) {
    cartItemDelBtns[i].addEventListener("click", () => {
      // Hiển thị popup xác nhận xóa sản phẩm
      showDeleteConfirm(cartItems[i]);

      // Đồng ý xóa sản phẩm trong giỏ hàng
      let closePopupBtn = document.querySelector(".popup__close");
      let delConfirmBtn = document.querySelector(".delete-confirm-btn");
      delConfirmBtn.onclick = () => {
        cartItemRows[i].remove();
        cartItems.splice(i, 1);
        closePopupBtn.checked = true;

        let productNumbers = parseInt(localStorage.getItem("cartNumbers"));
        localStorage.setItem("cartNumbers", productNumbers - 1);
        localStorage.setItem("cart", JSON.stringify(cartItems));

        if (cartItems.length === 0) {
          document.querySelector(".cart__payment p").remove();
        }
        onLoadCartNumbers(); // Thay đổi số hiển thị số lượng sản phẩm trong giỏ trên header
        loadCartItems(); // Load giỏ hàng
      };
    });
  }
};

// Hiển thị popup xác nhận xóa sản phẩm
const showDeleteConfirm = (cartItem) => {
  let cartDeletionModal = document.querySelector(".cart__deletion-modal");
  let html = `
    <input class="popup__close" id="popupClose" type="checkbox">
    <div class="popup__container">
      <div class="popup__block">
        <label class="close-icon" for="popupClose"></label>
        <div class="row">
          <div class="col-lg-4 d-none d-lg-block">
            <div class="popup__img"><img src="./assets/images/${cartItem.img}" alt=${cartItem.imgAlt}></div>
          </div>
          <div class="col-12 col-lg-8">
            <div class="popup__content">
              <h3 class="display-5 text-center">Bạn muốn xoá sản phẩm này?</h3>
              <p class="fs-3">Vui lòng xác nhận xóa sản phẩm <span class="popup__product-name">${cartItem.name}</span> khỏi giỏ hàng</p>
              <button class="button delete-confirm-btn">Đồng ý</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  cartDeletionModal.innerHTML = html;
};
