const puppeteer = require('puppeteer');
const cheerio = require('cheerio')
const tress = require('tress')
const fs = require('fs')
const chalk = require('chalk')
const Writer = require('obj3ext')

//fixing memory leak in EventEmitter
require('events').EventEmitter.defaultMaxListeners = 0

//start time counter
let start = process.hrtime();

//array of results definition
let results = []

//counters definition
let item_counter = 0
let page_counter = 0

//start link definition
const URL = 'https://rozetka.com.ua/notebooks/c80004/producer=asus/'

//page processing queue
const q_page = tress(function (url, callback) {
  puppeteer
    .launch()
    .then(browser => browser.newPage())
    .then(page => {
      return page.goto(url, {
        waitUntil: 'load',
        timeout: 0
      })
        .then(function () {
          return page.content();
        });
    })
    .then(html => {
      const $ = cheerio.load(html);

      //search for the next li tag after the active link
      const li = $('.pagination__link.pagination__link_state_active').parent().next()

      //if exists, then we extract href and send to the page queue
      if (li.length) {
        const next_pag_link = li.children().attr('href')
        q_page.push(next_pag_link)
        page_counter++
        console.log('')
        console.log(page_counter + chalk.red(' page was added to process'))
        console.log('')
      }

      //extract the link to the goods from the goods block and send to the goods queue
      const item_card = $('.goods-tile__inner')
      item_card.each(function () {
        let item_params_link = $(this).find('.goods-tile__heading').attr('href') + 'characteristics/'
        q_item.push(item_params_link)
      })

      callback()
    })
    .catch(console.error);
}, 5) //start 5 parallel threads


//goods processing queue
const q_item = tress(function (url, callback) {
  puppeteer
    .launch()
    .then(browser => browser.newPage())
    .then(page => {
      return page.goto(url, {
        waitUntil: 'load',
        timeout: 0
      })
        .then(function () {
          return page.content();
        });
    })
    .then(html => {
      const $ = cheerio.load(html)

      //product parameters object
      let item_params = {}
      item_params['Название'] = $('.product__title').text()

      //check for black and red price tags
      let price_node = $('.product-carriage__price.product-carriage__price_color_red')
      if (price_node.length) {
        item_params['Цена'] = price_node.text()
      } else {
        item_params['Цена'] = $('.product-carriage__price').text()
      }

      //processing product characteristics groups
      const paramsGroup = $('.characteristics-full__group')

      paramsGroup.each(function () {
        const string = $(this).find('dt')
        string.each(function () {
          const key = $(this).text()
          item_params[key] = $(this).next('dd').text()
        })
      })
      results[item_counter] = item_params
      item_counter++
      console.log(item_counter + chalk.blue(' item was added successfully'))

      callback()
    })
    .catch(console.error);
}, 5); //start 5 parallel threads


//actions after emptying the processing queue of goods
q_item.drain = function () {

  //writing an array of results to a file
  const file = new Writer(results, 'asus')
  file.write('xlsx')

  //file write verification delay by 5 sec
  function alert() {
    if (fs.statSync('./result_data/asus.xlsx').size !== 0) {
      console.log('')
      console.log(chalk.green('Data was added to file successfully, added  ') + results.length + chalk.green('  items'))
      console.log('')
      //stop time counter and output
      let end = (process.hrtime(start)[0] / 60).toFixed([1])
      console.log(chalk.green('Execution time: ') + end + chalk.green(' min'))
    } else {
      console.log(chalk.red('Error writing data to file!'))
    }
  }
  setTimeout(alert, 5000)
}

//actions after emptying the page processing queue
q_page.drain = function () {
  console.log('')
  console.log(page_counter + chalk.red(' pages was added to process'))
  console.log('')
}
//adding the first link to the page processing queue
q_page.push(URL)
