class SearchHistory {
    selectedResultCounter = 0

    constructor(
        root
    ) {
        this.root = document.getElementById(root)
    }

    handleSearchHistoryItemClearClick = (historyItem) => {
        historyItem.remove()
    }
    pushSearchHistoryNewItem = (result) => {
        const historyNewItem = {title: result, date: new Date(), id: this.selectedResultCounter++}
        this.updateHistoryItems(historyNewItem)
    }

    clearSearchHistory = () => {
        this.root.innerHTML = ''
    }
    updateHistoryItems = (selectedResult) => {
        const historyItemHTML = this.renderHistoryItem(selectedResult)
        this.root.insertAdjacentElement('beforeend', historyItemHTML)
    }

    renderHistoryItem = (selectedResult) => {
        const historyItem = document.createElement('div')
        historyItem.classList.add("history-item")

        const historyItemTitle = `<span class="history-item-title">${selectedResult.title}</span>`
        historyItem.insertAdjacentHTML('beforeend', historyItemTitle)

        const historyItemInfo = document.createElement('div')
        historyItemInfo.classList.add("history-item-info")

        const historyItemDate = `<span class="history-item-date">${this.renderDate(selectedResult.date)}</span>`
        historyItemInfo.insertAdjacentHTML('beforeend', historyItemDate)

        const historyItemClear = document.createElement('button')
        historyItemClear.classList.add("history-item-clear")
        historyItemClear.classList.add("delete-button")
        historyItemClear.classList.add("transparent-button")
        historyItemClear.addEventListener('click', () => this.handleSearchHistoryItemClearClick(historyItem))
        historyItemInfo.insertAdjacentElement('beforeend', historyItemClear)

        historyItem.insertAdjacentElement('beforeend', historyItemInfo)

        return historyItem
        // `<div class="history-item" id="searchHistory_${selectedResult.id}"><span class="history-item-title">${selectedResult.title}</span>
        // <div><span class="history-item-date">${this.renderDate(selectedResult.date)}</span><span clas></span></div></div>`
    }

    renderDate = (date) => {
        const YYYY_MM_DD =
            [date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()].join('-')

        let hours = date.getHours()
        const AmPm = hours >= 12 ? 'PM' : 'AM'
        hours = hours > 12 ? hours - 12 : hours
        const HH_MM =
            [hours,
                date.getMinutes()].join(':')

        return YYYY_MM_DD + ', ' + HH_MM + ' ' + AmPm
    }
}

export default SearchHistory