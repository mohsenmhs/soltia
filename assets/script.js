import Autocomplete from './Autocomplete.js'
import SearchHistory from './SearchHistory.js'

const wikiUrl = 'https://en.wikipedia.org/w/api.php?'
const params = 'action=query&list=prefixsearch&utf8=&pslimit=50&format=json&origin=*'
const serchHistory = new SearchHistory('soltiaSearchHistory')

const clearSearchHistory =  document.getElementById('clearSearchHistory')
clearSearchHistory.addEventListener('click', serchHistory.clearSearchHistory)

new Autocomplete('soltiaSearch',

    // Search function can return a promise
    // which resolves with an array of
    // results. In this case we're using
    // the Wikipedia search API.
    // search: 
    input => {
        const url = `${wikiUrl}${params
            }&pssearch=${encodeURI(input)}`

        return new Promise(resolve => {
            if (input.length < 1) {
                return resolve([])
            }
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    resolve(data.query.prefixsearch)
                })
        })
    },

    // Wikipedia returns a format like this:
    //
    // {
    //   pageid: 12345,
    //   title: 'Article title',
    //   ...
    // }
    // 
    // We want to display the title
    // getResultValue: 
    result => result.title,

    // Open the selected article in
    // a new window
    // onSubmit: 
    result => {
        serchHistory.pushSearchHistoryNewItem(result.title)
    }
)
