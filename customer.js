  //requiring mysql npm
  var mysql = require("mysql");
  //requiring cli-table npm
  var Table = require("cli-table");
  //requiring colors npm
  var colors = require('colors');
  //requiring inquirer npm
  var inquirer = require("inquirer");
  // create the connection information for the sql database
  var connection = mysql.createConnection({

                                          host: "localhost",
                                          port: 3306,
                                          user: "root",
                                          password: "",
                                          database: "bamazon_db"
                                          });
  //validator function
  function validateInput(value) {

            var integer = Number.isInteger(parseFloat(value));
            var sign = Math.sign(value);

            if (integer && (sign === 1)) {
                return true;
          } else {
                return 'Please enter a valid number!';
            }
}

  //creating function that prompt user to enter item id and quantity
  function promptUser() {
  
        // Prompt the user to select an item
        inquirer.prompt([
                          {
                            type: 'input',
                            name: 'item_id',
                            message: 'Enter the Item ID, And then press Enter: ',
                            validate: validateInput,
                            filter: Number
                          },
                          {
                            type: 'input',
                            name: 'quantity',
                            message: 'Enter the Quantity, And then press Enter to place your order: ',
                            validate: validateInput,
                            filter: Number
                          }
                        ]).then(function(input) {
    

                            var item = input.item_id;
                            var quantity = input.quantity;

                             // Query db to confirm that the given item ID exists in the desired quantity
                             var queryStr = 'SELECT * FROM products WHERE ?';

                             connection.query(queryStr, {item_id: item}, function(err, data) {
                               
                                       if (err) throw err;

                                       for (var i = 0; i < data.length; i++) {
                                         
                                       


                            if (data.length === 0) {

                              console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');

                              displayProducts();

                          } else {
                              
                              var productData = data[0];
          
                            if (quantity <= productData.stock_quantity) {
                                    
                                    console.log("-----------------------------------------------------------------------------------------------\n");
                                    console.log('Congratulations, the product you requested is in stock!\n'.green.bold);

                                    // Construct the updating query string
                                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
          
                                    // Update the inventory
                                    connection.query(updateQueryStr, function(err, data) {
                                          
                                              if (err) throw err;

                                              console.log(('Your oder has been placed! Your total is $' + productData.price * quantity + "\n").bold);
                                              console.log('Thank you for your purchase!'.bold);
                                              console.log("---------------------------------------------------------------------\n");

                                             //creating a prompt inquirer function that asks the user if they want to purchase again    
                                              inquirer.prompt([

                                                      {
                                                        type: 'confirm',
                                                        message: 'Would you like to make another order?',
                                                        name: 'orderAgain'
                                                      }

                                              ]).then(function (answers) {

                                              // if user chose play again
                                              if (answers.orderAgain) {
                                                

                                                displayProducts();
                                

                                              } 
                                              else {
                                              //printing out a goodbye message
                                              console.log(" Thanks Again for your order ".bold.inverse.green);
                                              connection.end();
                              }
                  })
                                    })
                            } else {
                                    //printing out results if order is more than stock quantity
                                    console.log("-----------------------------------------------------------------------------------------------\n");
                                    console.log('Unfortunately, There is not enough product in stock, your order can not be placed!\n'.red.bold);
                                    console.log(("We Have only: " + productData.stock_quantity + " peaces in stock\n").bold);
                                    console.log(("Please modify your quantity!").bold);
          
                                              

                                    displayProducts();
                                    }
        }
      }
    })
  })
}

  function displayProducts() {
  
                // Construct the db query string
                queryStr = 'SELECT * FROM products';

                // Make the db query
                connection.query(queryStr, function(err, res) {
                  if (err) throw err;

                  var table = new Table({
                          head: ['ID', 'Product Name', 'Department', 'Price']
                  });

                  //DISPLAYS ALL ITEMS FOR SALE 
                  console.log("\n");
                  console.log("  HERE ARE ALL THE ITEMS AVAILABLE FOR SALE ".bold);
            
                  for (var i = 0; i < res.length; i++) {
                      table.push([res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price.toFixed(2)]);
                  }
                  //LOGS THE COOL TABLE WITH ITEMS IN FOR PURCHASE. 
                  console.log(table.toString());

                  //Prompt the user for item/quantity they would like to purchase
                  promptUser();
  })
}

displayProducts();








