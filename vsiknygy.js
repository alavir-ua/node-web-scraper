const axios = require('axios')
const cheerio = require('cheerio')
const tress = require('tress')
const fs = require('fs')
const chalk = require('chalk')
const Writer = require('obj3ext')

//start time counter
let start = process.hrtime();

//array of results definition
let results = []

//counters definition
let item_counter = 0
let page_counter = 0

//start link definition
const url = 'https://vsiknygy.com.ua/'

axios(url)
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)

    //getting a genre link from a catalog
    const catalog_link = $('.line-top.bxr-left-menu-hover.hidden-sm.hidden-xs').find('.bxr-element-name.bxr-children-color-hover > a')

    //processing genre links and adding them to the page queue
    catalog_link.each(function () {
      const link = 'https://vsiknygy.com.ua' + $(this).attr('href')
      q_page.push(link)
    })
  })
  .catch(console.error)

//page processing queue
let q_page = tress(function (url, callback) {
  axios(url)
    .then(response => {
      const html = response.data
      const $ = cheerio.load(html)

      //definition of the next pagination link
      const link = $('.nav-current-page').next('a')

      //if exists, then add to the page queue
      if (link.length) {
        const next_link = 'https://vsiknygy.com.ua' + link.attr('href')
        q_page.push(next_link)
        page_counter++
        console.log('')
        console.log(page_counter + chalk.red(' page was added to process'))
        console.log('')
      }

      //book block definition per page
      const item_card = $('.bxr-element-container')

      //define the page genre to add to the parameter of each book from the page
      const genre = $('.col-md-9.col-sm-8 > h1').text().replace(/\s+/g, ' ')

      //adding book parameters to an object
      item_card.each(function () {
        let item_params = {}
        item_params['genre'] = genre
        item_params['name'] = $(this).find('.bxr-element-name').children().text().replace(/\s+/g, ' ')
        item_params['author'] = $(this).find('.bxr-element-author').text().replace(/\s+/g, ' ')
        item_params['in_stock'] = $(this).find('.bxr-instock-wrap').text().replace(/\s+/g, ' ')
        item_params['price'] = $(this).find('.bxr-market-current-price.bxr-market-format-price').text().replace(/\s+/g, ' ')
        results.push(item_params)
        item_counter++
        console.log(item_counter + chalk.blue(' item was added successfully'))
      })
      callback()
    })
    .catch(console.error)
}, 10)

//actions after emptying the page processing queue
q_page.drain = function () {

  //writing an array of results to a file
  const file = new Writer(results, 'books')
  file.write('xlsx')

  //file write verification delay by 5 sec
  function alert() {
    if (fs.statSync('./result_data/books.xlsx').size !== 0) {
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
