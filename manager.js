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
}//end of validator

    //function that prompts the user with options
    function promptManager(){
            
            inquirer.prompt({
                              name: "action",
                              type: "list",
                              message: "What would you like to do?",
                              choices: [
                                "View Products for Sale",
                                "View Low Inventory",
                                "Add to Inventory",
                                "Add New Product",
                                "Exit"
                              ]
            }).then(function(answer){

                                    //creating a switch to handle all the functions 
                                    switch(answer.action){
                                      case "View Products for Sale":
                                        viewProducts();
                                        break;
                                      case "View Low Inventory":
                                        viewLowInventory();
                                        break;
                                      case "Add to Inventory":
                                        addInventory();
                                        break;
                                      case "Add New Product":
                                        addNewProduct();
                                      break;
                                      case "Exit":
                                        connection.end();
                                      break;
        }
    })
  }

  promptManager();
  //function that displays all the products available
  function viewProducts(){

                // Construct the db query string
                queryStr = 'SELECT * FROM products';

                // Make the db query
                connection.query(queryStr, function(err, res) {
                  if (err) throw err;
                  //creating the table that holds all the products
                  var table = new Table({
                          head: ['ID', 'Product Name', 'Department', 'Price', 'Stock']
                  });

                  //DISPLAYS ALL ITEMS FOR SALE 
                  console.log("\n");
                  console.log("  HERE ARE ALL THE ITEMS AVAILABLE FOR SALE ".bold);
                  //looping through res to print the results
                  for (var i = 0; i < res.length; i++) {
                      table.push([res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price.toFixed(2), res[i].stock_quantity]);
                  }
                  //printing the table 
                  console.log(table.toString());

                  
                  promptManager();
  })
}//end of viewProduct function

  //creating function that shows only inventory with less than 5
  function viewLowInventory(){

                  // Construct the db query string
                 queryStr = 'SELECT * FROM products WHERE stock_quantity < 5';

                 // Make the db query
                 connection.query(queryStr, function(err, res) {
                  if (err) throw err;
                  //creating a table that holds low inventory
                  var table = new Table({
                          head: ['ID', 'Product Name', 'Department', 'Price', 'Stock']
                  });

                  //DISPLAYS ALL ITEMS FOR SALE 
                  console.log("\n");
                  console.log("HERE ARE ALL THE ITEMS THAT HAS LESS THAN 5 IN STOCK".bold);
                  //looping through res to get product info from results
                  for (var i = 0; i < res.length; i++) {
                      table.push([res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].price.toFixed(2), res[i].stock_quantity]);
                  }
                   //printing all items with low inventory
                  console.log(table.toString());

                  
                  promptManager();
  })
}//end of lowInventory function
  //creating function that adds to an item that's already in our inventory
  function addInventory(){

                  // Prompt the user to select an item
                  inquirer.prompt([
                            {
                              type: 'input',
                              name: 'item_id',
                              message: 'Please enter the Item ID to update the quantity: ',
                              validate: validateInput,
                              filter: Number
                            },
                            {
                              type: 'input',
                              name: 'quantity',
                              message: 'Please enter the total quantity you want to add: ',
                              validate: validateInput,
                              filter: Number
                            }
                  ]).then(function(input) {
    
                            //creating variables that hold data
                            var item = input.item_id;
                            var addQuantity = input.quantity;

                            // Query db to confirm that the given item ID exists and to determine the current stock_count
                            var queryStr = 'SELECT * FROM products WHERE ?';

                            connection.query(queryStr, {item_id: item}, function(err, data) {

                                  if (err) throw err;
                                  //looping through data 
                                  for (var i = 0; i < data.length; i++) {

                                        if (data.length === 0) {

                                                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                      
                                                addInventory();

                                      } else {

                                                var productData = data[0];

                                                // Construct the updating query string
                                                var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + addQuantity) + ' WHERE item_id = ' + item;
                    
                                                // Update the inventory
                                                connection.query(updateQueryStr, function(err, data) {
                                                          
                                                          if (err) throw err;
                             
                                                          console.log('\nStock count for ' + (productData.product_name).bold + ' has been updated successfully!\n');
                                            
                                                          console.log("Updated total is: " + parseInt(productData.stock_quantity + addQuantity));
                                    
                                                          promptManager();
                                                })

        }//else statement ends
      }//for loop ends
    }) //end of connection cb function
  })//inquirer cb function ends
}//end of add inventory function
    
   //creating function that adds new product to inventory
   function addNewProduct(){

              // Prompt the user to enter information about the new product
              inquirer.prompt([
                              {
                                type: 'input',
                                name: 'product_name',
                                message: 'Enter the new product name: ',
                              },
                              {
                                type: 'input',
                                name: 'department_name',
                                message: 'Enter the department name: ',
                              },
                              {
                                type: 'input',
                                name: 'price',
                                message: 'Enter the price per unit: ',
                                validate: validateInput
                              },
                              {
                                type: 'input',
                                name: 'stock_quantity',
                                message: 'Enter the stock quantity: ',
                                validate: validateInput
                              }

                          ]).then(function(input) {

                                // Create the insertion query string
                                var queryStr = 'INSERT INTO products SET ?';     

                                connection.query(queryStr, input, function (error, results, fields) {
                                                  
                                                  if (error) throw error;

                                                  console.log("\n" + (input.product_name).bold + " Has been successfully added to your inventory\n");
                                                  
                                                  promptManager();              

                                  })
                                })
                            }//end of add product function

  