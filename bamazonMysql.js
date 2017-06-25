CREATE DATABASE bamazon_db;





use bamazon_db;

CREATE TABLE products (
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(30) NULL,
  department_name VARCHAR(30) NULL,
  price DECIMAL NULL,
  stock_quantity INT NULL,
  
  PRIMARY KEY (item_id)
);


SELECT*FROM products;

UPDATE products
SET stock_quantity = 30
WHERE item_id = 15;







CREATE TABLE departments (
  department_id INT AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(30) NULL,
  over_head_costs INT NOT NULL,
  product_sales INT NOT NULL,
  total_profit INT NULL,
  
  PRIMARY KEY (department_id)
);