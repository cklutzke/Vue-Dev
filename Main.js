window.app = new Vue({
  el: "#app",
  data: {
    message: 'Hello, World!',
    product: {
      name: 'Meeple, Red',
      image: 'https://s3.amazonaws.com/files.thegamecrafter.com/7f2ccd947321d9af7fefe4e029107fe89588e8fd',
      /* Youtube URLs must be in this "/embed/" format - see https://stackoverflow.com/questions/9934944 */
      video: 'https://www.youtube.com/embed/Hj6N59wZi1I',
      alt: 'Photo of Meeple, Red',
      /* Vue appears unable to resolve &quot; entities in text, hence the \" characters. */
      description: 'These painted wood figurines, available in a variety of colors, \
        make a great alternative to pawns for board games with character.  Each one \
        stands 3/4\" tall by 5/8\" at the base, in the shape of the human \
        body with out-stretched arms.',
      /* TODO: Create a price object here. */
      unitPrice: 0.12
    }
  }
})
