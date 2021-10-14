const baseUrl = "http://localhost:3000/api";
let defaultFilter = { _page: 1, _limit: 6 };
let filter = { ...defaultFilter }; // Deep copy of object
let priceSegments = [
  {
    gte: 0,
    lte: 199999,
  },
  {
    gte: 200000,
    lte: 500000,
  },
  {
    gte: 500001,
  },
];

// Lấy data sản phẩm từ API
const getProducts = async (params) => {
  if (window.location.pathname !== "/product.html") return;

  try {
    await axios
      .get(`${baseUrl}/products`, {
        params,
      })
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        const { products, pagination } = data;
        renderProduct(products);
        renderPagination(pagination);
        getProductsByPriceCategory();
        sortByPrice();
        showByLimit();
        clearAllFilter();
        onClickAddToCart(products);
      });
  } catch (error) {
    console.log(error);
  }
};

const renderProduct = (products) => {
  let productGridBlock = document.querySelector("#productsGrid .row");
  let productListBlock = document.querySelector("#productsList .row");

  // Render products Grid View
  let gridHtmls = products.map((product) => {
    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="product-block text-center">
          <div class="product-img"><img src="./assets/images/${
            product.img
          }" alt=${product.imgAlt}/>
            <div class="product-img__tag-null"></div>
            <div class="product-img__option">
              <div class="row">
                <p class="product-img__wishlist col-5 m-0">
                  <a class="text-center" href="#"><em class="fas fa-heart me-2"></em>Yêu thích</a></p>
                <p class="product-img__compare col-5 m-0">
                  <a class="text-center" href="#"><em class="fas fa-signal me-2"></em>So sánh</a></p>
                <p class="product-img__zoom-in col-2 m-0">
                  <a class="text-center" href="#"><em class="fas fa-expand-alt"></em></a></p>
              </div>
            </div>
          </div>
            <a href=${product.detailLink}>
              <h4 class="product-block__name">${product.name}</h4>
            </a>
            <span class="price product-block__price">${parseInt(
              product.price
            ).toLocaleString("vi-VN")}</span>
            <span class="price product-block__original-price">${parseInt(
              product.originPrice
            ).toLocaleString("vi-VN")}</span><br/>
            <Button class="button add-to-cart mt-4">Add to cart</Button>
        </div>
      </div>
    `;
  });

  // Render products List View
  let listHtmls = products.map((product) => {
    return `
      <div class="col-12">
        <div class="product-block product-block--list">
          <div class="row"> 
            <div class="col-12 col-sm-4">
              <div class="product-img"><img src="./assets/images/${product.img}" alt=${product.imgAlt}/></div>
            </div>
            <div class="col-12 col-sm-8 col-xl-6"><a href=${product.detailLink}>
                <h4 class="product-block__name">${product.name}</h4></a><span class="price product-block__price">370.000</span>
              <p class="desc mt-4">${product.desc}</p>
              <div class="row mt-5 px-2"><a class="col-4 button" href="#">Add to cart</a>
                <p class="col-4 product-img__wishlist m-0 text-center my-auto"><a href="#"><em class="fas fa-heart me-2"></em>Yêu thích</a></p>
                <p class="col-4 product-img__compare m-0 text-center my-auto"><a href="#"><em class="fas fa-signal me-2"></em>So sánh</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  productGridBlock.innerHTML = gridHtmls.join("");
  productListBlock.innerHTML = listHtmls.join("");
};

// Lấy data categories từ API
const getCategories = async () => {
  if (window.location.pathname !== "/product.html") return;

  try {
    await axios
      .get(`${baseUrl}/categories`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        renderCategories(data);
        getProductsByCategory();
      });
  } catch (error) {
    console.log(error);
  }
};

// Render categories
const renderCategories = (categories) => {
  let listCategoriesBlock = document.querySelector("#categoriesList ul");
  let htmls = categories.map((category) => {
    return `
      <li class="product__category-item" data-category=${category.id}>${category.name}</li>
    `;
  });

  listCategoriesBlock.innerHTML = htmls.join("");
};

