// code for the budget app

// separating module of our app

// budget Controller Module
var budgetController = (function () {
  // creating function constructor for creating instance of income and expenses

  // Expenses function constructor
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // creating percentage calculating method
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // method for getting the percentage
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  // Income function constructor
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  // storing our data in object
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on "inc" or "exp" type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else {
        newItem = new Income(ID, des, val);
      }

      // push into data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var index, ids;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // calculate total income and expense
      calculateTotal("inc");
      calculateTotal("exp");

      // calculate the budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function () {
      var allPercentage = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPercentage;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    testing: function () {
      console.log(data);
    },
  };
})();

// ui controller module
var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    // rules
    /*
    + or - before a number
    exactly two decimal points
    comma separating the thousands

    2310.4567 -> + 2,310.6
    2000 -> + 2,000.0
    */

    // making a negative number positive using absolute
    num = Math.abs(num);
    // converting the absolute number to two decimal points number
    num = num.toFixed(2);
    numSplit = num.split(".");

    // storing integer part
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    // storing decimal part
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        //will be either inc for income and exp for expenses

        description: document.querySelector(DOMStrings.inputDescription).value,

        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create html string with place holder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace the place holder text with actual data
      newHtml = html.replace("%id%", obj.ID);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // insert the html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (currentValue, index, array) {
        currentValue.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(
        DOMStrings.expensesPercentageLabel
      );

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, year, month;

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      now = new Date();

      // using the date object

      // getting the current year and month
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings: function () {
      return DOMStrings;
    },
  };
})();

// Controller module of app to control all the app and connect different module
var controllerModule = (function (BudgetCtrl, UICtrl) {
  //  function to set the event listeners
  var setUpEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();

    // selecting the add (tick) button
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    // adding another event listener for the enter key event
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    BudgetCtrl.calculateBudget();

    // 2 return the budget
    var budget = BudgetCtrl.getBudget();

    // 3 Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function () {
    // 1. Calculate the percentage
    BudgetCtrl.calculatePercentage();
    // 2, Read percentage from the budget Controller
    var percentages = BudgetCtrl.getPercentage();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  // function that does task after pressing the tick button or enter button
  var ctrlAddItem = function () {
    var input, newItem;
    // task to do after the button is clicked
    // 1 Get the input field from the data
    input = UICtrl.getInput();
    // console.log(input);

    if (input.description !== "" && !isNaN(input.value) && input.value > 0)
      // 2 Add item to the budget controller
      newItem = BudgetCtrl.addItem(input.type, input.description, input.value);
    // 3 Add the item to the UI
    UICtrl.addListItem(newItem, input.type);

    // clear the fields
    UICtrl.clearFields();
    // 5 Calculate and update the budget
    updateBudget();

    // 6 Calculate and update the percentages
    updatePercentage();
  };

  var ctrlDeleteItem = function (event) {
    var itemId, splitId;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      // inc 1
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);

      // 1. delete the item from the data structure
      BudgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemId);

      // 3, Update and show the new budget
      updateBudget();

      // 4 Calculate and update the percentages
      updatePercentage();
    }
  };

  return {
    init: function () {
      console.log(`app has started`);
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setUpEventListeners();
    },
  };
})(budgetController, UIController);

// calling the initializer function of the app
controllerModule.init();
