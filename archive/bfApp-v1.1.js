/*! bitflower bfApp 
 * Version: 1.1
 * Author: Matthias Max
 * Copyright bitflower 2014
 *
 * Change Log:
 * -----------
 * 2014-02-21:
 * - loadImages: Option to load into DIV container or IMG
 * - pad (neu): Leading zero for number
 * - get Footer-/Header Height mit outerHoight
 * - round (neu)
*/
var bfApp = (function () {

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
        addImageToLoad: function (containerSelector, url, additionalInfo) {
            arrImagesToLoad.push([containerSelector, url, additionalInfo]);
        },
        loadImages: function (index, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject) {

            var me = this;

            if (index >= arrImagesToLoad.length) {
			    if (typeof(callback) == "function") {
			        callback();
			    }
			    return;
			}
            //create image object
            var image = new Image();

            // Bildinfo
            var objBildInfo = arrImagesToLoad[index];

            // Additional Info
            var objAdditional = objBildInfo[2];

            image.onerror = function() {
                //alert('Fehler beim Laden des Bildes: ' + image.src);

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad.length, objAdditional);
                }

                //now load next image
                me.loadImages(index + 1, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject);
            }

            //bind load event
            image.onload = function () {

                if (!returnObject) {
                    // abhängig vom Container-Typ, das Bild als src oder background-ime
                    switch ($('.' + objBildInfo[indexImgCSSClass]).get(0).tagName) {
                        case 'DIV':

                            // Bild-DIV das Bild als background setzen
                            $('div.' + objBildInfo[indexImgCSSClass]).css("background-image", "url(" + objBildInfo[indexImgURL] + ")");

                            break;

                        case 'IMG':
                            $('img.' + objBildInfo[indexImgCSSClass]).attr("src", objBildInfo[indexImgURL]);

                            break;

                        default:
                            break;

                    }
                }

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad.length, image, objAdditional);
                }

                //now load next image
                me.loadImages(index + 1, indexImgURL, indexImgCSSClass, callback, callbackProgress, returnObject);
            }

            //add image path
            image.src = objBildInfo[indexImgURL];

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

        }


    };



})();