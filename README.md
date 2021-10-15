## injectConfig library by @theripper93
### License: MIT https://opensource.org/licenses/MIT

This library is used to inject your module flags into the config of placeable objects.
Since the inject method returns the jquery element, you could pass an undefined app, and inject it into any html element. (eg. a dialog)
HOW TO USE:

### Methods:
- `injectConfig.inject(app, html, data, object)`
     - **app**: the app object
     - **html**: the html of the config dialog
     - **data**: the data that contains the information to be injected (see data structure below)
     - **object**: the object that is being configured (this is not required, by default app.object is used)
**Example:**

```js
Hooks.on("renderTokenConfig", (app,html) => {injectConfig.inject(app, html, data, app.object)};
```

- `injectConfig.quickInject(targets, data)`
     - **targets**: the targets that are being configured, this can be a single object or an array of objects
         the structure of the objcet is as follows {documentName, inject} where documentName is the name of the document (eg "Token")
         and inject is the target of the injection (this is optional), see data structure below for details on the inject key
     - **data**: the data that contains the information to be injected (see data structure below)
**Example:**

```js
injectConfig.quickInject([{documentName: "Token"},{documentName: "Tile"}],data);
```
**Note:** This method will automatically create the hooks for the documentName and inject the data into the config dialog

### Data Structure:

**Note: **every key except the reserved ones listed below will be the key of the flag you are injecting

#### Reserved Keys:
- **moduleId**: the id of the module (this is a required field)
- **inject**: the target of the injection (this is optional) - this can be a string selector, a DOM element, or a jquery object
- **tab**: add this field if you want your injection to be a separate tab in the config dialog
     - name: the unique identifier of the tab
     - label: the user facing text of the tab
     - icon: the icon of the tab (eg. "fas fa-cog")

#### Flag Keys:
**Note**: every key except the reserved ones listed below will be the key of the flag you are injecting, below is described the data structure of the flag object
 - **type**: the type of the input, the valid types are: checkbox, text, select, color, number, range, filepicker (you can provide the filepicker type by separating it with a . eg. filepicker.imagevideo)
 - **label**: the user facing text of the flag
 - **default**: the default value of the flag (this is optional)
 - **options**: the options of the input (probvide an array of key,value pairs) - this is only valid for select
 - **placeholder**: the placeholder of the flag (eg. "Enter a value")
 - **min**: the minimum value of the flag - this is only valid for range
 - **max**: the maximum value of the flag - this is only valid for range

#### Practical Example:

```js
injectConfig.quickInject([{documentName: "Token"},{documentName: "Tile"}],{
      moduleId : "myModule",
      tab: {
          name: "myModule",
          label: "My Module",
          icon: "fas fa-cog"
      },
      "tokenColor": {
          "type": "color",
          "label": "Token Color",
          "default": "#ffffff",
      },
      "tokenRange" : {
          "label" : "Token Range",
          "type" : "range",
          "min" : 0,
          "max" : 100,
          "default" : 0,
      },
      "tokenCheck" : {
          type : "checkbox",
          label : "Token Check",
          default : true
      },
      "tokenimg": {
          type : "filepicker",
          label : "Token Image",
          default : "",
          placeholder : "Token Image"
      },
      "tokenType" : {
          "type" : "select",
          "label" : "Token Type",
          "options" : {
              "string" : "String",
              "number" : "Number",
              "boolean" : "Boolean"
          }
      }

  });
  ```
  
  ### How to include in your project:
  
  Simply copy paste the contents of `injectConfig.js` into your project or add the file directly
