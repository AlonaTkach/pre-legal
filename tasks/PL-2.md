# PL-2 — Create a dataset of legal document templates

**Type:** Data curation (one-time task)
**Status:** To Do

## Summary

Create a dataset of legal document templates that the system will later be able
to modify for the user.

## Description

This task is a one-time data curation project to prepare data for the pre-legal
project. For context, the Common Paper GitHub account
(https://github.com/CommonPaper) contains a number of repos with legal agreement
templates that can be copied and modified under a Creative Commons license. We
will use this as the source of data.

For this task, we will need to:

1. Browse these repos.
2. Pull down the Markdown files and put them in a directory called `templates/`.
3. Additionally, make a JSON file (`catalog.json`) to describe the different
   templates we've got.
4. Finally, put in a license file to recognize the Creative Commons license.
