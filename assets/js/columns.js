// Which table columns hold answers, by header text (lower case). Shared by the self-test
// (study.js), which blurs these columns, and the flashcards (flashcards.js), which put them
// on the back of the card. New chapters work if their tables use the same headers.
window.ANSWER_COLUMNS = {
  'when': 'q-date',
  'exam hook': 'q-hook', 'what': 'q-hook', 'tell them apart': 'q-hook', 'handbook says': 'q-hook',
  'principle': 'q-hook', 'responsibility': 'q-hook', 'freedom': 'q-hook',
  'in the uk?': 'q-hook', 'in great britain?': 'q-hook', 'examples': 'q-hook',
  'population': 'q-hook', 'share': 'q-hook', 'where': 'q-hook', 'country': 'q-hook', 'age': 'q-hook',
  'responsible for': 'q-hook', 'england, wales and northern ireland': 'q-hook', 'scotland': 'q-hook',
  'today (verified)': 'q-hook'
};
