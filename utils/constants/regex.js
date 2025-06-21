const LETTERS_HYPHENS_APOSTROPHES = /^[a-zA-Z'-]+$/;
const REPEATED_CHARACTERS = /(.)\1{5,}/;
const LINKS = /http[s]?:\/\//;
const TECHNOLOGIES = /^[a-zA-Z0-9+.#\-\s]{2,30}$/;

module.exports = {
  LETTERS_HYPHENS_APOSTROPHES,
  REPEATED_CHARACTERS,
  LINKS,
  TECHNOLOGIES,
};
