# gmail

## Overview
A mockup web app using [Polymer](https://www.polymer-project.org/0.5/) framework ( or library ). This project is using Polymer 0.5 for now. There is [Polymer 0.8](https://www.polymer-project.org/0.8/) as of now, but it is in alpha. 

**Note**:This project is using [Polymer 0.5](https://www.polymer-project.org/0.5/). As of today, June 2, the [Polymer 1.0](https://www.polymer-project.org/1.0/) has been out. The 1.0 version has significant changes compared to 0.5 version. A lot of components are renamed. So if you are learning Polymer and looking for some examples to learn. This app is already out of date. 


**Note**: This mockup web is still work in progress. Not all of the gmail features have been implemented. Since the app is using Google's Gmail Rest API, only features that are supported by Gmail REST API will be implemented in the future. 

## Features Supported now
* Default to show Today's emails
* Show emails list load load more emails when click on the "MORE ..." button.
* Search emails is working. It is working as the same as email searching except it excludes chats, which in the behind, it always append !is:chats to the end of search terms.
* Refresh Button is working.
* Email content is shown up. (Pure text, html based). Email view is showing all messages in the time order. It is using a reverse order of current Gmail Client. This means the latest email comes first.
* In the email view, archive, delete, move to folder buttons work as expected.
* Compose email is working. You could write simple text based email by clicking "+" button on the right bottom.

## Not working yet
* apps button next to refresh button is not working yet.
* Click on drafts will not open up a sending email window. Instead, it only shows in a email thread view for now.
* Forwarded email might not show up correctly.
* Some email's body doesn't show up correctly.
* Email attachments do not show up yet.
* Reply email is currently under developement.

## Demo
The stable version is hosted in [Google's App Engine](https://gmail-polymer.appspot.com/).

Sometimes it keeps refreshing for the first time. In this case, copy the url and paste it in a new tab will work.
The first time you access the app, you will need to sign in with your Google account. Actually, this is just to gain authorization from you to get emails and write emails as behalf of you.


## Resources 
* [Gmail REST API](https://developers.google.com/gmail/api/)
* [Polymer](https://www.polymer-project.org/0.5/)
* [Google's Material Design Colors](http://www.google.com/design/spec/style/color.html)

