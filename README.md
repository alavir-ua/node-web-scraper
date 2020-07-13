[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

# Examples of cleaning up a static site with Axios, Cheerio, and a dynamic site using Puppeteer.  

These are simple examples of implementing web scrapers on node js using the appropriate libraries and then writing the results to a file with extensions of your choice json, xlsx or csv.


## Getting Started
These instructions will provide you with a copy of the project that will be launched on your local computer for development and testing.

## Prerequisites
What things you need to install the software.

- Git.
- NPM.
- IDE.


## Install
Clone the git repository on your computer
```
$ git clone https://github.com/alavir-ua/node-web-scraper.git
```
You can also download the entire repository as a zip file and unpack in on your computer if you do not have git.

After cloning the application, you need to install it's dependencies.
```
$ npm install
```
In the root of the project, create the directory "result_data".

## Run the script
Open a terminal and enter the following command:
```
$ node rozetka.js 
or 
$ node vsiknygy.js
```
After completing the script in the result_data directory, you will receive a file with the results of its work.
You can change the name and file extension for recording in the following line of code (for both scripts):
```
const file = new Writer(results, 'books')
file.write('xlsx')

if (fs.statSync('./result_data/books.xlsx').size !== 0) {...
```

