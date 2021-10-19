import Autocomplete from './Autocomplete.js'
import SearchHistory from './SearchHistory.js'

const wikiUrl = 'https://en.wikipedia.org/w/api.php?'
const params = 'action=query&list=prefixsearch&utf8=&pslimit=50&format=json&origin=*'
const serchHistory = new SearchHistory('soltiaSearchHistory')

const clearSearchHistory = document.getElementById('clearSearchHistory')
clearSearchHistory.addEventListener('click', serchHistory.clearSearchHistory)


new Autocomplete(
    {
        autoCompleteContainerId: 'soltiaSearch',

        // Search function should return a promise
        // which resolves with an array of
        // results. In this case we're using
        // the Wikipedia search API.
        search:
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
        //   ...
        //   title: 'Article title',
        //   ...
        // }
        // 
        // We want to display the title
        getResultValue:
            result => result.title,

        // Push the selected result in the search history
        onSubmit:
            result => {
                if (result)
                    serchHistory.pushSearchHistoryNewItem(result.title ? result.title : result)
            }
    }
)
