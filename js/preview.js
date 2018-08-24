(function (cdnHost, securedCdnHost) {

    var previewPlayer;

    $(document).ready(function () {

        if (window.location.search.split('?tag=')[1]) {
            initPlayer({
                tag: decodeURIComponent(window.location.search.split('?tag=')[1]),
                default: defaultPlayer
            })
        }
        else {
            $('body').append(`<div class="tag-form-container">
            <form id='tag-form'> 
                <br>
                <input placeholder="paste your tag here" id='tagInput' type="text" name="message" autocomplete="off"><br>
                <button type="submit" id="submit"> Load Tag </button>
              </form>
        </div>`)
            initPlayer({})
            document.querySelector('form').onsubmit = function (e) {
                e.preventDefault();
                var message = document.getElementById('tagInput').value;
                var obj = {}
                obj.tag = message;
                obj.default = defaultPlayer;
                if (message) {
                    initPlayer(obj)
                }

            }
        }



        var sharePresent = false;
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
            if (e.data === 'showShare') {
                var shareButton = $('<button id="share-button">');
                console.log('this thing happeed')
                shareButton.click(function (e) {
                    e.preventDefault();
                    shareButton.prop("disabled",true);
                    var currentAdTag = decodeURIComponent(document.querySelector('iframe').src).split('&tag=')[1]
                    console.log(currentAdTag);
                    var currentText = document.getElementById('tagInput').value;
                    var newTextField = $(`<div class="tag-form-container2">
                    Share Link: <div id='tag-form2'> 
                        <br>
                        <input id='tagOutput' type="text" name="message" autocomplete="off"><br>
                        <button id=copy-link> copyLink </button>
                      </form>
                </div>`)
                    
                    $('body').append(newTextField)
                    $('#copy-link').click(function (e) {
                        e.preventDefault();
                        document.getElementById('tagOutput').select()
                        document.execCommand("copy");
                        alert("Copied the text: " + document.getElementById('tagInput').value);
                        $('.tag-form-container2').remove();
                    })
                    document.getElementById('tagOutput').value = window.location.href + '?tag=' + encodeURIComponent(currentAdTag)
                    // document.getElementById('tagOutput').select()
                    // document.execCommand("copy");
                    // alert("Copied the text: " + document.getElementById('tagInput').value);
                })
                if(!sharePresent) {
                    $('#tag-form').append(shareButton)
                    sharePresent = true;
                }
                
            }
            // if (e.data === 'showReplay') {
            //     var replayAdButton = $("<button class='button'>REPLAY AD</button>");
            //     replayAdButton.on('click', () => {
            //         var iframe = document.querySelector('iframe')
            //         console.log('this de iframe', iframe)
            //         iframe.contentWindow.postMessage('replayTrigger', "*");
            //     })
            //     $('.skip-replay-container').html(replayAdButton)

            // } else if (e.data = 'showSkip') {
            //     var skipAdButton = $("<button class='button'>Skip to End Card</button>");
            //     skipAdButton.on('click', () => {
            //         var iframe = document.querySelector('iframe')
            //         console.log('this de iframe', iframe)
            //         iframe.contentWindow.postMessage('skipTrigger', "*");
            //     })
            //     $('.skip-replay-container').html(skipAdButton)

            // }
        });

    });





    function getAdUrl(params) {


        return {
            forMobile: function () {
                if (params.tag) {

                    //make relative path
                    return 'embeddable_player/index.html?playerID=configMobile&tag=' + encodeURIComponent(params.tag)

                }
                else {
                    return 'embeddable_player/index.html?playerID=configMobile&tag=DEFAULT'

                }



            },
            forDesktop: function () {
                if (params.tag) {
                    return 'embeddable_player/index.html?playerID=config&tag=' + encodeURIComponent(params.tag)

                }
                else {
                    return 'embeddable_player/index.html?playerID=configMobile&tag=DEFAULT'

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
        // var shareButton = $('<button id="share-button"></div>');
        // shareButton.onclick = function (e) {
        //     e.preventDefault();
        //     var currentText = document.getElementById('tagInput').value;
        //     document.getElementById('tagInput').value = window.location.href + '?tag=' + encodeURIComponent(currentText)
        //     document.getElementById('tagInput').select()
        //     document.execCommand("copy");
        //     alert("Copied the text: " + document.getElementById('tagInput').value);

        // }
        // $('#tag-form').append(shareButton)

    }

})(getCdnHost(), getSecuredCdnHost());
