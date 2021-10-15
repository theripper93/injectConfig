/* injectConfig library by @theripper93
*
* License: MIT https://opensource.org/licenses/MIT
*
*  This library is used to inject your module flags into the config of placeable objects.
*  Since the inject method returns the jquery element, you could pass an undefined app, and inject it into any html element. (eg. a dialog)
*  **HOW TO USE:**
*  
*  Methods:
*  - injectConfig.inject(app, html, data, object)
*   - app: the app object
*   - html: the html of the config dialog
*   - data: the data that contains the information to be injected (see data structure below)
*   - object: the object that is being configured (this is not required, by default app.object is used)
*  Example:
*  Hooks.on("renderTokenConfig", (app,html) => {injectConfig.inject(app, html, data, app.object)};
*
*  - injectConfig.quickInject(targets, data)
*   - targets: the targets that are being configured, this can be a single object or an array of objects
*       the structure of the objcet is as follows {documentName, inject} where documentName is the name of the document (eg "Token")
*       and inject is the target of the injection (this is optional), see data structure below for details on the inject key
*   - data: the data that contains the information to be injected (see data structure below)
*  Example:
*  injectConfig.quickInject([{documentName: "Token"},{documentName: "Tile"}],data);
*  Note: This method will automatically create the hooks for the documentName and inject the data into the config dialog
*
*  Data Structure:
*  
*  Note: every key except the reserved ones listed below will be the key of the flag you are injecting
*  
*  Reserved Keys:
*  - moduleId: the id of the module (this is a required field)
*  - inject: the target of the injection (this is optional) - this can be a string selector, a DOM element, or a jquery object
*  - tab: add this field if you want your injection to be a separate tab in the config dialog
*   - name: the unique identifier of the tab
*   - label: the user facing text of the tab
*   - icon: the icon of the tab (eg. "fas fa-cog")
*  
*  Flag Keys:
*  Note: every key except the reserved ones listed below will be the key of the flag you are injecting, below is described the data structure of the flag object
*   - type: the type of the input, the valid types are: checkbox, text, select, color, number, range, filepicker (you can provide the filepicker type by separating it with a . eg. filepicker.imagevideo)
*   - label: the user facing text of the flag
*   - default: the default value of the flag (this is optional)
*   - options: the options of the input (probvide an array of key,value pairs) - this is only valid for select
*   - placeholder: the placeholder of the flag (eg. "Enter a value")
*   - min: the minimum value of the flag - this is only valid for range
*   - max: the maximum value of the flag - this is only valid for range
*
*  Practical Example:

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
*/


var injectConfig = {
    inject: function injectConfig(app,html,data,object){
        object = object || app.object;
        const moduleId = data.moduleId;
        let injectPoint
        if(typeof data.inject === "string"){
            injectPoint = html.find(data.inject).first().closest(".form-group");
        }else{
            injectPoint = data.inject;
        }
        injectPoint = injectPoint ? $(injectPoint) : (data.tab ? html.find(".tab").last() : html.find(".form-group").last());
        let injectHtml = "";
        for(const [k,v] of Object.entries(data)){
            if(k === "moduleId" || k === "inject" || k === "tab") continue;
            const elemData = data[k];
            const flag = "flags." + moduleId + "." + (k || "");
            const flagValue = object?.getFlag(moduleId, k) ?? elemData.default ?? getDefaultFlag(k);
            switch(elemData.type){
                case "text":
                    injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <input type="text" name="${flag}" value="${flagValue}" placeholder="${v.placeholder || ""}">
                    </div>`;
                    break;
                case "number":
                    injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <input type="number" name="${flag}" value="${flagValue}" placeholder="${v.placeholder || ""}">
                    </div>`;
                    break;
                case "checkbox": 
                    injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <input type="checkbox" name="${flag}" ${flagValue ? "checked" : ""}>
                    </div>`;
                    break;
                case "select":
                    injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                            <select name="${flag}">`;
                    for(const [i,j] of Object.entries(v.options)){
                        injectHtml += `<option value="${i}" ${flagValue === i ? "selected" : ""}>${j}</option>`;
                    }
                    injectHtml += `</select>
                    </div>`;
                    break;
                case "range":
                    injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                        <div class="form-fields">
                            <input type="range" name="${flag}" value="${flagValue}" min="${v.min}" max="${v.max}">
                            <span class="range-value">${flagValue}</span>
                        </div>
                    </div>`;
                    break;
                case "color":
                    injectHtml += `<div class="form-group">
                        <label for="${k}">${v.label || ""}</label>
                        <div class="form-fields">
                            <input class="color" type="text" name="${flag}" value="${flagValue}">
                            <input type="color" data-edit="${flag}" value="${flagValue}">
                        </div>
                    </div>`;
                    break;
                case "custom":
                    injectHtml += v
                    break;
            }
            if(elemData.type.includes("filepicker")){
                const fpType = elemData.type.split(".")[1] || "imagevideo";
                injectHtml += `<div class="form-group">
                <label for="${k}">${v.label || ""}</label>
                <div class="form-fields">     
                    <button type="button" class="file-picker" data-type="${fpType}" data-target="${flag}" title="Browse Files" tabindex="-1">
                        <i class="fas fa-file-import fa-fw"></i>
                    </button>
                    <input class="image" type="text" name="${flag}" placeholder="${v.placeholder || ""}" value="${flagValue}">
                </div>
            </div>`;
            }
        }
        injectHtml = $(injectHtml);
        injectHtml.on("click", ".file-picker", _bindFilePicker);
        injectHtml.on("change", `input[type="color"]`, _colorChange);
        if(data.tab){
            const injectTab = createTab(data.tab.name, data.tab.label, data.tab.icon).append(injectHtml);
            injectPoint.after(injectTab);
            html.find(".item").css({"min-width": "fit-content"})
            app?.setPosition({"height" : "auto", "width" : "auto"});
            return injectHtml;
        }
        injectPoint.after(injectHtml);
        app?.setPosition({"height" : "auto"});
        return injectHtml;

        function createTab(name,label,icon){
            const tabs = html.find(".sheet-tabs").last();
            const tab = `<a class="item" data-tab="${name}"><i class="${icon}"></i> ${label}</a>`
            tabs.append(tab);
            const tabContainer = `<div class="tab" data-tab="${name}"></div>`
            return $(tabContainer);
        }
    
    
        function getDefaultFlag(inputType){
            switch(inputType){
                case "number":
                    return 0;
                case "checkbox":
                    return false;
            }
            return "";
        }
    
        function _colorChange(e){
            const input = $(e.target);
            const edit = input.data("edit");
            const value = input.val();
            injectHtml.find(`input[name="${edit}"]`).val(value);
        }
    
        function _bindFilePicker(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const input = $(button).closest(".form-fields").find("input") || null;
        const options = {
            field: input[0],
            type: button.dataset.type,
            current: input.val() || null,
            button: button,
        }
        const fp = new FilePicker(options);
        return fp.browse();
        }
    
    },
    quickInject: function quickInject(injectData, data){
        injectData = Array.isArray(injectData) ? injectData : [injectData];
        for(const doc of injectData){
            let newData = data
            if(doc.inject){
                newData = JSON.parse(JSON.stringify(data))
                data.inject = doc.inject;
            }
            Hooks.on(`render${doc.documentName}Config`, (app,html)=>{ injectConfig.inject(app,html,newData) });
        }

    }
}