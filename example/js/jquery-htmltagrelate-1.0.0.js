/*
* jQuery HTMLTagFriend Plugin
* Copyright (c) 2013. Christopher Phelefu (https://github.com/PhronesisWeb/HTMLTagFriend)
* Version : 1.0.0
*
*/
(function ($) {
    var Relationships = [],
        settings;

    $.fn.htmltagrelate = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.HTMLTagFriend');
        }
    };

    //plugin methods
    var methods = {
        init: function (options) {
            settings = $.extend({}, $.fn.htmltagrelate.defaults, options);
            var relateElements = $('*[data-relate-parent], *[data-relatejson]'),
                that;

            $.each(relateElements, function (key) {
                initRelationships(this);
            });
        },
        clearRelationship: function () {
            return true;
        },
        loadRelationship: function (content) {
            return true;
        },
        getRelationship: function () {
            return true;
        },
        restart: function () {
            return true;
        }
    };

    function initRelationships(inputVal) {
        var input = (typeof inputVal.target === 'undefined') ? inputVal : inputVal.target,
            that = $(input),
            i,
            relatejson = that.data('relatejson'),temp;

        if (typeof fullrelatedesc !== 'undefined') {
            fullrelatedesc = JSON.stringify(eval("(" + relatejson + ")"));
            fullrelatedesc = JSON.parse(relatejson);

             $.each(relatejson, function(i, item) {
                 temp = getRelationshipFromJSON(that, item); 
                 if (temp != null && typeof temp !== 'undefined') {
                    Relationships.push(temp);
                }          
            });
        }

        if (typeof that.data('relate-parent') !== 'undefined') {
            temp = getRelationshipFromElement(that);
            if (temp != null && typeof temp !== 'undefined') {
                Relationships.push(temp);
            }
        }

        //checking condition
        jQuery.each(Relationships, function (index, Relationship) {
            ProcessRelationship(Relationship);
        });
    }

    function getRelationshipFromJSON(inputVal, JSONData){
        var input = (typeof inputVal.target === 'undefined') ? inputVal : inputVal.target,
        that = $(input),
        Relationship = new Object();
        
        Relationship.type = "json";
        Relationship.child = that;
        Relationship.parent = $(JSONData.relate_parent);
        Relationship.parentEvent = JSONData.relate_parent_event;
        Relationship.values =  JSONData.relate_values;
        Relationship.action = JSONData.relate_action;
        Relationship.attrib = JSONData.relate_attrib;
        Relationship.attribValueTrue = JSONData.relate_attribvalue_true;
        Relationship.attribValueFalse = JSONData.relate_attribvalue_false;
        Relationship.functionTrue = JSONData.relate_function_true;
        Relationship.functionFalse = JSONData.relate_function_true;
        Relationship.parentinittrigger = JSONData.relate_parentinittrigger;
        return ValidateRelationship(Relationship);
    }

    function getRelationshipFromElement(inputVal) {
        var input = (typeof inputVal.target === 'undefined') ? inputVal : inputVal.target,
        that = $(input),
        Relationship = new Object();
        
        Relationship.type="html";
        Relationship.child = that;
        Relationship.parent = $(that.data('relate-parent'));
        Relationship.parentEvent = that.data('relate-parent-event');
        Relationship.values =  that.data('relate-values');
        Relationship.action = that.data('relate-action');
        Relationship.attrib = that.data('relate-attrib');
        Relationship.attribValueTrue = that.data('relate-attribvalue-true');
        Relationship.attribValueFalse = that.data('relate-attribvalue-false');
        Relationship.functionTrue = that.data('relate-function-true');
        Relationship.functionFalse = that.data('relate-function-false');
        Relationship.parentinittrigger = that.data('relate-parentinittrigger');
        return ValidateRelationship(Relationship);
    }

    function ValidateRelationship(ff){
        var Relationship = ff,
        that = Relationship.child;
        if(typeof Relationship.parent === 'undefined') {
            reportError('Relationship is missing parent attribute.', that);
            return null;
        }
        if(typeof Relationship.parentEvent === 'undefined') {
            if(Relationship.parent.is('input, textarea')) {
               Relationship.parentEvent = 'keyup';
             } else {
                 Relationship.parentEvent = 'change';
             }
        }
        if (typeof Relationship.values !== 'undefined') {
            Relationship.values = getArrayOfString(Relationship.values);
        }
        if(typeof Relationship.action === 'undefined') {
            if(Relationship.parent.is('select')) {
                Relationship.action = 'hideoption';
                Relationship.parentinittrigger = "change";
            } 
        }
        return Relationship;
    }

    function getArrayOfString(str){
        var temp;
        temp = str.split(',');
         for(var i = temp.length; i<temp.length; i++){
                temp[i] = temp[i].trim();
        }
        return temp;
    }

    function ProcessRelationship(Relationship) {
        if (Relationship === null) { 
            $.error('This relationship is not valid. Below are the details of the relationship.');
            console.log(Relationship);
            return true;
        }
        Relationship.parent.on(Relationship.parentEvent, function() { 
           //checking condition
            var trueCond = (jQuery.inArray($(this).val(), Relationship.values) !== -1 || typeof Relationship.values === 'undefined');

            if(Relationship.parent.is('select')) { trueCond = true; Relationship.executedTrue = false; }
            
            if((trueCond && Relationship.executedTrue === true)  || (!trueCond && Relationship.executedTrue === false)) {
                    return;
            }


            if(trueCond) {                
                Relationship.executedTrue = true;
                 if(typeof Relationship.action !== 'undefined') {
                    doFriendsAction(Relationship, false);
                }
                if(typeof Relationship.attribValueTrue !== 'undefined'){
                    doFriendsAttributeChange(Relationship, true);
                }
                if(typeof Relationship.functionTrue !== 'undefined'){ 
                    doFriendsFunction(Relationship, true);
                }
            } else { 
                Relationship.executedTrue = false;
                if(typeof Relationship.action !== 'undefined') {
                    doFriendsAction(Relationship, true);
                }
                if(typeof Relationship.attribValueFalse !== 'undefined'){
                    doFriendsAttributeChange(Relationship, false);
                }
                if(typeof Relationship.functionFalse !== 'undefined'){
                    doFriendsFunction(Relationship, false);
                }
            }
        });

        if(typeof Relationship.parentinittrigger !== 'undefined'){
            Relationship.parent.trigger(Relationship.parentinittrigger);
        }
    }


    function reportError(errorMsg, element){
        $.error(errorMsg + ' ::::: Element ID is #'+element.attr('ID'));
    }

    function getElementValue (element) {
        return element.val();
    }

    
    function doFriendsAction (Relationship, isundo) {
        var temp;
        undo = typeof isundo !== 'undefined' ? isundo : false;
        switch (Relationship.action) {
            case 'hide' : if(undo) { Relationship.child.show(); } else { Relationship.child.hide(); } break;
            case 'show' : if(undo) { Relationship.child.hide(); } else { Relationship.child.show(); } break;
            case 'disable' :
            case 'disabled' : if(undo) { Relationship.child.prop('disabled', false); } else { Relationship.child.prop('disabled', true); } break;
            case 'checked' : if(undo) { Relationship.child.prop('checked', false); } else { Relationship.child.prop('checked', true); } break;
            case 'hideoption': 
                var tempArray;
                if (Relationship.child.data('originalOptions') === null || typeof Relationship.child.data('originalOptions') === 'undefined') {
                    var options = [];
                    Relationship.child.find('option').each(function () {
                        options.push({value: $(this).val(), dataParentValues: $(this).attr('data-parent-values'), text: $(this).text(), isselected : ($(this).is(":selected") ? true : false)  });
                    });
                    Relationship.child.data('originalOptions', options);
                }
                tempArray = Relationship.child.data('originalOptions').filter( function (val) {
                    return  (getArrayOfString(val.dataParentValues).indexOf(Relationship.parent.val()) !== -1);
                });
                Relationship.child.find('option[value!="-1"]').remove();
                $.each(tempArray, function (index) {
                    Relationship.child.append('<option value="' + tempArray[index].value + '" data-parent-values="' + tempArray[index].dataParentValues + '">' + tempArray[index].text + '</option>');
                });
                break;
        }
    }

    function doFriendsAttributeChange (Relationship, dotrue) {
        var val = dotrue ? Relationship.attribValueTrue : Relationship.attribValueFalse;
        Relationship.child.attr(Relationship.attrib, val);
    }


    function doFriendsFunction (Relationship, dotrue) {
        eval((dotrue ? Relationship.functionTrue : Relationship.functionFalse));
        //var func2 = (typeof Relationship.function === 'function') ? Relationship.function : emptyFunc;
        //func2.apply(Relationship.child);
    }

    function emptyFunc() {}

    // define default options
    $.fn.htmltagrelate.defaults = {
        
    }
})(jQuery);