// Lấy sản phẩm theo danh mục sản phẩm
const getProductsByCategory = () => {
  let categories = document.querySelectorAll(".product__category-item");

  categories.forEach((category) => {
    category.onclick = (e) => {
      let activeCategory = document.querySelector(
        ".product__category-item.active"
      );
      let categoryId = e.target.getAttribute("data-category");
      filter._page = 1;
      filter = { ...filter, categoryId: categoryId };
      if (activeCategory) activeCategory.classList.remove("active");
      category.classList.add("active");
      getProducts(filter);
    };
  });
};

// Lấy sản phẩm theo phân khúc giá tiền
const getProductsByPriceCategory = () => {
  let priceCategories = document.querySelectorAll(
    ".product__price-category-item"
  );

  priceCategories.forEach((priceCategory) => {
    priceCategory.onclick = (e) => {
      let priceCategoryId = parseInt(e.target.getAttribute("data-category"));
      filter._page = 1;

      switch (priceCategoryId) {
        case 0:
          filter = {
            ...filter,
            price_gte: priceSegments[0].gte,
            price_lte: priceSegments[0].lte,
          };
          break;
        case 1:
          filter = {
            ...filter,
            price_gte: priceSegments[1].gte,
            price_lte: priceSegments[1].lte,
          };
          break;
        case 2:
          if (filter.price_lte) delete filter.price_lte;
          filter = { ...filter, price_gte: priceSegments[2].gte };
          break;
        default:
          if (filter.price_lte) delete filter.price_lte;
          if (filter.price_gte) delete filter.price_gte;
      }

      let activeCategory = document.querySelector(
        ".product__price-category-item.active"
      );
      if (activeCategory) activeCategory.classList.remove("active");
      priceCategory.classList.add("active");
      getProducts(filter);
    };
  });
};

// Tính tổng số trang sản phẩm
const calcTotalPage = (params) => {
  let { _limit, _totalProducts } = params;
  return Math.ceil(_totalProducts / _limit);
};

// Render phân trang sản phẩm
const renderPagination = (params) => {
  let { _page } = params;
  let productsPagination = document.querySelector(".product__pagination ul");
  let pages = calcTotalPage(params);
  let htmls = "";

  for (let i = 1; i <= pages; i++) {
    htmls +=
      i === _page
        ? `<li class="page-item active"><a class="page-link" href="#!" onclick='onClickPagination(${i})'>${i}</a></li>`
        : `<li class="page-item"><a class="page-link" href="#!" onclick='onClickPagination(${i})'>${i}</a></li>`;
  }
  htmls = `<li class="page-item"><a class="page-link" href="#!" aria-label="Previous"><em class="fas fa-caret-left"></em></a></li>${htmls}<li class="page-item"><a class="page-link" href="#!" aria-label="Next"><em class="fas fa-caret-right"></em></a></li>`;

  productsPagination.innerHTML = htmls;
};

// Xử lí khi click thay đổi trang
const onClickPagination = (page) => {
  filter._page = page;
  getProducts(filter);
};

// Sắp xếp sản phẩm theo giá tiền
const sortByPrice = () => {
  let priceSortSelect = document.querySelector(".product__price-sort");

  priceSortSelect.onchange = (e) => {
    let option = e.target.value;
    filter._page = 1;

    // If option sort is not default then:
    if (option !== "default") {
      filter = { ...filter, _sort: "price", _order: option };
    }
    // If option sort is default then:
    else {
      if (filter._sort) delete filter._sort;
      if (filter._order) delete filter._order;
    }

    getProducts(filter);
  };
};

// Hiển thị trang sản phẩm theo số lượng tùy ý
const showByLimit = () => {
  let productLimitShow = document.querySelector(".product__limit-show");

  productLimitShow.onchange = (e) => {
    let option = e.target.value;
    filter._page = 1;

    switch (option) {
      case "9":
        filter._limit = 9;
        break;
      case "12":
        filter._limit = 12;
        break;
      default:
        filter._limit = defaultFilter._limit;
    }

    getProducts(filter);
  };
};

