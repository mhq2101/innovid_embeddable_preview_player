//');\nINSERT INTO ExportRecipients (IdExport, ExportType, Email) Values (@IdExport, 'email', '
window.onload = function () {
    const DEFAULT_VIDEO = 'https://s-static.innovid.com/media/encoded/07_17/85033/5_source_43523_126396.mp4';
    const CONFIG_LOCATION = 'config/';
    var controls = false;


    //MESSAGE FROM PARENT EVENT LISTENER
    var eventMethod = window.addEventListener
        ? "addEventListener"
        : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent"
        ? "onmessage"
        : "message";

    //MESSAGE EVENT HANDLER
    eventer(messageEvent, function (e) {
        // if (e.data === 'skipTrigger') {
        //     player.trigger('vast.adEnd');

        // } else if (e.data === 'replayTrigger') {
        //     var div = $("<div class='vjs-video-container'></div>");
        //     $('.custom-player-wrapper').html(div);
        //     injectCustomCSS(CONFIG_LOCATION + customPlayerID + '.css');
        //     loadPlayerConfig(CONFIG_LOCATION + customPlayerID + '.json');
        // }
    });

    var vars = getUrlVars(),
        customPlayerID = vars.playerID,
        adTagUrl = setTimestamp(decodeURIComponent(vars.tag)),
        player,
        postmsgobj,
        adPluginOpts;

    var heightRatio = $('.vjs-video-container').height() / $(window).height();
    var widthRatio = $('.vjs-video-container').width() / $(window).width();

    window.addEventListener("message", updateCustomPlayer, false);

    if (customPlayerID) {
        console.log("customPlayerID: ", customPlayerID);
        injectCustomCSS(CONFIG_LOCATION + customPlayerID + '.css');
        loadPlayerConfig(CONFIG_LOCATION + customPlayerID + '.json');
    } else {
        invalidConfidHndlr()
    }



    function invalidConfidHndlr() {
        $('.custom-player-wrapper').html('Error validating custom Player ID');
    }

    function loadPlayerConfig(configPath) {
        $.ajax({
            dataType: "json",
            url: configPath,
            success: function (data) {
                console.log(data);
                initTagWithPlayer(data, adTagUrl);
            },
            error: function () {
                invalidConfidHndlr();
            }
        });
    }

    function injectCustomCSS(cssPath) {
        var ownerDoc = document;
        var linkRef = ownerDoc.createElement("link");
        linkRef.setAttribute("rel", "stylesheet");
        linkRef.setAttribute("type", "text/css");
        linkRef.setAttribute("href", cssPath);
        (ownerDoc.head || ownerDoc.getElementsByTagName("head")[0]).appendChild(linkRef);
    }

    function initTagWithPlayer(config, adTagUrl) {

        if (adTagUrl === 'DEFAULT') {

            var img = $('<div class="vjs-poster" tabindex="-1" aria-disabled="false" style="cursor:default; background-image: url(&quot;./img/posterplaceholder.jpg&quot;);"></div>');
            $('body').html(img)
            return;
        }
        var config = config;
        var iframe;
        var companionPresent;
        var isCompanionOnDom = false;
        function findR1(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][0] === 'r' && arr[i][1] === '1') {
                    var returnVal = arr[i].split(';')[0];
                    return returnVal;
                }

            }
            var img = $('<div class="vjs-poster" tabindex="-1" aria-disabled="false" style="cursor:default; background-image: url(&quot;./img/posterplaceholder.jpg&quot;);"></div>');
            $('body').html(img)
            alert('You have entered an incorrect tag url. Please check your tag')
        }
        var r1 = findR1(adTagUrl.split('/'))
        $.ajax({
            url: 'http://service.innovid.com/s/dataproxy/proxy-cb-nh.php?url=http://studio.innovid.com/data/tags/t/rtr/' + r1,
            type: 'get',
            success: function (data) {
                //validating endcard tag
                if (data.platform.id !== 8) {
                    var img = $("<img class = 'poster' src='img/posterplaceholder.jpg'>")
                    $('body').html(img)
                    alert('This is not a valid end card tag: Please use a standard VAST or VPAID html pre-roll tag');

                }
                else if (data.placements === undefined) {
                    var img = $('<div class="vjs-poster" tabindex="-1" aria-disabled="false" style="cursor:default; background-image: url(&quot;./img/posterplaceholder.jpg&quot;);"></div>');
                    $('body').html(img)
                    alert('You have entered an incorrect tag url. Please check your tag')

                }
                else {
                    $.ajax({
                        type: 'GET',
                        url: adTagUrl,
                        dataType: 'xml',
                        success: function (xml) {
                            var campanion;
                            if  (xml.getElementsByTagName('CompanionAds')[0]) {
                                companion = xml.getElementsByTagName('CompanionAds')[0].getElementsByTagName('IFrameResource')[0]
                                var companionURL = companion.textContent
                            }
                            if (companionURL) {
                                parent.postMessage('showShare', "*");
                                companionPresent = true;
                                iframe = document.createElement('iframe');
                                iframe.src = companionURL;
                                iframe.className = 'end-card-container';
                                iframe.style = 'visibility:hidden';
                                iframe.scrolling = 'no';
                                if (companionPresent) {
                                    $('.custom-player-wrapper').append(iframe);
                                    var adsSetupPlugin = molVastSetup;
                                    if (!player || !player.activePlugins_['ads-setup']) videojs.registerPlugin('ads-setup', adsSetupPlugin);
                                    var videoContainer = document.querySelector('div.vjs-video-container');
                                    createVideoEl(config, videoContainer, function (videoEl) {
                                        adPluginOpts = {
                                            "plugins": {
                                                "ads-setup": {
                                                    "adCancelTimeout": 50000,
                                                    "adsEnabled": true,
                                                    "preferredTech": "html5",
                                                    "nativeControlsForTouch": false,
                                                    "adTagUrl": adTagUrl
                                                }
                                            },
                                            controlBar: {
                                                children: config['player-config'].controlBar.children
                                            }
                                        };

                                        player = videojs(videoEl, adPluginOpts);



                                        if (player) {
                                            player.on('vast.aderror', function (evt) {
                                                var error = evt.error;
                                                if (error && error.message) {
                                                    messages.error(error.message);
                                                }
                                            });
                                            if (!config['player-config'].controlBar.enabled) {
                                                $('.vjs-control-bar').addClass('disable');
                                            }
                                            if (config['player-config'].controlBar['enable-scrub']) {
                                                enableScrubbing();
                                            }
                                            if (!config['player-config'].controlBar['auto-hide'] && config['player-config'].controlBar.enabled) {
                                                $('.vjs-control-bar').addClass('force-enable');
                                            }
                                            applyPlayerStyle(config['player-config'].style);

                                            player.on('vast.adStart', function () {

                                                // parent.postMessage('showSkip', "*");
                                                var skipButton = $("<div class='change-ad-opt-test-button'></div>")
                                                skipButton.on('click', () => {
                                                    // player.currentTime(player.duration())
                                                    player.trigger('vast.adEnd');
                                                })
                                                $('.custom-player-wrapper').append(skipButton)

                                                if (config['video-config']['external-video'].enabled) {
                                                    overridePrerollWithExternalVideo(config['video-config']['external-video'].renditions.mp4);
                                                    player.play();
                                                }
                                                if (!$("#ivc-custom-video-player").hasClass('vjs-has-started')) {
                                                    $('#ivc-custom-video-player').addClass('vjs-has-started');
                                                }
                                                if (config.extras.cc.enabled) {
                                                    player.addRemoteTextTrack({
                                                        "label": "captions on",
                                                        "kind": "subtitles",
                                                        "src": config.extras.cc.url
                                                    }, false);
                                                }

                                                if (config.extras.transcript.enabled && !document.getElementById('transcript')) {
                                                    setTimeout(function ()//transcript cue on ios are available only after the video starts playing.
                                                    {
                                                        var transcriptOptions =
                                                            {
                                                                showTrackSelector: true,
                                                                scrollToCenter: true
                                                            };
                                                        var transcript = player.transcript(transcriptOptions);
                                                        var transcriptContainer = $('<div id="transcript">');
                                                        transcriptContainer.append(transcript.el());
                                                        $('.vjs-video-container').append(transcriptContainer);
                                                        addTranscriptButton($('.vjs-control-bar'));
                                                    }, 200);
                                                }
                                                try {
                                                    $('.VPAID-container iframe')[0].contentWindow.addEventListener("message", receivePostMsgFromCreative, false);
                                                } catch (e) {
                                                }
                                                ;

                                                player.on('play', function () {
                                                });
                                                player.on('pause', function () {
                                                });
                                            });

                                            player.on('vast.adEnd', function () {
                                                $('#video-player_html5_api').attr('src', DEFAULT_VIDEO);
                                                player.currentTime(player.duration());
                                                // showPlayButton();
                                                // var x = new XMLHttpRequest();
                                                // x.onreadystatechange = function () {
                                                //     if (x.readyState == 4 && x.status == 200) {
                                                //         var parser = new DOMParser();
                                                //         var xmlDoc = parser.parseFromString(x.response, "text/xml");
                                                //         // console.log(creatives[9])
                                                //         var companion = xmlDoc.getElementsByTagName('CompanionAds')[0].getElementsByTagName('IFrameResource')[0]
                                                //         console.log('companion', companion)
                                                //         var companionURL = companion.textContent
                                                //         var iframe = document.createElement('iframe');
                                                //         iframe.src = companionURL;
                                                //         iframe.className = 'end-card-container'
                                                //         var div = $("<div class='vjs-video-container'></div>")
                                                //         $('.custom-player-wrapper').html(iframe);
                                                //         // var replayAdButton = $("<button class='change-ad-opt-test-button'>REPLAY AD</button>");
                                                //         // $('.custom-player-wrapper').append(replayAdButton)
                                                //         parent.postMessage('showReplay', '*')
                                                //         replayAdButton.on('click', () => {
                                                //             $('.custom-player-wrapper').html(div)
                                                //             injectCustomCSS(CONFIG_LOCATION + customPlayerID + '.css');
                                                //             loadPlayerConfig(CONFIG_LOCATION + customPlayerID + '.json');
                                                //         })

                                                //     }
                                                // };
                                                // x.open("GET", adTagUrl, true);
                                                // x.send()
                                                // if(companionPresent) {
                                                //     $('.custom-player-wrapper').html(iframe);
                                                // }
                                                // else {
                                                //     initTagWithPlayer(config,adTagUrl)
                                                // }
                                                if (companionPresent && !isCompanionOnDom) {
                                                    isCompanionOnDom = true;
                                                    iframe.style = 'visibility:visible';
                                                    document.querySelector('.vjs-video-container').style = 'visibility:hidden';

                                                } else if (!companionPresent) {
                                                    // initTagWithPlayer(config, adTagUrl);
                                                }
                                                document.querySelector('.change-ad-opt-test-button').style = 'visibility:hidden';
                                                // $('.custom-player-wrapper').html(iframe);
                                                // parent.postMessage('showReplay', '*')
                                            });
                                            player.on('vast.reset', function () {

                                            });


                                        }
                                    });
                                }
                            } else {
                                alert('This VAST tag contains no end card and therefore is not compatible with this player')
                                return

                            }
                        }

                    })
    




                }
            },
            error: function (error) {
                alert('Something went wrong. Please try again later. Error details: ' + error)
            }
        })




    }
    function updateCustomPlayer(event) {
        var eventData;
        try {
            eventData = JSON.parse(event.data);
            console.log('event', event)
        }
        catch (e) {
            //return;
        }

        if (eventData.type === 'config') {
            initTagWithPlayer(eventData.config);
        }
    }

    function enableScrubbing() {
        $('.vjs-progress-control').addClass('enable-scrubbing');
    }

    function applyPlayerStyle(style) {
        console.log("applyPlayerStyle : ", style.controlBar['bg-color']);
        $('.video-js .vjs-control-bar').css({
            'background-color': '#ff0000 !important',
            'color': '#ff0000 !important'
        });
    }

    function overridePrerollWithExternalVideo(vidURL) {
        $('#video-player_html5_api').attr('src', vidURL);
    }

    function showPlayButton() {
        $('#ivc-custom-video-player').removeClass('vjs-has-started');
        var playButton = $('.vjs-big-play-button');
        playButton.onclick = function () {
            console.log("playButton.onclick");
            window.location.reload();
        };
    }

    function receivePostMsgFromCreative(event) {

        var eventData;
        try {
            eventData = JSON.parse(event.data);
        }
        catch (e) {
            return;
        }
        switch (eventData.type) {
        }
    }

    function createVideoEl(config, container, cb) {
        var shouldAutoplay = (config['player-config']['auto-play']);
        container.innerHTML = '<video class="video-js vjs-default-skin vjs-big-play-centered" controls playsinline webkit-playsinline preload="none" id="ivc-custom-video-player" poster="' + config['video-config']['poster-image'] + '">' +
            '<source src="' + DEFAULT_VIDEO + '" type="video/mp4"/>' +
            '</video>';



        var controlsBarHeight = (!config['player-config'].controlBar['auto-hide'] && config['player-config'].controlBar.enabled) ? 30 : 0;

        if (controlsBarHeight) {
            var time = 500;

            setTimeout(function () {
                $(window).resize(function () {
                    var videoPlayerHeight = $(window).height() - controlsBarHeight;
                    console.log($(window).height())
                    $('#ivc-custom-video-player').css({ height: videoPlayerHeight + 'px' });
                });
            }, time)
        }
        else {
            var time = 50;
            $(window).resize(function () {
                $('#ivc-custom-video-player').css({ height: '100%' });

            });
        }

        setTimeout(function () {
            var videoEl = container.querySelector('.video-js');
            (shouldAutoplay) ? videoEl.setAttribute('autoplay', 'true') : '';
            var videoPlayerHeight = $(window).height() - controlsBarHeight;
            cb(videoEl);
            $('#ivc-custom-video-player').css({ height: videoPlayerHeight + 'px' });
        }, time);
    }

    function addTranscriptButton(el) {
        var tsBtn = '<div class="vjs-transcript-button vjs-control vjs-button">' +
            '<button class="vjs-transcript-btn vjs-button" type="button" aria-live="polite" aria-disabled="false" title="Captions" aria-haspopup="true" aria-expanded="false">' +
            '<span aria-hidden="true" class="vjs-icon-placeholder"></span>' +
            '<span class="vjs-control-text">transcript</span>' +
            '</button>' +
            '</div>';

        el.append(tsBtn);
        $(".vjs-transcript-button").click(function () {
            $("#transcript").toggleClass('visible');
            if ($("#transcript").hasClass('visible')) {
                sendPostMsg("ad_transcript_on");
            } else {
                sendPostMsg("ad_transcript_off");
            }
        });
    }

    function sendPostMsg(event) {
        postmsgobj = { ccevent: event };
        window.postMessage(JSON.stringify(postmsgobj), '*');
    }

    function molVastSetup(opts) {
        var player = this;
        var options = extend({}, this.options_, opts);
        var pluginSettings = {
            playAdAlways: true,
            techOrder: ["html5"],
            adCancelTimeout: options.adCancelTimeout || 3000,
            adsEnabled: !!options.adsEnabled
        };
        if (options.adTagUrl) {
            pluginSettings.adTagUrl = options.adTagUrl;
        }
        if (options.adTagXML) {
            pluginSettings.adTagXML = options.adTagXML;
        }
        var vastAd = player.vastClient(pluginSettings);
        player.on('reset', function () {
            if (player.options().plugins['ads-setup'].adsEnabled) {
                vastAd.enable();
            } else {
                vastAd.disable();
            }
        });
        player.on('vast.aderror', function (evt) {
            var error = evt.error;
            console.log('hello')
            if (error && error.message) {
                messages.error(error.message);
            }
        });
    }

    function extend(obj) {
        var arg, i, k;
        for (i = 1; i < arguments.length; i++) {
            arg = arguments[i];
            for (k in arg) {
                if (arg.hasOwnProperty(k)) {
                    if (isObject(obj[k]) && !isNull(obj[k]) && isObject(arg[k])) {
                        obj[k] = extend({}, obj[k], arg[k]);
                    } else {
                        obj[k] = arg[k];
                    }
                }
            }
        }
        return obj;
    }

    function isObject(obj) {
        return typeof obj === 'object';
    }

    function getUrlVars(url) {
        if (typeof url === 'undefined') url = window.location.href;
        var vars = [],
            hash;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    function setTimestamp(str) {
        return str.replace('[timestamp]', Date.now())
    }
};




//Controls options and order
/*
 children: [
 "playToggle",
 "muteToggle",
 "volumePanel",
 "currentTimeDisplay",
 "timeDivider",
 "durationDisplay",
 "progressControl",
 "liveDisplay",
 "remainingTimeDisplay",
 "customControlSpacer",
 "playbackRateMenuButton",
 "chaptersButton",
 "descriptionsButton",
 "subsCapsButton",
 "audioTrackButton",
 "chromeCastButton",
 "ResolutionButton",
 "fullscreenToggle"
 ]*/
