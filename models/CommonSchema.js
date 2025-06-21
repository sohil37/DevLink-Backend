const {
  LETTERS_HYPHENS_APOSTROPHES,
  REPEATED_CHARACTERS,
  LINKS,
} = require("../utils/constants/regex");
const {
  isEndDateValid,
  isTechnologyValid,
} = require("../utils/helperFunctions");

const FIRST_NAME = {
  type: String,
  required: [true, "First name is required"],
  trim: true,
  minlength: [2, "First name must be at least 2 characters"],
  maxlength: [50, "First name must be at most 50 characters"],
  match: [
    LETTERS_HYPHENS_APOSTROPHES,
    "First name must contain only letters, hyphens, or apostrophes",
  ],
};

const LAST_NAME = {
  type: String,
  required: [true, "Last name is required"],
  trim: true,
  minlength: [2, "Last name must be at least 2 characters"],
  maxlength: [50, "Last name must be at most 50 characters"],
  match: [
    LETTERS_HYPHENS_APOSTROPHES,
    "Last name must contain only letters, hyphens, or apostrophes",
  ],
};

const EMAIL_SCHEMA = {
  type: String,
  required: [true, "Email is required"],
  trim: true,
  lowercase: true,
  unique: true, // remove if not needed in all places
  match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email address"],
};

const PHONE_NO_SCHEMA = {
  type: String,
  required: [true, "Phone number is required"],
  trim: true,
  match: [
    /^\+?[0-9]{7,15}$/,
    'Phone number must be 7-15 digits and can optionally start with "+"',
  ],
};

const PROFILE_SUMMARY = {
  type: String,
  trim: true,
  minlength: 30,
  maxlength: 2000,
  validate: [
    {
      validator: (v) => !LINKS.test(v),
      message: "Profile summary must not contain URLs.",
    },
    {
      validator: (v) => !REPEATED_CHARACTERS.test(v),
      message: "Profile summary contains repeated characters.",
    },
  ],
};

const CITY = {
  type: String,
  required: [true, "City is required"],
  trim: true,
  minlength: [2, "City must be at least 2 characters"],
  maxlength: [100, "City must be at most 100 characters"],
  match: [
    LETTERS_HYPHENS_APOSTROPHES,
    "City name can only contain letters, spaces, hyphens, or apostrophes",
  ],
};

const STATE = {
  type: String,
  required: [true, "State is required"],
  trim: true,
  minlength: [2, "State must be at least 2 characters"],
  maxlength: [100, "State must be at most 100 characters"],
  match: [
    LETTERS_HYPHENS_APOSTROPHES,
    "State name can only contain letters, spaces, hyphens, or apostrophes",
  ],
};

const COUNTRY = {
  type: String,
  required: [true, "Country is required"],
  trim: true,
  minlength: [2, "Country must be at least 2 characters"],
  maxlength: [100, "Country must be at most 100 characters"],
  match: [
    LETTERS_HYPHENS_APOSTROPHES,
    "Country name can only contain letters, spaces, hyphens, or apostrophes",
  ],
};

const LOCATION = {
  city: CITY,
  state: STATE,
  country: COUNTRY,
};

const STATE_DATE = {
  type: Date,
  required: [true, "Start date is required"],
};

const END_DATE = {
  type: Date,
  required: [true, "End date is required"],
  validate: {
    validator: function (end) {
      return isEndDateValid(this.startDate, end);
    },
    message: "End date must be after or equal to start date",
  },
};

const SKILLS = {
  type: [String],
  validate: {
    validator: function (skills) {
      return skills.every((skill) => isTechnologyValid(skill));
    },
    message:
      "Each skill must be 2-30 characters and contain only letters, numbers, +, ., -, #, or spaces",
  },
  default: [],
};

const PROJECTS = {
  type: [
    {
      name: {
        type: String,
        required: [true, "Project name is required"],
        trim: true,
        minlength: [3, "Project name must be at least 3 characters"],
        maxlength: [100, "Project name must be at most 100 characters"],
      },
      description: {
        type: String,
        trim: true,
        minlength: [20, "Description must be at least 20 characters"],
        maxlength: [2000, "Description must be at most 2000 characters"],
      },
      startDate: STATE_DATE,
      endDate: END_DATE,
      technologiesUsed: {
        type: [String],
        default: [],
        validate: [
          {
            validator: function (techs) {
              return techs.length <= 20;
            },
            message: "You can specify a maximum of 20 technologies",
          },
          {
            validator: function (techs) {
              return techs.every((tech) => isTechnologyValid(tech));
            },
            message:
              "Each technology must be 2-30 characters and use valid characters",
          },
        ],
      },
    },
  ],
  default: [],
};

const EXPERIENCE = {
  type: [
    {
      name: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
        minlength: [3, "Company name must be at least 3 characters"],
        maxlength: [100, "Company name must be at most 100 characters"],
      },
      description: {
        type: String,
        trim: true,
        minlength: [20, "Description must be at least 20 characters"],
        maxlength: [2000, "Description must be at most 2000 characters"],
      },
      startDate: STATE_DATE,
      endDate: END_DATE,
    },
  ],
  default: [],
};

module.exports = {
  FIRST_NAME,
  LAST_NAME,
  EMAIL_SCHEMA,
  PHONE_NO_SCHEMA,
  PROFILE_SUMMARY,
  LOCATION,
  SKILLS,
  PROJECTS,
  EXPERIENCE,
};