// Xóa tất cả bộ lọc
const clearAllFilter = () => {
  let clearFilterBtn = document.querySelector(".product__clear-filter-btn");

  clearFilterBtn.onclick = () => {
    filter = { ...defaultFilter };
    getProducts(filter);

    let activeCategory = document.querySelector(
      ".product__category-item.active"
    );
    if (activeCategory) activeCategory.classList.remove("active");

    let activePriceCategory = document.querySelector(
      ".product__price-category-item.active"
    );
    if (activePriceCategory) activePriceCategory.classList.remove("active");

    let sortOptions = document.querySelectorAll(".product__price-sort option");
    for (const option of sortOptions) {
      option.selected = option.defaultSelected;
    }

    let limitOptions = document.querySelectorAll(".product__limit-show option");
    for (const option of limitOptions) {
      option.selected = option.defaultSelected;
    }
  };
};

// Add product to cart
const addToCart = (product) => {
  let cartItems = getCartItems();

  if (!cartItems) {
    cartItems = [{ ...product, inCart: 1 }];
    increaseCartNumbers();
  } else {
    let index = -1;
    let isProductExist = cartItems.some((item) => {
      ++index;
      return item.id === product.id;
    });

    // Check if product already exist in cart
    if (isProductExist) {
      ++cartItems[index].inCart;
    } else {
      // if product not exist in cart yet
      cartItems = [...cartItems, { ...product, inCart: 1 }];
      increaseCartNumbers();
    }
  }

  localStorage.setItem("cart", JSON.stringify(cartItems));
};

// Xử lí khi click add to cart
const onClickAddToCart = (products) => {
  let buyBtns = document.querySelectorAll(".button.add-to-cart");

  for (let i = 0; i < buyBtns.length; ++i) {
    buyBtns[i].onclick = () => {
      addToCart(products[i]);
      showSuccessToast();
      handleHoverCart();
    };
  }
};

// Tăng số số lượng sản phẩm hiển thị trên giỏ hàng của header
const increaseCartNumbers = () => {
  let productNumbers = parseInt(localStorage.getItem("cartNumbers"));
  let cartNum = document.querySelector(".header__cart-numbers");

  if (productNumbers) {
    localStorage.setItem("cartNumbers", productNumbers + 1);
    cartNum.textContent = productNumbers + 1;
  } else {
    localStorage.setItem("cartNumbers", 1);
    cartNum.textContent = 1;
  }
};

// Hiển thị lại số số lượng sản phẩm trên giỏ hàng của header khi có thay đổi
const onLoadCartNumbers = () => {
  let productNumbers = localStorage.getItem("cartNumbers");
  let cartNum = document.querySelector(".header__cart-numbers");
  cartNum.textContent = productNumbers ? productNumbers : 0;
};

const getCartItems = () => {
  return JSON.parse(localStorage.getItem("cart"));
};

// Xử lí khi hover vào giỏ hàng trên thanh header
const handleHoverCart = () => {
  if (window.location.pathname === "/cart.html") return;

  let headerCart = document.querySelector("#headerCart");
  let cartItems = getCartItems();

  if (!cartItems || cartItems.length === 0) {
    headerCart.innerHTML = `
      <div class="header__cart-block header__cart-block--no-cart">
        <img class="header__cart-no-cart-img" src="./assets/images/no-cart.png" alt="no cart image">
        <span class="header__cart-message">Chưa có sản phẩm</span>
      </div>`;
  } else {
    let cartItemsHtml = cartItems
      .map((item) => {
        return `
        <li class="header__cart-item">
          <a class="header__cart-link" href="${item.detailLink}">
            <img class="header__cart-item-img" src="./assets/images/${
              item.img
            }" alt=${item.imgAlt}>
            <h4 class="header__cart-item-title">${item.name}</h4>
            <span class="price">${parseInt(item.price).toLocaleString(
              "vi-VN"
            )}</span>
          </a>
        </li>
      `;
      })
      .join("");

    let headerCartBlockInner = `
      <div class="header__cart-block">
        <header class="header__cart-header">Sản Phẩm Mới Thêm</header>
        <ul class="header__cart-list">
          ${cartItemsHtml}
        </ul>
        <a class="button mb-3" href="/cart.html">Xem Giỏ Hàng</a>
      </div>
    `;

    headerCart.innerHTML = headerCartBlockInner;
  }
};
