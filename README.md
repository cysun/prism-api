# Program Review Information System Management (PRISM)

Program Review Information System Management (PRISM) is a document and workflow
management full-stack web application tailored to the need of the Program Review
Subcommittee (PRS) at California State University of Los Angeles (CSULA). Prior
to the introduction of PRISM, the PRS collaborated on documents, distributed
templates, and coordinated meetings using email. The intent of PRISM is to
streamline the process by providing a single site where all functions of program
review may be conducted. PRISM is a web application supporting document
collaboration, review progress tracking, template management, email
notifications, calendar events, and modeling of the university's hierarchical
structure. It greatly simplifies the workflow of the PRS and the department
chairs, deans, and external reviewers who also partake in the review process.

PRISM was developed by [Andrew McLees](https://github.com/amclees),
[Leanne David](https://github.com/leannedavid), Justin Sarenas, and Ben-Jair
Solis as their  [senior design project](https://csns.calstatela.edu/department/cs/project/view?id=6059771)
at CSULA.

There are two main components of PRISM: a REST API and a single-page application
which together form a MEAN stack. The REST API is implemented in Node.js with
Express and Mongoose. The frontend is implemented in Angular 5. This repository
contains the REST API of PRISM.

### Setup

These instruction assume that NodeJS, NPM, and MongoDB are already installed on
the computer being set up.

1. Clone this repository
2. Run `npm install` from the project root to install dependencies
3. Make a copy of the `.env_skeleton` file named `.env` and ensure all
   parameters that are not commented out in the `.env_skeleton` file are
   configured properly
4. Run the MongoDB server that is configured in the `.env` file
5. Run `node bin/db_setup_development.js` **or**
   `node bin/db_setup_production.js` for development or production environments,
   respectively. **This will remove all items from ALL MongoDB collections
   used by PRISM.** It is important to do this from the root of this repository
   so that the `.env` file can be loaded.
