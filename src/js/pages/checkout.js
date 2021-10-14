function Validator(options) {
  // get parent of element
  function getParent(element, selector) {
    // Xử lí vòng lặp nhiều cấp để tìm ra selector (parent mong muốn) từ element
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) return element.parentElement;
      element = element.parentElement;
    }
  }

  // Biến để lưu lại các rule của selector cần validate trong trường hợp selector đó có nhiều rule
  let selectorRules = {};

  //Handle validate
  function validate(inputElement, rule) {
    let errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    let errorMessage;

    let rules = selectorRules[rule.selector];

    // Lặp qua từng rule để kiểm tra, nếu có lỗi thì dừng kiểm tra
    for (let ruleCheck of rules) {
      errorMessage = ruleCheck(inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      // show error message and add invalid class
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      // remove error message and remove invalid class
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }

    // Trả về true nếu không có lỗi, trả về false nếu có lỗi
    return !errorMessage;
  }

  //Get element of form need to validate
  let formElement = document.querySelector(options.form);

  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      // Thuộc tính để kiểm tra tất cả các field đã valid chưa, trường hợp đã valid thì mới thực hiện chức năng submit
      let isFormValid = true;

      // Loop over each rule and validate
      options.rules.forEach((rule) => {
        let inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule); // Nhận gía trị true / false sau khi validate
        if (!isValid) {
          // Nếu không valid thì set lại thuộc tính của isFormValid là false
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Case: submit by javascript
        if (typeof options.onSubmit === "function") {
          let enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled]"
          );

          // Lấy toàn bộ giá trị input và cho vào object formValues (dùng Array.form để convert nodelist của enableInputs sang array)
          let formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.name] = input.value;
            return values;
          }, {});

          // Submit giá trị object formValues
          options.onSubmit(formValues);
        } else {
          // Case: submit by default behavior (form submit)
          formElement.submit();
        }
      }
    };

    //Loop over each rule and handle it (event listener)
    options.rules.forEach((rule) => {
      // Save rules for each input
      if (Array.isArray(selectorRules[rule.selector])) {
        // Nếu rule là mảng thì push thêm rule vào cho selector đó
        selectorRules[rule.selector].push(rule.test);
      } else {
        // Nếu rule không phải là mảng thì gán mảng chứa rule đó vào selector đó
        selectorRules[rule.selector] = [rule.test];
      }

      // Get input selector
      let inputElements = formElement.querySelectorAll(rule.selector);

      // Lặp qua các input element (Lưu ý: sử dụng Array.from() để convert từ nodelist sang array để có thể sử dụng các tính chất của array)
      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          // Handle when blur from input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          // Handle when user input
          inputElement.oninput = function () {
            let errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
        }
      });
    });
  }
}

//Định nghĩa rule
//Nguyên tắc của rules:
// 1. Khi có lỗi => trả về message lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả (undefinded)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test(value) {
      return value ? undefined : message || "Trường này là bắt buộc!";
    },

    // test: function (value) {
    //     return value.trim() ? undefined : 'This field is required';
    // }
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test(value) {
      let regrex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regrex.test(value) ? undefined : "Hãy nhập một email hợp lệ!";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test(value) {
      return value.length >= min ? undefined : `Hãy nhập ít nhất ${min} kí tự!`;
    },
  };
};

Validator.isNumber = function (selector) {
  return {
    selector: selector,
    test(value) {
      return !isNaN(value) ? undefined : `Không hợp lệ, yêu cầu nhập số!`;
    },
  };
};

Validator({
  form: "#form-1",
  errorSelector: ".form-message",
  formGroupSelector: ".form-group",
  rules: [
    Validator.isRequired("#fullName", "Hãy nhập đầy đủ tên của bạn"),
    Validator.isRequired("#email", "Hãy nhập email của bạn"),
    Validator.isEmail("#email"),
    Validator.isRequired("#phone", "Hãy nhập số điện thoại của bạn"),
    Validator.isNumber("#phone"),
    Validator.minLength("#phone", 10),
    Validator.isRequired("#address", "Hãy nhập địa chỉ của bạn"),
  ],

  // Handle event submit form
  onSubmit: function (data) {
    let totalPayment = parseInt(localStorage.getItem("totalPayment"));
    let cartItems = getCartItems();
    axios
      .post(`${baseUrl}/orders`, {
        customerInfo: data,
        orderItems: cartItems,
        totalPayment: totalPayment,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });

    localStorage.removeItem("cart");
    localStorage.removeItem("totalPayment");
    localStorage.removeItem("cartNumbers");
    onLoadCartNumbers();
    window.location.href = "/complete-order.html";
  },
});
