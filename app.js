var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPerrcentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItem[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.total[type] = sum;
  };

  var data = {
    allItem: {
      exp: [],
      inc: [],
    },
    total: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      if (data.allItem[type].length > 0) {
        ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      data.allItem[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItem[type].map(function (current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItem[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      calculateTotal("exp");
      calculateTotal("inc");
      data.budget = data.total.inc - data.total.exp;
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePerrcentage: function () {
      data.allItem.exp.forEach(function (cur) {
        cur.calcPerrcentage(data.total.inc);
      });
    },
    getPercentage: function () {
      var allPercentage = data.allItem.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPercentage;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var DOMstring = {
    inputType: ".add__type",
    addDescription: ".add__description",
    addValue: ".add__value",
    addBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstring.inputType).value,
        description: document.querySelector(DOMstring.addDescription).value,
        value: parseFloat(document.querySelector(DOMstring.addValue).value),
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      if (type === "inc") {
        element = DOMstring.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMstring.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function () {
      var fields, arrayFields;
      fields = document.querySelectorAll(
        DOMstring.addDescription + "," + DOMstring.addValue
      );
      arrayFields = Array.prototype.slice.call(fields);
      arrayFields.forEach(function (current, index, array) {
        current.value = "";
      });
      arrayFields[0].focus();
    },
    displayBudget: function (obj) {
      document.querySelector(DOMstring.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstring.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstring.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMstring.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstring.percentageLabel).textContent = "---";
      }
    },
    getDOMstring: function () {
      return DOMstring;
    },
  };
})();

var appController = (function (budgetCont, UICont) {
  var setupEventListener = function () {
    var DOM = UICont.getDOMstring();

    document
      .querySelector(DOM.addBtn)
      .addEventListener("click", controlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event === 13 || event.which === 13) {
        controlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", controlDeleteItem);
  };
  var updateBudget = function () {
    budgetCont.calculateBudget();
    var budget = budgetCont.getBudget();
    UICont.displayBudget(budget);
  };
  var updatePercentage = function () {
    budgetCont.calculatePerrcentage();
    var percentage = budgetCont.getPercentage();
    console.log(percentage);
  };
  var controlAddItem = function () {
    var input, newItem;
    input = UICont.getInput();
    if (input.description !== "" && !isNaN(input.value)) {
      newItem = budgetCont.addItem(input.type, input.description, input.value);
      UICont.addListItem(newItem, input.type);
      UICont.clearFields();
      updateBudget();
      updatePercentage();
    }
  };
  var controlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      budgetCont.deleteItem(type, ID);
      UICont.deleteListItem(itemID);
      updateBudget();
      updatePercentage();
    }
  };
  return {
    init: function () {
      console.log("App Start");
      UICont.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UIController);

appController.init();
