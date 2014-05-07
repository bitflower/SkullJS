/*! bitflower SkullJS 
 * Version: 1.3
 * Author: Matthias Max
 * Copyright bitflower 2014
 *
 * Change Log:
 * -----------
 * 2014-05-07:
 * - loadImages: delete image from array after load, error or missing url
 *
 * 2014-05-05:
 * - loadImages: FireFox Bug wenn img.src = "" gesetzt wurde
 *
 * 2014-04-23:
 * - addImageToLoad: prüfen, ob Container/Image paar bereits hinzugefügt
 * - getTemplate (Mustache)
 *
 * 2014-04-21:
 * - loadImages: class & id checken bei IMG
 * - isJSON Funktion
 *
 * 2014-04-11:
 * - partition Funktion zum splitten von Arrays
 *
 * 2014-04-02:
 * - Variable für Wordpress Template URL
 *
 * 2014-02-21:
 * - loadImages: Option to load into DIV container or IMG
 * - pad (neu): Leading zero for number
 * - get Footer-/Header Height mit outerHoight
 * - round (neu)
*/
var skullJS = (function () {

    // Apple/iOS
    var IsiPhone = navigator.userAgent.indexOf("iPhone") != -1;
    var IsiPod = navigator.userAgent.indexOf("iPod") != -1;
    var IsiPad = navigator.userAgent.indexOf("iPad") != -1;
    var IsSafari = navigator.userAgent.indexOf("Safari") != -1;
    var IsAndroid = navigator.userAgent.toLowerCase().indexOf('android') >= 0;

    // Width & Height calculation variables
    var jqHeader; // jQuery Object
    var jqFooter; // jQuery Object
    var intVerticalBuffer = 0;

    // bfLoadImages
    var arrImagesToLoad = [];

    // Wordpress spzifisch
    var strWPUrl;

    // private functions

    // #### HELPER FUNCTIONS ####

    // Fügt dem Wert ein Unit hinzu oder nicht
    function padUnit(value, unit) {
        if (!unit) {
            return value;
        } else {
            return value + unit;
        }
    }


    return { // public interface

        // #### WIDTH & HEIGHT CALCULATION ####

        // Setter
        setHeader: function (jqObj) {
            jqHeader = jqObj;
        },
        setFooter: function (jqObj) {
            jqFooter = jqObj;
        },
        setVerticalBuffer: function (value) {
            intVerticalBuffer = value;
        },


        // Functions
        getWindowHeight: function (unit) {
            return padUnit($(window).height(), unit);
        },

        getWindowWidth: function (unit) {
            return padUnit($(window).width(), unit);
        },

        getHeaderHeight: function (unit) {

            var height = 0;
            jqHeader.each(function (i) {
                height = height + $(this).outerHeight();
            });

            return padUnit(height, unit);
        },

        getFooterHeight: function (unit) {

            var height = 0;
            jqFooter.each(function (i) {
                height = height + $(this).outerHeight();
            });

            return padUnit(height, unit);
        },

        getContentHeight: function (unit) {

            var height = 0;
            var heightWindow = this.getWindowHeight();
            var heightHeader = this.getHeaderHeight();
            var heightFooter = this.getFooterHeight();

            height = heightWindow - heightHeader - heightFooter - intVerticalBuffer;

            return padUnit(height, unit);
        },
        
        onWindowResized: function (callback) {
        
            function resizedw(){
                if (typeof(callback) == "function") {
                    callback();
                }
            }
            
            var doit;
            window.onresize = function(){
              clearTimeout(doit);
              doit = setTimeout(resizedw, 150);
            };  
            
        },
        
        // #### APPLE / iOS ####

        isIOS: function () {
            return IsiPhone || IsiPad || IsiPod;
        },
        isIPad: function () {
            return IsiPad;
        },
        isIPod: function () {
            return IsiPod;
        },
        isIPhone: function () {
            return IsiPhone;
        },
        isAppleBrower: function() {
            return IsiPhone || IsiPad || IsiPod || IsSafari;
        },
        getClickEventName: function () {
            if (this.isIOS()) {
                return "touchstart";
            } else {
                return "click";
            }   
        },


        // #### ANDOIRD ####
        isAndroid: function() {
            return IsAndroid;
        },


        // #### bfFadeInChain ####
        /* 
        1. Alle gewünschten Elemente mit der Klasse bfFadeInChain bestücken
        2. Funktion aufrufen
        3. optional Callback Funktion mitgeben
        */
        fadeInChain: function (speed, callback) {
            var len = $('.bfFadeInChain').length;
            $('.bfFadeInChain').each(function (index) {
                $(this).delay(speed * index).queue(function () {
                    $(this).addClass('bfFadeIn').dequeue();
                    if (index == len - 1) {
                        if (typeof (callback) == "function") {
                            callback();
                        }
                    }
                });
            });
        },



        // #### bfLoadImages ####
        /* Parameter:
        /* callbackProgress: Function, die nach jedem Laden eines Bildes aufgerufen wird ( function(bildNr, bilderGesamt) )
        /*
        */
        addImageToLoad: function (containerSelector, url, additionalInfo, kategorie) {

            if (!kategorie) {
                kategorie = 'all';
            }

            if (!arrImagesToLoad[kategorie]) {
                arrImagesToLoad[kategorie] = [];
            }

            for (i = 0; i < arrImagesToLoad[kategorie].length; ++i) {
                if (arrImagesToLoad[kategorie][i][0] == containerSelector && arrImagesToLoad[kategorie][i][1] == url) {
                    return;
                }
            }
            arrImagesToLoad[kategorie].push([containerSelector, url, additionalInfo]);
        },
        loadImages: function (index, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject, kategorie) {

            var me = this;

            if (!kategorie) {
                kategorie = 'all';
            }

            if (index >= arrImagesToLoad[kategorie].length) {
			    if (typeof(callback) == "function") {
			        callback();
			    }
			    return;
			}
            //create image object
            var image = new Image();

            // Bildinfo
            var objBildInfo = arrImagesToLoad[kategorie][index];

            // Additional Info
            var objAdditional = objBildInfo[2];

            image.onerror = function() {
                //alert('Fehler beim Laden des Bildes: ' + image.src);

                arrImagesToLoad[kategorie].splice(index, 1);

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad[kategorie].length, objAdditional);
                }

                //now load next image
                me.loadImages(index , indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject, kategorie);
            }

            //bind load event
            image.onload = function () {

                if (!returnObject) {
                    // abhängig vom Container-Typ, das Bild als src oder background-ime

                    var tagName;
                    var selector;
                    if ($('.' + objBildInfo[indexImgCSSClass]).length > 0) {
                        tagName = $('.' + objBildInfo[indexImgCSSClass]).get(0).tagName;
                        selector = '.';
                    } else {
                        if ($('#' + objBildInfo[indexImgCSSClass]).length > 0) {
                            tagName = $('#' + objBildInfo[indexImgCSSClass]).get(0).tagName;
                            selector = '#';
                        }
                    }

                    switch (tagName) {
                        case 'DIV':

                            // Bild-DIV das Bild als background setzen
                            $('div' + selector + objBildInfo[indexImgCSSClass]).css("background-image", "url(" + objBildInfo[indexImgURL] + ")");

                            break;

                        case 'IMG':
                            $('img' + selector + objBildInfo[indexImgCSSClass]).attr("src", objBildInfo[indexImgURL]);

                            break;

                        default:
                            break;

                    }
                }

                arrImagesToLoad[kategorie].splice(index, 1);

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad[kategorie].length, image, objAdditional);
                }

                //now load next image
                me.loadImages(index, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject, kategorie);
            }

            //add image path
            try {
                if (objBildInfo[indexImgURL] != '') {
                    image.src = objBildInfo[indexImgURL];
                } else {

                    arrImagesToLoad[kategorie].splice(index, 1);

                    if (typeof (callbackProgress) == "function") {
                        callbackProgress(index + 1, arrImagesToLoad[kategorie].length, null, objAdditional);
                    }

                    //now load next image
                    me.loadImages(index, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject, kategorie);
                }
                
            } catch (e) {
                // alert(e);

                arrImagesToLoad[kategorie].splice(index, 1);

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad[kategorie].length, null, objAdditional);
                }

                //now load next image
                me.loadImages(index, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject, kategorie);
            } finally {

            }

        },


        // #### Formatting ####
        pad: function (number, width, padChar) {
            padChar = padChar || '0';
            number = number + '';
            return number.length >= width ? number : new Array(width - number.length + 1).join(padChar) + number;
        },



        // #### MATH #####

        // Round to n decimals
        round: function (number, decimals) {

            switch (decimals) {

                case 1:
                    return Math.round(number * 10) / 10
                    break;

                case 2:
                    return Math.round(number * 100) / 100
                    break;

                case 3:
                    return Math.round(number * 1000) / 1000
                    break;

                default:
                    return Math.round(number * 100) / 100
                    break;

            }

        },

        // #### WORDPRESS SPEZIFISCH ####

        setWPUrl: function (value) {
            strWPUrl = value;
        },
        getWPUrl: function (value) {
            return strWPUrl;
        },


        // #### ARRAYS / JSON ####

        // Array in Teilarrays zerlegen
        sliceArray: function (items, chunkSize) {
            var arrOut = [];
            while (items.length) {
                arrOut.push(items.splice(0, chunkSize))
            }
            return arrOut;
        },

        // Prüfen ob String ein JSON ist
        isJsonString: function (str) {
            try {
                JSON.parse(str);
            } catch (e) {
                    return false;
            }
        return true;
        },


        // #### TEMPLATES ####

        // Template aus SessionStorage lesen und laden, wenn noch nicht geschehen
        getTemplateFromStorage: function (name, path, callback) {
            var stoTest = sessionStorage.getItem(name);
            if (stoTest == null) {
                // Mustache Template laden
                $.get(path, function (template) {
                    sessionStorage.setItem(name, template);
                    if (callback && typeof (callback) === "function") {
                        callback(template);
                    }
                });
            } else {
                if (callback && typeof (callback) === "function") {
                    callback(stoTest);
                }
            }
        }

    };



})();