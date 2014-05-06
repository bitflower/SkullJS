/*! bitflower bfApp 
 * Version: 1.0
 * Author: Matthias Max
 * Copyright bitflower 2014
 *
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
                height = height + $(this).height();
            });

            return padUnit(height, unit);
        },

        getFooterHeight: function (unit) {

            var height = 0;
            jqFooter.each(function (i) {
                height = height + $(this).height();
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
        addImageToLoad: function (containerSelector, url) {
            arrImagesToLoad.push([containerSelector, url]);
        },
        loadImages: function (index, indexImgURL, indexImgCSSClass, callback, callbackProgress) {

            var me = this;

            if (index >= arrImagesToLoad.length) {
			    if (typeof(callback) == "function") {
			        callback();
			    }
			    return;
			}
            //create image object
            var image = new Image(); // document.createElement('img'); //

            // Bildinfo
            var objBildInfo = arrImagesToLoad[index];

            image.onerror = function() {
                //alert('Fehler beim Laden des Bildes: ' + image.src);

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad.length);
                }

                //now load next image
                me.loadImages(index + 1, indexImgURL, indexImgCSSClass, callback, callbackProgress);
            }

            //bind load event
            image.onload = function () {

                if (typeof (callbackProgress) == "function") {
                    callbackProgress(index + 1, arrImagesToLoad.length);
                }

                // Bild-DIV das Bild als background setzen
                $('div.' + objBildInfo[indexImgCSSClass]).css("background-image", "url(" + objBildInfo[indexImgURL] + ")");

                //now load next image
                me.loadImages(index + 1, indexImgURL, indexImgCSSClass, callback, callbackProgress);
            }

            //add image path
            image.src = objBildInfo[indexImgURL];

        }


    };



})();