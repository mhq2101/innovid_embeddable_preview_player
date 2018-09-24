(function (cdnHost, securedCdnHost) {

    var previewPlayer;

    $(document).ready(function () {
        var sharePresent = false;

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
                <button id="share-button" style=display:none>
              </form>
        </div>`)
            initPlayer({})
            document.querySelector('form').onsubmit = function (e) {
                if($('#share-button')) {
                    $('#share-button').css('display','none');
                    sharePresent = false;
                }
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

        var shareButton = $('#share-button');
        $('#tag-form').append(shareButton)
        shareButton.click(function (e) {
            e.preventDefault();
            shareButton.prop("disabled", true);
            var currentAdTag = decodeURIComponent(document.querySelector('iframe').src).split('&tag=')[1]
            console.log(currentAdTag);
            var currentText = document.getElementById('tagInput').value;
            var modal = $('.modal');
            $('.modal').css('display', 'flex')      
            document.getElementById('tagOutput').value = window.location.href + '?tag=' + encodeURIComponent(currentAdTag)
            
        })
        // When the user clicks on the button, open the modal 
        shareButton.onclick = function () {
            modal.style.display = "flex";
        }

        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            $('.modal').css('display', 'none')
            shareButton.prop("disabled", false);
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {

            if (event.target == document.getElementById('myModal')) {
                $('.modal').css('display', 'none')
                shareButton.prop("disabled", false);
            }
        }

        $('#copy-link').click(function (e) {
            e.preventDefault();
            document.getElementById('tagOutput').select()
            document.execCommand("copy");
            alert("Copied the text: " + document.getElementById('tagOutput').value);
            $('.modal').css('display', 'none')
            shareButton.prop("disabled", false);
        })




       
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
                
                
                if (!sharePresent) {
                    shareButton.css('display', 'block')
                    console.log('haksjd')
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
