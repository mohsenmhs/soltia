describe('Soltia Frontend Test', () => {
    ///Store two search results for complete test 
    let selectedResult_0
    let enteredQuery = 'Mohsen'

    it('Soltia Delete Button', () => {
        cy.visit('/')
        cy.get('.soltia-button')
            .click()
            .should('have.attr', 'aria-label')
            .and('equal', 'Delete')
    })

    it('Search query and select second result', () => {
        const newQuery = 'H'
        cy.get('.autocomplete-input')
            .type(`${newQuery}`)


        cy.get('.autocomplete-result-list li')
            .should(($lis) => {
                expect($lis).to.have.length(50)
                selectedResult_0 = $lis.eq(1).text()
            })

        cy.get('.autocomplete-input')
            .type('{downarrow}')
            .type('{downarrow}')
            .type('{enter}')

    })

    it('Press ESC key', () => {
        cy.get('.autocomplete-input')
            .type(`{esc}`)

        cy.get('.autocomplete-result-list')
            .children()
            .should('have.length', 0)
    })

    it('New search history item added', () => {
        cy.get('.search-history-body li')
            .should(($lis) => {
                expect($lis).to.have.length(1)
                expect($lis.eq(0)).to.contain(selectedResult_0)
            })
    })

    it('Search another query and press ENTER key', () => {
        cy.get('.autocomplete-input')
            .type(`${enteredQuery}{enter}`)
    })

    it('New search history item added, there is two items', () => {
        cy.get('.search-history-body li')
            .should(($lis) => {
                expect($lis).to.have.length(2)
                expect($lis.eq(0)).to.contain(selectedResult_0)
                expect($lis.eq(1)).to.contain(enteredQuery)
            })
    })

    it('Click clear query button', () => {
        cy.get('.query-clear')
            .click()

        cy.get('.autocomplete-input')
            .should('have.value', '')
    })

    it('Click clear search history item button', () => {
        cy.get('.search-history-body li')
            .should(($lis) => {
                expect($lis).to.have.length(2)
                $lis.eq(0).find('.history-item-clear')
                    .click()
            })

        cy.get('.search-history-body li')
            .should(($lis) => {
                expect($lis).to.have.length(1)
                expect($lis.eq(0)).to.contain(enteredQuery)
            })
    })

    // Finally, make sure that the clear button works.
    it('Click clear all search history items button', () => {
        cy.get('#clearSearchHistory')
            .click()

        cy.get('.search-history-body')
            .children()
            .should('have.length', 0)
    })
})