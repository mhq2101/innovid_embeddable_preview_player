
var PreviewPlayer = function (getAdUrl) {
    var that = this,
        enabledDevices = [],
        defaultOrientation = PreviewPlayer.Orientation.Landscape,
        defaultDevice = null,
        currentOrientation,
        currentDevice,
        getDeviceAdUrl = {
            desktop: getAdUrl.forDesktop,
            smartphone: getAdUrl.forMobile,
            tablet: getAdUrl.forMobile
        };
    console.log(getAdUrl.forDesktop())
    // for preloading images
    var smartphoneImage,
        tabletImage;
    preloadDeviceImages();

    this.displayIn = function (container) {
        if (defaultDevice === null && this.devices().length >= 0) defaultDevice = this.devices()[0];

        currentDevice = this.devices().length > 0 ? defaultDevice : null;
        currentOrientation = defaultOrientation;

        var buttonsContainer = $('<div id="buttonsContainer"></div>'),
            // qrCodeContainer = $('<div id="QRCodeContainer"></div>'),
            deviceContainer = $('<div id="deviceContainer"></div>');

        buttonsContainer.appendTo(container);
        // qrCodeContainer.appendTo(container);
        deviceContainer.appendTo(container);

        var buttonsContainerWidth = 0;
        this.devices().forEach(function (device, index, devices) {
            var deviceElem = $('<div id="' + device + '"></div>');

            deviceElem.addClass(device)
                .text(capitalizeFirstLetter(device))
                .appendTo(buttonsContainer);

            if (!isLastDevice()) {
                var separator = $('<div id="separator"></div>');

                separator.appendTo(buttonsContainer);

                buttonsContainerWidth += separator.width() + parseInt(separator.css('margin-left'), 10)
                    + parseInt(separator.css('margin-right'), 10);
            }

            buttonsContainerWidth += deviceElem.width() + parseInt(deviceElem.css('margin-left'), 10);

            function isLastDevice() { return index === devices.length - 1; }
            function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
        });

        var orientationSwitchElem = $('<div id="orientationSwitch"></div>');
        orientationSwitchElem.appendTo(buttonsContainer);

        buttonsContainerWidth += orientationSwitchElem.width() + parseInt(orientationSwitchElem.css('margin-left'), 10);
        buttonsContainer.width(buttonsContainerWidth);
        buttonsContainer.css('margin-left', (-1 * (buttonsContainerWidth / 2) + orientationSwitchElem.width()) + 'px');


        var playerContainer = $('<div id="playerContainer"></div>');
        playerContainer.appendTo(deviceContainer);

        var spinner = $('<div id="spinner"></div>');
        spinner.appendTo(playerContainer);
        spinner.hide();

        var iframe = $('<iframe id="previewbox"/>');
        allowFullscreenOnIframe(iframe);

        playerContainer.append(iframe);
        // onPreviewFrameSourceChange($(iframe[0]));

        orientationSwitchElem.click(function () {
            that.toggleOrientation();
        });

        this.devices().forEach(function (device) {
            $('#' + device).click(function (event) {
                if (event.target.className === "selected") {
                    return;
                }
                that.switchDevice(device);
            });
        });

        if (currentDevice) {
            deselectAllDevices();
            selectDevice(currentDevice);
            playerContainer.addClass(currentDevice + ' ' + currentOrientation);
            orientationSwitchElem.addClass(currentOrientation);

            this.switchDevice(currentDevice);
        } else {
            buttonsContainer.hide();
            deviceContainer.hide();
        }

        function allowFullscreenOnIframe(iframe) {
            iframe.attr('allowfullscreen', 'true');
        }
    };

    this.switchDevice = function (device) {
        var prevDevice = currentDevice;
        currentDevice = device;

        deselectAllDevices();
        selectDevice(device);

        var playerContainer = $('#playerContainer');
        playerContainer.addClass("animate");

        this.devices().forEach(function (dev) {
            playerContainer.removeClass(dev);
        });

        playerContainer.addClass(device);

        var iframe = $('#previewbox'),
            // adUrl = 'http://localhost:8080/?playerID=config&tag=https%3A%2F%2Frtr.innovid.com%2Fr1.5a4fc10f834029.15254086'
            adUrl = getDeviceAdUrl[currentDevice]();

        if (adUrl) {
             
                iframe.attr('src', adUrl);
                var loading = {
                    desktop: hideAndShowDesktopPlayer,
                    smartphone: hideView,
                    tablet: hideView
                };

                loading[currentDevice]();

        } else {
            iframe.css('background-color', '#202020');
            hideAndShowDesktopPlayer();
        }

        function hideView() {
            if (cameFromDesktop()) {
                playerContainer.removeClass(PreviewPlayer.Orientation.Landscape)
                    .addClass(defaultOrientation);

                $('#orientationSwitch')
                    .removeClass(PreviewPlayer.Orientation.Landscape)
                    .addClass(defaultOrientation);
            }

            // $('#spinner').show();
            // iframe.css("visibility", "hidden");
        }

        function showView() {
            // $('#spinner').hide();
            // iframe.css("visibility", "visible");
        }

        function cameFromDesktop() {
            return prevDevice === PreviewPlayer.Devices.Desktop;
        }

        function hideAndShowDesktopPlayer() {
            playerContainer.removeClass(PreviewPlayer.Orientation.Portrait)
                .addClass(PreviewPlayer.Orientation.Landscape);
            playerContainer.hide();

            setTimeout(function () {
                showView();
                playerContainer.show();
            }, 500);
        }
    };

    this.enableDevices = function (smartphone, tablet, desktop) {
        if (smartphone === '1' || typeof smartphone === 'undefined') {
            enableDevice(PreviewPlayer.Devices.Smartphone);
        }
        if (tablet === '1' || typeof tablet === 'undefined') {
            enableDevice(PreviewPlayer.Devices.Tablet);
        }
        // if (desktop === '1' || typeof desktop === 'undefined') {
        //     enableDevice(PreviewPlayer.Devices.Desktop);
        // }
    };

    this.setDefaultOrientation = function (orientation) {
        if (typeof orientation === 'undefined') return;

        if (hasOwnValue(PreviewPlayer.Orientation, orientation)) {
            defaultOrientation = orientation;
        }
    };

    this.setDefaultDevice = function (device) {
        if (typeof device === 'undefined') return;

        if (hasOwnValue(this.devices(), device)) {
            defaultDevice = device;
        }
    };

    this.devices = function () {
        return enabledDevices;
    };


    this.toggleOrientation = function () {
        var changeOrientation = {};
        changeOrientation[PreviewPlayer.Orientation.Landscape] = function () {
            currentOrientation = PreviewPlayer.Orientation.Portrait;
        };
        changeOrientation[PreviewPlayer.Orientation.Portrait] = function () {
            currentOrientation = PreviewPlayer.Orientation.Landscape;
        };

        changeOrientation[currentOrientation]();

        $('#playerContainer')
            .addClass("animate")
            .toggleClass(PreviewPlayer.Orientation.Landscape + " " + PreviewPlayer.Orientation.Portrait);

        $("#orientationSwitch")
            .toggleClass(PreviewPlayer.Orientation.Landscape + " " + PreviewPlayer.Orientation.Portrait);
    };

    function enableDevice(device) {
        enabledDevices.push(device);
    }

    function deselectAllDevices() {
        that.devices().forEach(function (device) {
            deselectDevice(device);
        });
    }

    function deselectDevice(device) {
        $('#' + device).removeClass("selected");
    }

    function selectDevice(device) {
        var setOrientationVisibility = {
            desktop: hideOrientationSwitch,
            smartphone: showOrientationSwitch,
            tablet: showOrientationSwitch
        };



        $('#' + device).addClass("selected");
        setOrientationVisibility[device]();

        function hideOrientationSwitch() { $("#orientationSwitch").hide(); }
        function showOrientationSwitch() { $("#orientationSwitch").show(); }

        function hideQRCode() { $("#QRCodeContainer").hide(); }
        function showQRCode() { $("#QRCodeContainer").show(); }
    }

    function preloadDeviceImages() {
        smartphoneImage = new Image();
        smartphoneImage.src = "../img/smartphone.png";
        tabletImage = new Image();
        tabletImage.src = "../img/tablet.png";
    }

    function hasOwnValue(obj, val) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && obj[prop] === val) {
                return true;
            }
        }

        return false;
    }
};

PreviewPlayer.Orientation = {
    Landscape: 'landscape',
    Portrait: 'portrait'
};

PreviewPlayer.Devices = {
    Smartphone: 'smartphone',
    Tablet: 'tablet',
    Desktop: 'desktop'
};