(function (cdnHost, securedCdnHost) {

    var previewPlayer;

    $(document).ready(function () {

        initPlayer({})
        document.querySelector('form').onsubmit = function (e) {
            e.preventDefault();
            var message = document.getElementById('tagInput').value;
            document.getElementById('tagInput').value = ""
            var obj = {}
            obj.tag = message;
            if (message) {
                initPlayer(obj)
            }
            
        }

        //event listener
        var eventMethod = window.addEventListener
            ? "addEventListener"
            : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === "attachEvent"
            ? "onmessage"
            : "message";

        //Message Event Handler  
        eventer(messageEvent, function (e) {
            if (e.data === 'showReplay') {
                var replayAdButton = $("<button class='button'>REPLAY AD</button>");
                replayAdButton.on('click', () => {
                    var iframe = document.querySelector('iframe')
                    console.log('this de iframe', iframe)
                    iframe.contentWindow.postMessage('replayTrigger', "*");
                })
                $('.skip-replay-container').html(replayAdButton)
                
            } else if (e.data = 'showSkip') {
                var skipAdButton = $("<button class='button'>Skip to End Card</button>");
                skipAdButton.on('click', () => {
                    var iframe = document.querySelector('iframe')
                    console.log('this de iframe', iframe)
                    iframe.contentWindow.postMessage('skipTrigger', "*");
                })
                $('.skip-replay-container').html(skipAdButton)

            }
        });

    });





    function getAdUrl(params) {

        
        return {
            forMobile: function () {
                if (params.tag) {
                    
                    //make relative path
                    return '../embeddable_player/index.html?playerID=configMobile&tag=' + encodeURIComponent(params.tag)
                    // return 'http://localhost:8080/?playerID=configMobile&tag=' + encodeURIComponent(params.tag)
                }
                else {
                    return '../embeddable_player/index.html?playerID=configMobile&tag=DEFAULT'
                    // return '../embeddable_player/index.html?playerID=configMobile&tag=' + encodeURIComponent('https://rtr.innovid.com/r1.5a4fc10f834029.15254086')
                    // return 'http://localhost:8080/?playerID=configMobile&tag=' + encodeURIComponent('https://rtr.innovid.com/r1.5a4fc10f834029.15254086')
                }


               
            },
            forDesktop: function () {
                if (params.tag) {
                    return '../embeddable_player/index.html?playerID=config&tag=' + encodeURIComponent(params.tag)
                    // return 'http://localhost:8080/?playerID=config&tag=' + encodeURIComponent(params.tag)
                }
                else {
                    return '../embeddable_player/index.html?playerID=configMobile&tag=DEFAULT'
                    // return '../embeddable_player/index.html?playerID=config&tag=' + encodeURIComponent('https://rtr.innovid.com/r1.5a4fc10f834029.15254086')
                    // return 'http://localhost:8080/?playerID=config&tag=' + encodeURIComponent('https://rtr.innovid.com/r1.5a4fc10f834029.15254086')
                }
                
            }
        };
    }

    function initPlayer(params) {

        $('#previewPlayer').html('')



        previewPlayer = new PreviewPlayer(getAdUrl(params));
        previewPlayer.enableDevices(params.smartphone, params.tablet, params.desktop);
        previewPlayer.setDefaultDevice(params.default);
        previewPlayer.setDefaultOrientation(params.orientation);
        previewPlayer.displayIn($('#previewPlayer'));
    }

})(getCdnHost(), getSecuredCdnHost());
