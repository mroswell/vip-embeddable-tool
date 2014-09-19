vip-embeddable-tool
===================

The Voting Information Project is developing a white-label, easily embedded web tool that will provide voters with ballot and polling place information based on their registered address.

# Embedding Instructions
## Adding the Voter Information Tool to your page
Append the following code to your website where you want the Voter Information Tool to appear:
```HTML
<script type="text/javascript" src="http://preview.joystickinteractive.com/voter-information-project/vip-embeddable-tool/build/app.js"></script>
<div id="_vit"></div>
<script type="text/javascript">vit.load({});</script>
```
## The `vit.load` method
You can add parameters to the `vit.load` method to customize the appearance and functionality of the Voter Information Tool. They are passed into the `vit.load` method by an options object, that is, a comma-separated set of keys and string values inside the curly braces:
```JavaScript
vit.load({
  alert: "Remember to vote on Nov 7!"
});
```
## Parameters
| Key | Description |
|-----|-------------|
|`modal`| if true, will open up in a modal box to display election information for mobile and tablet devices (defaults to true)|
|`official`| if true, will only display information from official election information sources (defaults to false)|
|`width`| set the width of the tool (e.g., `450px`)|
|`height`| set the height of the tool|
|`logo`| link to an alternative logo to display at the top of the tool|
|`smallLogo`| link to an alternative logo to display in the modal election information view|

### Colors
You can also add colors by passing an object of this format to the `colors` parameter:

| Key | Description |
|-----|-------------|
|`text`|Main application text|
|`header`|Headers used for categorizing election result data|
|`selectedHeader`|Header currently selected by the user|
|`landscapeHeaderBackground`|Shown behind the headers in tablet/desktop view|
|`alertText`|Header for displaying alerts to the user|

# Setup Instructions

1. `npm install -g gulp`
2. `npm install`
3. `bundle`
4. `gulp`

# Testing Instructions

1. Download [PhantomJS](http://phantomjs.org/download.html)
2. `bundle`
3. `rspec spec/examples.rb`
