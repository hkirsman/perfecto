// Perfecto
(function($) {
  $(document).ready(function() {

    var
    perfecto__mouse_x,
    perfecto__mouse_y,
    perfecto__body = $("body");

    $(document).mousemove(function(e) {
        perfecto_mouse_x = e.pageX;
        perfecto_mouse_y = e.pageY;
    });

    /**
     * Get url property
     * @param string name parameter name to get from url
     */
    function gup( name )
    {
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );
        if( results == null )
            return "";
        else
            return results[1];
    }

    /**
     * Show design overlay on page
     */
    (function() {
        var file = gup('overlay');

        var
        imageoverlay_wrap = $('#perfecto__imageoverlaycontrols_wrap'), // the image over
        imageoverlaycontrols = $('#perfecto__imageoverlaycontrols'),
        imageoverlaycontrols_mousehook = $('#perfecto__imageoverlaycontrols_mousehook'),
        page = (document.location+'').split('/')[4].replace('.html', '').split('?')[0],
        opacity = $.cookie('perfecto__imageoverlaycontrols_opacity')?$.cookie('perfecto__imageoverlaycontrols_opacity'):0.4,
        top = $.cookie('overlay_position_y')?$.cookie('overlay_position_y'):0,
        left = $.cookie('overlay_position_x')?$.cookie('overlay_position_x'):0,
        lock = false,
        dragging = false,
        overlay_position_x,
        overlay_position_y,
        drag_start_x,
        drag_start_y,
        overlay_visible = $.cookie('perfecto__imageoverlaycontrols_visible')?$.cookie('perfecto__imageoverlaycontrols_visible'):'false',
        move10px = false;

        if (file.length==0) {
            alert('Add file');
            return false;
        }


        file = Drupal.settings.basePath + 'sites/default/files/perfecto/' + file + '.png';

        var overlay = $('<img id="perfecto__imageoverlaycontrols_img" src="' + file + '" alt="" />');
        overlay.css({
            "position": "absolute",
            "z-index" : -99999,
            "top"     : top+"px",
            "left"     : left+"px",
            "opacity" : opacity,
            "display" : overlay_visible==='true'?'block':'none'
        });

        // drag the overlay via small div under cursor
        var draggable_handle = $('<div id="perfecto_draggable_handle"></div>');
        draggable_handle.css("position", "absolute"); // chrome fix
        draggable_handle.draggable({
            start: function(e, ui) {
                drag_start_y = ui.position.top;
                drag_start_x = ui.position.left;

                var offset_overlay = overlay.offset();
                var offset_draggable_handle = draggable_handle.offset();
                overlay_position_x = offset_overlay.left;
                overlay_position_y = offset_overlay.top;
                draggable_handle_drag_start_x = offset_draggable_handle.top;
                draggable_handle_drag_start_y = offset_draggable_handle.left;

                dragging = true;
            },
            stop: function(e, ui) {
                var offset_overlay = overlay.offset();
                dragging = false;
                overlay_position_x = offset_overlay.left;
                overlay_position_y = offset_overlay.top;

                $.cookie("overlay_position_y", overlay_position_y);
                $.cookie("overlay_position_x", overlay_position_x);
            },
            drag: function(e, ui) {
                if (lock || !e.ctrlKey) {
                    return false;
                }
                top = ui.position.top;
                left = ui.position.left;

                overlay.css({
                    "top": overlay_position_y + top - drag_start_y+"px",
                    "left": overlay_position_x + left - drag_start_x +"px"
                });

                dragging = true;
            }
        });

        $( "#perfecto__imageoverlaycontrols-opacity-slider" ).slider({
            value:opacity,
            min: 0,
            max: 1,
            step: 0.1,
            slide: function( event, ui ) {
                $.cookie("perfecto__imageoverlaycontrols_opacity", ui.value);

                //$("#overlayOpacity").val(ui.value);
                perfecto__body.css({
                    "opacity": ui.value
                });
            }
        });

        perfecto__body.after(imageoverlay_wrap);
        $('#perfecto__imageoverlaycontrols').disableSelection();
        perfecto__body.after(draggable_handle);
        perfecto__body.after(overlay);

        $("#resetToggle").click(function() {
            top = left = 0;
            $.cookie("overlay_position_y", top);
            $.cookie("overlay_position_x", left);
            overlay.css({
                "top"     : top+"px",
                "left"    : left+"px"
            });
        });

        if (overlay_visible==="true") {
            perfecto__body.css({
                "opacity": opacity
            });
        }

        $("#perfecto__imageoverlaycontrols_toggle").click(function() {
            if (overlay_visible==="true") {
                overlay_visible = "false";
                perfecto__body.css({
                    "opacity": 1
                })
            } else {
                overlay_visible = "true";
                perfecto__body.css({
                    "opacity": opacity
                })
            }
            $.cookie("perfecto__imageoverlaycontrols_visible", overlay_visible);

            /*if (opacity != 0) {
                opacity = 0;
            } else {
                opacity = $("#overlayOpacity").val();
            }
            */
            $("#perfecto__imageoverlaycontrols_img").toggle();
            $(this).blur();
        });

        /*
        $(document).keyup( function(e) {

            if (lock) {
                return false;
            }

            if (e.ctrlKey ) {
                e.isDefaultPrevented();

                if (e.shiftKey) {
                    var step = 10;
                } else {
                    var step = 1;
                }

                if (e.keyCode==38) { // up
                    top -=  step;
                } else if ( e.keyCode==40) { // down
                    top +=  step;
                } else if ( e.keyCode==37) { // left
                    left -= step;
                } else if ( e.keyCode==39) { // right
                    left += step;
                }

                $.cookie("psdOverlayTop", top);
                $.cookie("psdOverlayLeft", left);

                if ( e.keyCode==38 || e.keyCode==40 ) { // up or down
                    overlay.css({
                        "top"     : top+"px"
                    });
                } else if ( e.keyCode==37 || e.keyCode==39 ) {
                    overlay.css({
                        "left"     : left+"px"
                    });
                }
                return false;
            }
        });

             */
        $("#overlayFile").keyup( function(e) {
            if (lock) {
                return false;
            }

            file =  $("#overlayFile").val();
            $.cookie("psdOverlayFile", file);

            //$("#overlayImg").attr("src", "/"+site+"/overlays/"+file);
        });

        // This creates little draggable div under cursor when ctrl key is held
        // down. Firefox can't move it fast enough thoug.
        $(window).keydown( function(e) {
            if (e.ctrlKey && !dragging && overlay_visible=='true' ) {
                draggable_handle.css({
                    "display" : "block",
                    "left": perfecto_mouse_x-25+"px",
                    "top" : perfecto_mouse_y-25+"px"
                });
            }
            if (e.shiftKey) {
                move10px = true;
            }
        });

        $(window).keyup( function(e) {
            draggable_handle.css({
                "display" : "none"
            });
            move10px = false;
        });


        $("#overlayLock").click(function(e) {
            if ( this.checked ) {
                lock = true;
            } else {
                lock = false;
            }
        });

        // overlay move
        var overlay_mover_jquery_selector = "#perfecto__xmover-left, "+
        "#perfecto__xmover-right, "+
        "#perfecto__ymover-down, "+
        "#perfecto__ymover-up";
        $(overlay_mover_jquery_selector).click(function(e) {

            if (lock) {
                return false;
            }

            var overlay_position_y = $.cookie("overlay_position_y")*1.0;
            var overlay_position_x = $.cookie("overlay_position_x")*1.0;
            var movestep;
            if ( move10px ) {
                movestep = 10;
            } else {
                movestep = 1;
            }

            if (this.id=="perfecto__xmover-left") {
                overlay_position_x = overlay_position_x - movestep;
                $("#perfecto__imageoverlaycontrols-xmover-input").val(overlay_position_x);
            } else if (this.id=="perfecto__xmover-right") {
                overlay_position_x = overlay_position_x + movestep;
                $("#perfecto__imageoverlaycontrols-xmover-input").val(overlay_position_x);
            } else if (this.id=="perfecto__ymover-up") {
                overlay_position_y = overlay_position_y - movestep;
                $("#perfecto__imageoverlaycontrols-ymover-input").val(overlay_position_y);
            } else if (this.id=="perfecto__ymover-down") {
                overlay_position_y = overlay_position_y + movestep;
                $("#perfecto__imageoverlaycontrols-ymover-input").val(overlay_position_y);
            }
            overlay.css({
                "top": overlay_position_y+"px",
                "left": overlay_position_x +"px"
            });
            $.cookie("overlay_position_y", overlay_position_y);
            $.cookie("overlay_position_x", overlay_position_x);
        });

        imageoverlay_wrap.bind({
            mouseenter: function() {
                imageoverlaycontrols.css({
                    "display": "block"
                });
            },
            mouseleave: function() {
                if (overlay_visible!=="true") {
                    imageoverlaycontrols.css({
                        "display": "none"
                    });
                }

            }
        })

    })();

  });
})(jQuery);